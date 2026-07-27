import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/infrastructure/db/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
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
  const { id } = await params;
  const body = await request.json();
  const prisma = getPrisma();

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: body.name,
      category: body.category,
      material: body.material,
      description: body.description,
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
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const prisma = getPrisma();
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
