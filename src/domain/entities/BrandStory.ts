import type { Image } from "../value-objects/Image";

/** 브랜드 이름과 철학을 설명하는 스토리 섹션. */
export interface BrandStory {
  readonly eyebrow: string;
  readonly title: string;
  /** 본문 문단들 */
  readonly paragraphs: readonly string[];
  /** 이름의 의미 */
  readonly nameMeaning: NameMeaning;
  readonly image: Image;
}

export interface NameMeaning {
  /** 브랜드 이름. 예) 설유화 */
  readonly reading: string;
  /** 뜻 풀이 */
  readonly meaning: string;
}
