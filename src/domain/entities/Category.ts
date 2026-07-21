import type { Image } from "../value-objects/Image";

/** 컬렉션 카테고리(여성/남성/맞춤/장신구) 한 칸. */
export interface Category {
  readonly id: string;
  /** 라틴 라벨. 예) WOMEN */
  readonly labelEn: string;
  /** 한글 명칭. 예) 여성 예복 */
  readonly title: string;
  readonly image: Image;
  /** 연결 링크 */
  readonly href: string;
}
