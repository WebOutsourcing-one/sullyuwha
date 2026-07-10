import type { Image } from "../value-objects/Image";

/** 갤러리 그리드의 한 칸. */
export interface GalleryItem {
  readonly id: string;
  readonly image: Image;
  readonly caption: string;
  /** 메이슨리 배치 힌트 */
  readonly span: GallerySpan;
}

export type GallerySpan = "normal" | "tall" | "wide";
