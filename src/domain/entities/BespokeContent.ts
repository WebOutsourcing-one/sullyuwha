import type { Image } from "../value-objects/Image";

/** 맞춤(비스포크) 섹션 콘텐츠. */
export interface BespokeContent {
  readonly eyebrow: string;
  /** 제목(줄바꿈 \n 허용) */
  readonly title: string;
  readonly paragraphs: readonly string[];
  readonly cta: { readonly label: string; readonly href: string };
  readonly image: Image;
}
