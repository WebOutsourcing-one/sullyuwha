import type { Product } from "@/domain/entities/Product";
import { assetKey } from "@/domain/value-objects/AssetKey";
import { toDetail, toDetailImage } from "@/infrastructure/mappers/productDetail";

/**
 * 관리자 폼 → 미리보기 탭으로 저장 전 입력값을 넘기는 localStorage 키.
 *
 * URL 쿼리로 넘기지 않는 이유 — 상세 콘텐츠가 길어 주소 길이 제한에 걸린다.
 * localStorage는 같은 출처의 다른 탭에 `storage` 이벤트를 쏘므로,
 * 폼을 고치면 열려 있는 미리보기 탭이 곧바로 따라 바뀐다.
 */
export const PREVIEW_STORAGE_KEY = "sullyuwha:admin-product-preview";

/** 미리보기 탭의 window 이름 — 버튼을 다시 눌러도 같은 탭을 재사용한다. */
export const PREVIEW_WINDOW_NAME = "sullyuwha-product-preview";

/** 폼이 저장할 때 서버로 보내는 본문과 같은 모양이다(handleSubmit의 body). */
export interface ProductPreviewPayload {
  name: string;
  category: string;
  material: string;
  description: string;
  price: number;
  imageAssetKey: string;
  imageAlt: string;
  imageExt: string | null;
  thumbnailAssetKey: string;
  thumbnailAlt: string;
  thumbnailExt: string;
  tags: unknown;
  story: string;
  specs: unknown;
  care: unknown;
  detail: unknown;
}

/**
 * 대표 컷을 아직 올리지 않았을 때 쓰는 가짜 키.
 * 존재하지 않는 에셋이라 R2Image가 로드에 실패하고 브랜드 플레이스홀더를 보여준다.
 */
const MISSING_COVER_KEY = "__preview__/missing-cover";

/**
 * 저장 전 폼 값을 상세 페이지가 받는 Product로 바꾼다.
 *
 * detail은 DB 리포지토리와 같은 매퍼(toDetail)를 거친다 — 저장 후 실제 페이지와
 * 미리보기가 같은 규칙으로 빈 블록을 걸러내야 둘이 어긋나지 않는다.
 */
export function previewToProduct(p: ProductPreviewPayload): Product {
  const stringArray = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim() !== "") : [];
  const specs = Array.isArray(p.specs)
    ? (p.specs as { label?: unknown; value?: unknown }[])
        .filter((s) => typeof s?.label === "string" && typeof s?.value === "string" && (s.label.trim() || s.value.trim()))
        .map((s) => ({ label: s.label as string, value: s.value as string }))
    : [];
  const care = stringArray(p.care);

  return {
    id: "preview",
    name: p.name.trim() || "상품명 미입력",
    category: p.category || "카테고리 미선택",
    material: p.material,
    description: p.description,
    price: p.price,
    image: {
      asset: assetKey(p.imageAssetKey || MISSING_COVER_KEY),
      alt: p.imageAlt || p.name,
      ext: p.imageExt ?? undefined,
    },
    thumbnail: toDetailImage({
      assetKey: p.thumbnailAssetKey,
      alt: p.thumbnailAlt,
      ext: p.thumbnailExt,
    }),
    gallery: [],
    isBest: false,
    tags: stringArray(p.tags),
    story: p.story.trim() || undefined,
    specs: specs.length > 0 ? specs : undefined,
    care: care.length > 0 ? care : undefined,
    detail: toDetail(p.detail),
  };
}
