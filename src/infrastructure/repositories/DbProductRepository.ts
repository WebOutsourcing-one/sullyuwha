import type { ProductRepository } from "@/domain/repositories/ProductRepository";
import type { Product } from "@/domain/entities/Product";
import { assetKey } from "@/domain/value-objects/AssetKey";
import { getPrisma } from "@/infrastructure/db/prisma";

export class DbProductRepository implements ProductRepository {
  async getCollection(): Promise<readonly Product[]> {
    const prisma = getPrisma();
    const rows = await prisma.product.findMany({
      orderBy: { sortOrder: "asc" },
      include: { images: { orderBy: { sortOrder: "asc" as const } } },
    });
    return rows.map(toProduct);
  }

  async getById(id: string): Promise<Product | null> {
    const prisma = getPrisma();
    const row = await prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" as const } } },
    });
    return row ? toProduct(row) : null;
  }
}

type RowWithImages = {
  id: string;
  name: string;
  category: string;
  material: string;
  description: string;
  imageAssetKey: string;
  imageAlt: string;
  imageAspectRatio: number | null;
  imageExt: string | null;
  tags: unknown;
  story: string | null;
  specs: unknown;
  care: unknown;
  sortOrder: number;
  images: { assetKey: string; alt: string; aspectRatio: number | null; ext: string | null; sortOrder: number }[];
};

function toProduct(row: RowWithImages): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    material: row.material,
    description: row.description,
    image: {
      asset: assetKey(row.imageAssetKey),
      alt: row.imageAlt,
      aspectRatio: row.imageAspectRatio ?? undefined,
      ext: row.imageExt ?? undefined,
    },
    gallery: row.images.map((img) => ({
      asset: assetKey(img.assetKey),
      alt: img.alt,
      aspectRatio: img.aspectRatio ?? undefined,
      ext: img.ext ?? undefined,
    })),
    tags: row.tags as string[],
    story: row.story ?? undefined,
    specs: row.specs ? (row.specs as { label: string; value: string }[]) : undefined,
    care: row.care ? (row.care as string[]) : undefined,
  };
}
