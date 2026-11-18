import type { ProductRepository } from "@/domain/repositories/ProductRepository";
import type { Product } from "@/domain/entities/Product";
import { assetKey } from "@/domain/value-objects/AssetKey";
import { getPrisma } from "@/infrastructure/db/prisma";
import { toDetail, toDetailImage } from "@/infrastructure/mappers/productDetail";

export class DbProductRepository implements ProductRepository {
  async getCollection(): Promise<readonly Product[]> {
    const prisma = getPrisma();
    const rows = await prisma.product.findMany({
      // 최신순은 계약이다(ProductRepository 참고). id를 2차 정렬로 두는 이유 —
      // 같은 시각에 등록된 행끼리 순서가 매번 달라지면 랜딩 카드가 새로고침마다 바뀐다.
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: { images: { orderBy: { sortOrder: "asc" as const } } },
    });
    // 한 행이 깨졌다고 목록 전체가 죽으면 안 된다 — 그 행만 빼고 나머지를 보여준다.
    return rows.map(toProductOrNull).filter((p): p is Product => p !== null);
  }

  async getById(id: string): Promise<Product | null> {
    const prisma = getPrisma();
    const row = await prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" as const } } },
    });
    return row ? toProductOrNull(row) : null;
  }
}

/**
 * 매핑에 실패한 행은 null로 떨어뜨린다.
 *
 * 대표 이미지 키가 비어 있으면 `assetKey()`가 던지는데, 그 예외가 그대로 올라오면
 * **한 행 때문에 컬렉션과 모든 상세 페이지가 500이 된다.** 관리자 폼이 대표 컷을
 * 필수로 막지 않아 실제로 만들어질 수 있는 상태다.
 *
 * 조용히 숨기지 않도록 크게 로그를 남긴다 — 관리자 목록에는 그대로 보이므로
 * (그쪽은 이 매퍼를 거치지 않는다) 이미지를 채워 넣으면 곧바로 복구된다.
 */
function toProductOrNull(row: RowWithImages): Product | null {
  try {
    return toProduct(row);
  } catch (error) {
    console.error(
      "[products] 🚨 상품을 읽지 못해 목록에서 제외했습니다. 대표 이미지를 확인하세요:",
      { id: row.id, name: row.name },
      error,
    );
    return null;
  }
}

type RowWithImages = {
  id: string;
  name: string;
  category: string;
  material: string;
  description: string;
  price: number;
  imageAssetKey: string;
  imageAlt: string;
  imageAspectRatio: number | null;
  imageExt: string | null;
  thumbnailAssetKey: string | null;
  thumbnailAlt: string | null;
  thumbnailExt: string | null;
  tags: unknown;
  story: string | null;
  specs: unknown;
  care: unknown;
  detail: unknown;
  isBest: boolean;
  images: { assetKey: string; alt: string; aspectRatio: number | null; ext: string | null; sortOrder: number }[];
};

function toProduct(row: RowWithImages): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    material: row.material,
    description: row.description,
    price: row.price,
    image: {
      asset: assetKey(row.imageAssetKey),
      alt: row.imageAlt,
      aspectRatio: row.imageAspectRatio ?? undefined,
      ext: row.imageExt ?? undefined,
    },
    // 키가 비어 있으면 필드를 통째로 비운다 — 화면이 대표 컷으로 대체한다.
    thumbnail: toDetailImage({
      assetKey: row.thumbnailAssetKey,
      alt: row.thumbnailAlt ?? row.imageAlt,
      ext: row.thumbnailExt,
    }),
    gallery: row.images.map((img) => ({
      asset: assetKey(img.assetKey),
      alt: img.alt,
      aspectRatio: img.aspectRatio ?? undefined,
      ext: img.ext ?? undefined,
    })),
    isBest: row.isBest,
    tags: row.tags as string[],
    story: row.story ?? undefined,
    specs: row.specs ? (row.specs as { label: string; value: string }[]) : undefined,
    care: row.care ? (row.care as string[]) : undefined,
    detail: toDetail(row.detail),
  };
}
