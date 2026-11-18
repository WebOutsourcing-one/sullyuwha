/**
 * 상품 detail(JSON) → ProductDetailContent 매퍼.
 *
 * DB 리포지토리와 관리자 미리보기가 **같은 규칙**으로 읽도록 한 곳에 둔다.
 * 미리보기가 따로 변환하면 "미리보기에서는 보였는데 저장 후엔 사라지는" 차이가 생긴다.
 * 순수 함수만 두어 클라이언트 번들에서도 import할 수 있다(Prisma 의존 없음).
 */
import type {
  ProductDetailBlock,
  ProductDetailContent,
} from "@/domain/entities/Product";
import { assetKey } from "@/domain/value-objects/AssetKey";
import type { Image } from "@/domain/value-objects/Image";

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

export function toDetailImage(raw: unknown): Image | undefined {
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

export function toDetail(raw: unknown): ProductDetailContent | undefined {
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
