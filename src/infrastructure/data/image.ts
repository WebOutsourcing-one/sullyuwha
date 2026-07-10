import { assetKey } from "@/domain/value-objects/AssetKey";
import type { Image } from "@/domain/value-objects/Image";

/** 정적 데이터에서 Image 값 객체를 간결하게 생성하는 헬퍼. */
export function image(key: string, alt: string, aspectRatio?: number): Image {
  return { asset: assetKey(key), alt, aspectRatio };
}
