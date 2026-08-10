import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/infrastructure/db/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { toProductData, validateProductInput } from "@/lib/product-input";
import { denyCrossOrigin } from "@/lib/same-origin";
import { PRODUCT_WRITE_LIMIT, enforceRateLimit } from "@/lib/rate-limit";
import { collectProductAssets, deleteUnreferencedAssets } from "@/lib/product-assets";

type RouteParams = { params: Promise<{ id: string }> };

/** 상품 하나를 수정하는 데 필요한 양은 이 정도면 충분하다(상세 콘텐츠 포함). */
const MAX_BODY_BYTES = 256 * 1024;

/** 레코드가 없을 때 Prisma가 던지는 코드. */
const RECORD_NOT_FOUND = "P2025";

function isNotFound(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error &&
    (error as { code?: string }).code === RECORD_NOT_FOUND;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const prisma = getPrisma();
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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

  const { id } = await params;

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

  try {
    // 갱신 전 상태를 먼저 잡아 둔다. 이미지를 교체하면 옛 객체는 어디서도
    // 참조되지 않는데, 갱신한 뒤에는 그게 무엇이었는지 알 방법이 없다.
    const previous = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });

    const product = await prisma.product.update({
      where: { id },
      // 순서에 관한 값은 여기서 건드리지 않는다 — createdAt이 정하고, 수정으로
      // 등록 시각이 바뀌면 오탈자 하나 고쳤을 뿐인데 컬렉션 맨 앞으로 튀어나온다.
      data: toProductData(body),
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });

    if (previous) {
      await deleteUnreferencedAssets(
        collectProductAssets(previous),
        collectProductAssets(product),
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    // Prisma 오류 원문에는 스키마 정보가 섞여 있어 그대로 내보내지 않는다.
    if (isNotFound(error)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.error("[admin/products] update failed", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const crossOrigin = denyCrossOrigin(request);
  if (crossOrigin) return crossOrigin;

  const denied = await requireAdmin();
  if (denied) return denied;

  const limited = enforceRateLimit(request, PRODUCT_WRITE_LIMIT);
  if (limited) return limited;

  const { id } = await params;
  const prisma = getPrisma();

  try {
    // 지우기 전에 무엇을 참조하고 있었는지 읽어 둔다. 행이 사라지면
    // 어떤 객체가 딸려 있었는지 알 수 없어 S3에 영영 남는다.
    const removed = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });

    await prisma.product.delete({ where: { id } });

    // 상품이 실제로 지워진 뒤에 정리한다. 순서를 바꾸면 삭제가 실패했을 때
    // 살아 있는 상품의 이미지를 지운 상태가 된다.
    if (removed) await deleteUnreferencedAssets(collectProductAssets(removed));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isNotFound(error)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.error("[admin/products] delete failed", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
