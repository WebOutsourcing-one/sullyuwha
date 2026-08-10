/**
 * 상품이 들고 있는 에셋 키를 모으고, 더 이상 쓰이지 않는 것을 S3에서 지운다.
 *
 * 업로드는 파일을 고른 즉시 S3에 올라간다(미리보기를 바로 보여주기 위해서다).
 * 그래서 저장·삭제 시점에 정리하지 않으면 쓰이지 않는 객체가 계속 쌓인다.
 */
import { getAssetResolver } from "@/composition/assets.server";
import { S3AssetResolver } from "@/infrastructure/assets/S3AssetResolver";

/** 관리자 업로드가 만드는 키의 접두사. `/api/upload` 의 prefix 와 짝이다. */
const UPLOAD_PREFIX = "products/";

/** 확장자가 없는 논리 키 + 확장자. 실제 객체 키는 `{key}.{ext}` 다. */
export interface AssetRef {
  key: string;
  ext: string;
}

/** 상품 한 건에서 에셋 키가 들어 있는 모든 자리. */
interface ProductAssetSource {
  imageAssetKey: string | null;
  imageExt: string | null;
  thumbnailAssetKey: string | null;
  thumbnailExt: string | null;
  detail: unknown;
  images?: { assetKey: string; ext: string | null }[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** 도메인의 기본 확장자와 같은 규칙(R2AssetResolver.resolve 참고). */
function refOf(key: unknown, ext: unknown): AssetRef | null {
  if (typeof key !== "string" || key.trim() === "") return null;
  return { key: key.trim(), ext: typeof ext === "string" && ext ? ext : "jpg" };
}

/** 상세 콘텐츠(JSON) 안에 흩어져 있는 이미지들을 훑는다. */
function collectFromDetail(detail: unknown, into: AssetRef[]): void {
  if (!isRecord(detail)) return;

  const pushImage = (raw: unknown) => {
    if (!isRecord(raw)) return;
    const ref = refOf(raw.assetKey, raw.ext);
    if (ref) into.push(ref);
  };

  pushImage(isRecord(detail.highlight) ? detail.highlight.image : null);

  if (Array.isArray(detail.features)) {
    for (const block of detail.features) {
      if (isRecord(block)) pushImage(block.image);
    }
  }
  if (Array.isArray(detail.modelShots)) {
    for (const shot of detail.modelShots) pushImage(shot);
  }
}

/** 상품이 참조하는 모든 에셋을 모은다(대표·썸네일·갤러리·상세 블록·모델컷). */
export function collectProductAssets(product: ProductAssetSource): AssetRef[] {
  const refs: AssetRef[] = [];

  const cover = refOf(product.imageAssetKey, product.imageExt);
  if (cover) refs.push(cover);

  const thumb = refOf(product.thumbnailAssetKey, product.thumbnailExt);
  if (thumb) refs.push(thumb);

  for (const image of product.images ?? []) {
    const ref = refOf(image.assetKey, image.ext);
    if (ref) refs.push(ref);
  }

  collectFromDetail(product.detail, refs);
  return refs;
}

/**
 * 관리자 업로드가 만든 키만 골라낸다.
 *
 * ⚠️ 이 걸러내기가 없으면 안 된다. 시드나 콘솔에서 손으로 올린 에셋
 * (`collection/dangui-subok`, `hero/main` 등)은 여러 곳이 함께 쓰거나 사람이
 * 직접 관리하는 파일이다. 상품 하나를 지웠다고 그런 파일까지 지우면
 * 다른 화면이 조용히 깨진다. 업로드가 만든 `products/<uuid>` 만 대상이다.
 */
function uploadManaged(refs: AssetRef[]): AssetRef[] {
  return refs.filter((ref) => ref.key.startsWith(UPLOAD_PREFIX));
}

/**
 * `before` 에는 있는데 `after` 에는 없는 에셋을 S3에서 지운다.
 *
 * 실패해도 예외를 올리지 않는다 — 정리는 부수 작업이라, 여기서 던지면
 * 이미 성공한 상품 저장·삭제가 500으로 보고된다. 대신 로그를 남긴다.
 * (지우지 못한 객체는 남을 뿐이고, 쓰이지 않으므로 화면에는 영향이 없다)
 */
export async function deleteUnreferencedAssets(
  before: AssetRef[],
  after: AssetRef[] = [],
): Promise<void> {
  const kept = new Set(after.map((ref) => ref.key));
  const removed = uploadManaged(before).filter((ref) => !kept.has(ref.key));
  if (removed.length === 0) return;

  const resolver = getAssetResolver();
  // 자격증명이 없으면 공개 URL 기반 리졸버로 폴백한다 — 그쪽은 삭제를 못 한다.
  if (!(resolver instanceof S3AssetResolver)) return;

  await Promise.all(
    removed.map(async (ref) => {
      try {
        await resolver.delete(`${ref.key}.${ref.ext}`);
      } catch (error) {
        console.error("[assets] 쓰이지 않는 에셋을 지우지 못했습니다", ref, error);
      }
    }),
  );
}
