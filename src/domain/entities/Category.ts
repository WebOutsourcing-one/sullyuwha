import type { Image } from "../value-objects/Image";

/**
 * 상품이 가질 수 있는 분류 — 랜딩의 컬렉션 카드와 1:1로 짝을 이룬다.
 *
 * 관리자 폼과 랜딩이 각자 목록을 들고 있으면 한쪽만 고쳐져 짝이 어긋난다.
 * 실제로 폼은 "소품", 카드는 "장신구"였고 두 이름은 문자열로 대조되므로,
 * 소품으로 등록한 상품은 어느 카드에도 걸리지 않았다.
 * 카드가 그 분류의 최신 상품을 물어오는 지금은 그대로 빈 카드가 된다.
 */
export const PRODUCT_CATEGORIES = [
  "여성 예복",
  "남성 예복",
  "맞춤 예복",
  "장신구",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

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
