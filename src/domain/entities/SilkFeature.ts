import type { Image } from "../value-objects/Image";

/** 실크 소재 이야기의 피처 카드 한 장. */
export interface SilkFeature {
  readonly id: string;
  /** 넓은 자간 라틴 라벨. 예) LUSTER */
  readonly label: string;
  /** 한글 제목. 예) 깊은 광택과 드레이프 */
  readonly title: string;
  readonly description: string;
  readonly image?: Image;
}
