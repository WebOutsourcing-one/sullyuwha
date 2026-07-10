import type { AssetKey } from "./AssetKey";

/**
 * 화면에 표현되는 이미지 한 장.
 * 에셋의 위치(AssetKey)와 접근성 정보를 함께 묶는다.
 */
export interface Image {
  /** R2 에셋 키 */
  readonly asset: AssetKey;
  /** 대체 텍스트(필수) — 장식용이면 빈 문자열 */
  readonly alt: string;
  /** 원본 비율 힌트(선택) — 레이아웃/플레이스홀더 비율 계산용 */
  readonly aspectRatio?: number;
}
