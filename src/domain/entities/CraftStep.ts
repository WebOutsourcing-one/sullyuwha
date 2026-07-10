import type { Image } from "../value-objects/Image";

/** 제작 과정(장인정신)의 한 단계. */
export interface CraftStep {
  /** 순서(1부터) */
  readonly order: number;
  /** 단계명. 예) 옷감 고르기 */
  readonly title: string;
  /** 한자 부제. 예) 擇布 */
  readonly subtitle: string;
  readonly description: string;
  readonly image?: Image;
}
