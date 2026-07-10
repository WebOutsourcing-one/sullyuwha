import type { Image } from "../value-objects/Image";

/** 브랜드 이름과 철학을 설명하는 스토리 섹션. */
export interface BrandStory {
  readonly eyebrow: string;
  readonly title: string;
  /** 본문 문단들 */
  readonly paragraphs: readonly string[];
  /** 이름의 의미(한자 풀이) */
  readonly nameMeaning: NameMeaning;
  readonly image: Image;
}

export interface NameMeaning {
  /** 한자 표기. 예) 秀麗花 */
  readonly hanja: string;
  /** 한글 독음. 예) 수려화 */
  readonly reading: string;
  /** 뜻 풀이 */
  readonly meaning: string;
}
