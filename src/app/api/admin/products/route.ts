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

export async function POST(request: NextRequest) {
  const crossOrigin = denyCrossOrigin(request);
  if (crossOrigin) return crossOrigin;

  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json();
  const prisma = getPrisma();

  const existing = await prisma.product.findMany({ select: { id: true, sortOrder: true } });

  // ID를 안 보내거나 비워 보내면 자동으로 붙인다. (product-1, product-2 …)
  const id = body.id?.trim() || nextProductId(existing.map((p) => p.id));

  // 정렬순서를 안 보내면 새 상품이 목록 맨 앞에 오도록 가장 작은 값 - 1을 준다.
  // (컬렉션은 sortOrder 오름차순 정렬이라 새 상품이 최신순으로 앞에 붙는다)
  const sortOrder = body.sortOrder ?? Math.min(...existing.map((p) => p.sortOrder), 0) - 1;

  const exists = await prisma.product.findUnique({ where: { id } });
  if (exists) {
    return NextResponse.json({ error: "이미 존재하는 상품 ID입니다" }, { status: 409 });
  }

  const product = await prisma.product.create({
    data: {
      id,
      name: body.name,
      category: body.category,
      material: body.material,
      description: body.description,
      price: toPrice(body.price),
      imageAssetKey: body.imageAssetKey,
      imageAlt: body.imageAlt,
      imageExt: body.imageExt ?? null,
      // 빈 문자열은 "썸네일 없음"이다 — null로 눕혀야 화면이 대표 컷으로 대체한다.
      thumbnailAssetKey: body.thumbnailAssetKey || null,
      thumbnailAlt: body.thumbnailAlt || null,
      thumbnailExt: body.thumbnailExt || null,
      tags: body.tags ?? [],
      story: body.story ?? null,
      specs: body.specs ?? null,
      care: body.care ?? null,
      detail: body.detail ?? null,
      sortOrder,
    },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  return NextResponse.json(product, { status: 201 });
}
