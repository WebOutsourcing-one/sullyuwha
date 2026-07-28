import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/infrastructure/db/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { toPrice } from "@/lib/price";
import { denyCrossOrigin } from "@/lib/same-origin";

type RouteParams = { params: Promise<{ id: string }> };

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

  const { id } = await params;
  const body = await request.json();
  const prisma = getPrisma();

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        category: body.category,
        material: body.material,
        description: body.description,
        price: toPrice(body.price),
        imageAssetKey: body.imageAssetKey,
        imageAlt: body.imageAlt,
        imageAspectRatio: body.imageAspectRatio ?? null,
        imageExt: body.imageExt ?? null,
        tags: body.tags ?? [],
        story: body.story ?? null,
        specs: body.specs ?? null,
        care: body.care ?? null,
        sortOrder: body.sortOrder ?? 0,
      },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });
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

  const { id } = await params;
  const prisma = getPrisma();

  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (isNotFound(error)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.error("[admin/products] delete failed", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
