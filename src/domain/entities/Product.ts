import type { Image } from "../value-objects/Image";
import type { Krw } from "../value-objects/Money";

/** 상세 페이지의 스펙 표 한 줄(라벨-값). */
export interface ProductSpec {
  /** 항목명. 예) 소재 / 두께 / 실루엣 */
  readonly label: string;
  /** 값. 예) 실크 100% */
  readonly value: string;
}

/** 상세 페이지의 "이미지 + 소제목 + 본문" 한 덩어리. */
export interface ProductDetailBlock {
  /** 소제목. 예) 정교한 수복문 자수 */
  readonly title: string;
  /** 본문. 줄바꿈은 조판에 맡기고 한 문단으로 쓴다. */
  readonly body: string;
  /** 블록 상단 이미지(선택) — 없으면 글만 나간다. */
  readonly image?: Image;
}

/**
 * 디자이너 시안(`public/detail_page.png`) 구조를 그대로 담는 상세 페이지 콘텐츠.
 *
 * 전부 선택 항목이다 — 값이 없는 블록은 통째로 렌더하지 않으므로,
 * 이 필드가 없는 기존 품목도 기본 상세 레이아웃으로 문제없이 표시된다.
 */
export interface ProductDetailContent {
  /** 제품명 아래 한자 부제. 예) 鳳凰紋 負衿 唐衣 */
  readonly subtitle?: string;
  /** 대표 컷 옆을 세로쓰기로 흐르는 한 줄. 예) 귀한 순간을 더 빛나게 하는 품격의 예복 */
  readonly tagline?: string;
  /** 제목 아래 도입부. 줄바꿈(`\n`)을 그대로 살려 조판한다. */
  readonly intro?: string;
  /** 대표 문양·상징을 클로즈업으로 풀어내는 블록 */
  readonly highlight?: ProductDetailBlock;
  /** 소재·자수·안감 등을 나눠 보여주는 블록들(시안은 3단) */
  readonly features?: readonly ProductDetailBlock[];
  /** 하단 "모델 컷"에 나란히 놓이는 이미지들 */
  readonly modelShots?: readonly Image[];
  /** 하단 유의사항. 예) 모니터의 해상도에 따라 색상이 다르게 보일 수 있습니다. */
  readonly notes?: readonly string[];
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
  /** 대표(커버) 이미지 — 상세 페이지 갤러리의 첫 컷 */
  readonly image: Image;
  /**
   * 목록용 썸네일(선택) — 메인·컬렉션 카드·주문 요약에 쓴다.
   * 상세의 대표 컷과 구도가 다른 별도 촬영본을 받으므로 필드를 나눠 둔다.
   * 없으면 `image`로 대체된다(`thumbnailOf` 참고).
   */
  readonly thumbnail?: Image;
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
  /** 상세 페이지용 — 디자이너 시안 구조의 에디토리얼 콘텐츠(선택) */
  readonly detail?: ProductDetailContent;
}

/**
 * 목록·카드·주문 요약에 쓸 컷을 고른다.
 * 썸네일을 따로 받기 전까지는 대표 컷이 대신 나가도록 한 곳에서 결정한다.
 */
export function thumbnailOf(product: Product): Image {
  return product.thumbnail ?? product.image;
}
