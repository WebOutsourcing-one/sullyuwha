import type { Image } from "../value-objects/Image";
import type { Krw } from "../value-objects/Money";

/** 상세 페이지의 스펙 표 한 줄(라벨-값). */
export interface ProductSpec {
  /** 항목명. 예) 소재 / 두께 / 실루엣 */
  readonly label: string;
  /** 값. 예) 실크 100% */
  readonly value: string;
}

/** 실크 기성복 컬렉션의 개별 품목. */
export interface Product {
  readonly id: string;
  /** 품목명. 예) 실크 슬립 원피스 */
  readonly name: string;
  /** 분류. 예) 원피스 / 블라우스 / 스카프 */
  readonly category: string;
  /** 소재 표기. 예) 실크 100% · 19 momme */
  readonly material: string;
  /** 카드·요약용 짧은 소개 */
  readonly description: string;
  /**
   * 판매가(정수 원). `0`은 "가격 미정"을 뜻하며 결제 버튼 대신 문의 CTA가 나간다.
   * 맞춤 제작 품목은 가격을 확정하기 전까지 0으로 두면 된다.
   */
  readonly price: Krw;
  /** 대표(커버) 이미지 — 카드·OG·갤러리 첫 컷에 사용 */
  readonly image: Image;
  /**
   * 상세 갤러리 추가 컷(선택) — 커버 뒤에 이어붙는다.
   * 사진과 GIF를 섞을 수 있다(각 Image의 `ext`로 포맷 지정).
   */
  readonly gallery?: readonly Image[];
  /** 특징/스타일 태그 */
  readonly tags: readonly string[];
  /** 상세 페이지용 — 소재·실루엣을 풀어낸 에디토리얼 문단(선택) */
  readonly story?: string;
  /** 상세 페이지용 — 스펙 표(소재·두께·실루엣·원산지 등)(선택) */
  readonly specs?: readonly ProductSpec[];
  /** 상세 페이지용 — 관리 안내(선택) */
  readonly care?: readonly string[];
}
