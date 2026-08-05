import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/infrastructure/db/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { toProductData, validateProductInput } from "@/lib/product-input";
import { denyCrossOrigin } from "@/lib/same-origin";
import { PRODUCT_WRITE_LIMIT, enforceRateLimit } from "@/lib/rate-limit";

/**
 * 관리자 상품 목록.
 *
 * 목록 화면이 쓰는 칸만 고른다. 예전에는 전체 행을 그대로 내려보냈는데,
 * 상세 콘텐츠(`detail` JSON)·스토리·스펙·관리방법과 모든 부가 이미지까지 실려
 * 상품 수에 비례해 응답이 급격히 커졌다. 목록에는 하나도 쓰이지 않는 값들이다.
 */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const prisma = getPrisma();
  const products = await prisma.product.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      category: true,
      material: true,
      price: true,
      sortOrder: true,
      // 목록 썸네일 — 없으면 화면이 대표 컷으로 대체한다.
      thumbnailAssetKey: true,
      thumbnailAlt: true,
      thumbnailExt: true,
      imageAssetKey: true,
      imageAlt: true,
      imageExt: true,
    },
  });
  return NextResponse.json(products);
}

/**
 * 자동 상품 ID — 기존 `product-N` 가운데 가장 큰 N에 1을 더한다.
 * 상품명 기반 슬러그 등 다른 형식의 기존 ID는 무시하고, 그런 ID만 있으면 product-1부터 시작한다.
 */
function nextProductId(ids: string[]): string {
  let max = 0;
  for (const id of ids) {
    const match = /^product-(\d+)$/.exec(id);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `product-${max + 1}`;
}

/** 상품 하나를 만드는 데 필요한 양은 이 정도면 충분하다(상세 콘텐츠 포함). */
const MAX_BODY_BYTES = 256 * 1024;


export async function POST(request: NextRequest) {
  const crossOrigin = denyCrossOrigin(request);
  if (crossOrigin) return crossOrigin;

  const denied = await requireAdmin();
  if (denied) return denied;

  const limited = enforceRateLimit(request, PRODUCT_WRITE_LIMIT);
  if (limited) return limited;

  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "요청이 너무 큽니다." }, { status: 413 });
  }

  // 본문이 JSON이 아니면 여기서 끊는다. 잡지 않으면 예외가 그대로 새어 나가
  // 스택이 실린 500이 나간다.
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
  const invalid = validateProductInput(body);
  if (invalid) {
    return NextResponse.json({ error: invalid }, { status: 400 });
  }

  const prisma = getPrisma();

  const requestedId = typeof body.id === "string" ? body.id.trim() : "";

  // 정렬순서 최솟값은 DB가 계산하게 둔다. 예전에는 전체 행을 읽어 와
  // `Math.min(...배열)`로 구했는데, 상품이 늘수록 통째로 읽는 비용이 커지고
  // 인자 전개는 배열이 아주 커지면 터진다.
  const [minSort, existingIds] = await Promise.all([
    prisma.product.aggregate({ _min: { sortOrder: true } }),
    // ID 자동 생성에 필요한 것은 `product-N` 형태뿐이다.
    requestedId
      ? Promise.resolve([])
      : prisma.product.findMany({
          where: { id: { startsWith: "product-" } },
          select: { id: true },
        }),
  ]);

  const id = requestedId || nextProductId(existingIds.map((p) => p.id));

  // 정렬순서를 안 보내면 새 상품이 목록 맨 앞에 오도록 가장 작은 값 - 1을 준다.
  // (컬렉션은 sortOrder 오름차순 정렬이라 새 상품이 최신순으로 앞에 붙는다)
  const sortOrder =
    typeof body.sortOrder === "number"
      ? body.sortOrder
      : Math.min(minSort._min.sortOrder ?? 0, 0) - 1;

  const exists = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (exists) {
    return NextResponse.json({ error: "이미 존재하는 상품 ID입니다" }, { status: 409 });
  }

  const product = await prisma.product.create({
    data: { id, ...toProductData(body), sortOrder },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  return NextResponse.json(product, { status: 201 });
}
