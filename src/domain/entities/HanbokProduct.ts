import type { Image } from "../value-objects/Image";

/** 한복 컬렉션의 개별 품목. */
export interface HanbokProduct {
  readonly id: string;
  /** 품목명. 예) 당의 */
  readonly name: string;
  /** 한자 병기(선택). 예) 唐衣 */
  readonly hanja?: string;
  /** 분류. 예) 예복 / 생활한복 */
  readonly category: string;
  readonly description: string;
  readonly image: Image;
  /** 소재/특징 태그 */
  readonly tags: readonly string[];
}
