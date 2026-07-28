/**
 * 원화 금액. **정수 원 단위**로만 다룬다.
 *
 * KRW는 보조단위(전)가 없으므로 소수점을 허용할 이유가 없고,
 * 부동소수 반올림 오차가 결제 승인 금액 대조에서 곧바로 실패로 이어진다.
 * 토스도 KRW는 정수만 받는다.
 */
export type Krw = number;

/** 결제 가능한 금액인지 — 양의 정수여야 한다. */
export function isPayableKrw(value: unknown): value is Krw {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

/** 화면 표기용. 예) 1800000 → "1,800,000원" */
export function formatKrw(value: Krw): string {
  return `${value.toLocaleString("ko-KR")}원`;
}
