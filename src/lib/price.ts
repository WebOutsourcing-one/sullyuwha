/**
 * 관리자 폼이 보낸 가격을 저장 가능한 정수 원으로 정규화한다.
 *
 * 숫자가 아니거나 음수·소수면 0("가격 미정")으로 떨어뜨린다.
 * 0으로 떨어뜨리는 쪽이 안전하다 — 잘못된 값이 그대로 판매가가 되어
 * 엉뚱한 금액이 결제되는 것보다, 결제 버튼이 안 나오는 편이 낫다.
 */
export function toPrice(value: unknown): number {
  const n = typeof value === "string" ? Number(value.replace(/,/g, "")) : Number(value);
  if (!Number.isSafeInteger(n) || n < 0) return 0;
  return n;
}
