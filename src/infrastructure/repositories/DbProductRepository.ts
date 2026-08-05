import type { ProductRepository } from "@/domain/repositories/ProductRepository";
import type {
  Product,
  ProductDetailBlock,
  ProductDetailContent,
} from "@/domain/entities/Product";
import { assetKey } from "@/domain/value-objects/AssetKey";
import type { Image } from "@/domain/value-objects/Image";
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
    tags: row.tags as string[],
    story: row.story ?? undefined,
    specs: row.specs ? (row.specs as { label: string; value: string }[]) : undefined,
    care: row.care ? (row.care as string[]) : undefined,
    detail: toDetail(row.detail),
  };
}

/* ------------------------------------------------------------------
   detail(JSON) → ProductDetailContent
   관리자 폼이 넣은 값을 그대로 신뢰하지 않고 형태를 확인하며 읽는다.
   깨진 항목은 통째로 버려 상세 페이지가 렌더 중에 죽지 않게 한다.
   ------------------------------------------------------------------ */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** 비어 있지 않은 문자열만 통과시킨다(빈 입력칸을 undefined로 접기 위함). */
function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function toDetailImage(raw: unknown): Image | undefined {
  if (!isRecord(raw)) return undefined;
  const key = text(raw.assetKey);
  if (!key) return undefined;
  return {
    asset: assetKey(key),
    alt: typeof raw.alt === "string" ? raw.alt : "",
    aspectRatio: typeof raw.aspectRatio === "number" ? raw.aspectRatio : undefined,
    ext: text(raw.ext),
  };
}

function toBlock(raw: unknown): ProductDetailBlock | undefined {
  if (!isRecord(raw)) return undefined;
  const title = text(raw.title);
  const body = text(raw.body);
  const image = toDetailImage(raw.image);
  // 셋 중 하나라도 있으면 살린다.
  // 예전에는 title과 body를 모두 요구했는데, 관리자가 이미지만 넣은 블록이
  // 저장은 되고 화면에서는 조용히 사라져서 원인을 알기 어려웠다.
  if (!title && !body && !image) return undefined;
  return { title: title ?? "", body: body ?? "", image };
}

function mapDefined<T>(raw: unknown, map: (item: unknown) => T | undefined): readonly T[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const items = raw.map(map).filter((item): item is T => item !== undefined);
  return items.length > 0 ? items : undefined;
}

/**
 * 자리를 유지하며 매핑한다 — 비어 있는 항목은 걸러내지 않고 `null`로 남긴다.
 *
 * mapDefined를 쓸 수 없는 이유 — 관리자가 3칸 중 1·3번만 채웠을 때 2번을
 * 걸러내면 3번이 2번 자리로 당겨져 상세 페이지 배치가 달라진다.
 * 뒤쪽 빈 칸은 화면에 아무것도 만들지 않으므로 잘라낸다.
 */
function mapSlots<T>(
  raw: unknown,
  map: (item: unknown) => T | undefined,
): readonly (T | null)[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const items = raw.map((item) => map(item) ?? null);
  while (items.length > 0 && items[items.length - 1] === null) items.pop();
  return items.length > 0 ? items : undefined;
}

function toDetail(raw: unknown): ProductDetailContent | undefined {
  if (!isRecord(raw)) return undefined;

  const detail: ProductDetailContent = {
    subtitle: text(raw.subtitle),
    tagline: text(raw.tagline),
    intro: text(raw.intro),
    highlight: toBlock(raw.highlight),
    features: mapSlots(raw.features, toBlock),
    modelShots: mapDefined(raw.modelShots, toDetailImage),
    notes: mapDefined(raw.notes, text),
  };

  // 관리자가 상세 섹션을 열기만 하고 비워둔 경우 — 빈 객체를 넘기면
  // 상세 페이지가 빈 섹션을 그리므로, 내용이 하나도 없으면 없는 것으로 본다.
  const hasContent = Object.values(detail).some((value) => value !== undefined);
  return hasContent ? detail : undefined;
}
