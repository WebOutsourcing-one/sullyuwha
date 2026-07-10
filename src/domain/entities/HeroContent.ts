import type { Image } from "../value-objects/Image";

/** 페이지 최상단 히어로 영역의 콘텐츠. */
export interface HeroContent {
  /** 상단 작은 부제(한자/한글 조합 가능) */
  readonly eyebrow: string;
  /** 대표 슬로건 */
  readonly slogan: string;
  /** 슬로건 아래 보조 문구 */
  readonly subcopy: string;
  readonly primaryCta: CallToAction;
  readonly secondaryCta: CallToAction;
  /** 대표 한복 이미지 */
  readonly image: Image;
}

export interface CallToAction {
  readonly label: string;
  readonly href: string;
}
