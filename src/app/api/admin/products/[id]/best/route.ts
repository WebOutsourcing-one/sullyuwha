import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/infrastructure/db/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { denyCrossOrigin } from "@/lib/same-origin";
import { PRODUCT_WRITE_LIMIT, enforceRateLimit } from "@/lib/rate-limit";

type RouteParams = { params: Promise<{ id: string }> };

/** 레코드가 없을 때 Prisma가 던지는 코드. */
const RECORD_NOT_FOUND = "P2025";
/** 유니크 제약 위반. 여기서는 `product_one_best_per_category` 하나뿐이다. */
const UNIQUE_VIOLATION = "P2002";

function prismaCode(error: unknown): string | null {
  return typeof error === "object" && error !== null && "code" in error
    ? ((error as { code?: string }).code ?? null)
    : null;
}

/**
 * BEST COLLECTION 지정/해제 — 분류당 하나만 걸린다.
 *
 * 수정 폼이 아니라 목록에서 토글하는 이유 — 고르는 일은 상품 하나를 들여다보는
 * 작업이 아니라 **같은 분류의 상품들을 견주는** 작업이다. 목록에서 바로 바꿀 수
 * 있어야 "이걸 내리고 저걸 올린다"가 한 화면에서 끝난다.
 *
 * 지정은 두 단계(같은 분류의 기존 베스트 해제 → 이 상품 지정)라 트랜잭션으로 묶는다.
 * 중간에 실패하면 그 분류에 베스트가 하나도 없는 상태로 남는다.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const crossOrigin = denyCrossOrigin(request);
  if (crossOrigin) return crossOrigin;

  const denied = await requireAdmin();
  if (denied) return denied;

  const limited = enforceRateLimit(request, PRODUCT_WRITE_LIMIT);
  if (limited) return limited;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const isBest =
    typeof body === "object" && body !== null && "isBest" in body
      ? (body as { isBest: unknown }).isBest
      : undefined;
  if (typeof isBest !== "boolean") {
    return NextResponse.json({ error: "isBest는 true/false여야 합니다." }, { status: 400 });
  }

  const prisma = getPrisma();

  const target = await prisma.product.findUnique({
    where: { id },
    select: { id: true, category: true },
  });
  if (!target) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    if (isBest) {
      await prisma.$transaction([
        // 먼저 내리고 나서 올린다. 순서를 바꾸면 잠깐이나마 같은 분류에 베스트가
        // 둘이 되어 부분 유니크 인덱스에 걸린다.
        prisma.product.updateMany({
          where: { category: target.category, isBest: true, id: { not: id } },
          data: { isBest: false },
        }),
        prisma.product.update({ where: { id }, data: { isBest: true } }),
      ]);
    } else {
      await prisma.product.update({ where: { id }, data: { isBest: false } });
    }
  } catch (error) {
    if (prismaCode(error) === RECORD_NOT_FOUND) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    // 같은 분류를 두 사람이 동시에 지정하면 인덱스가 한쪽을 막는다.
    // 막힌 쪽에는 다시 시도하면 된다고 알린다 — 조용히 성공으로 넘기면
    // 화면에는 지정된 것처럼 보이는데 실제로는 상대의 선택이 남는다.
    if (prismaCode(error) === UNIQUE_VIOLATION) {
      return NextResponse.json(
        { error: "다른 곳에서 같은 분류의 베스트를 바꿨습니다. 새로고침 후 다시 시도하세요." },
        { status: 409 },
      );
    }
    console.error("[admin/products] best toggle failed", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ id, category: target.category, isBest });
}
