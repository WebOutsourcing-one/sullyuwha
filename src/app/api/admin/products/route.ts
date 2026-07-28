import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/infrastructure/db/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { toPrice } from "@/lib/price";
import { denyCrossOrigin } from "@/lib/same-origin";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const prisma = getPrisma();
  const products = await prisma.product.findMany({
    orderBy: { sortOrder: "asc" },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const crossOrigin = denyCrossOrigin(request);
  if (crossOrigin) return crossOrigin;

  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json();
  const prisma = getPrisma();

  const product = await prisma.product.create({
    data: {
      id: body.id,
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

  return NextResponse.json(product, { status: 201 });
}
