import { NextRequest, NextResponse } from "next/server";
import { container } from "@/composition/container";
import { enforceRateLimit } from "@/lib/rate-limit";

/**
 * 토스 결제 상태 웹훅.
 *
 * 가상계좌 때문에 필요하다 — 결제위젯의 기본 수단에 가상계좌가 포함되는데,
 * 발급 시점에는 아직 입금 전이라 주문이 `WAITING_FOR_DEPOSIT`에 머문다.
 * 실제 입금은 며칠 뒤일 수 있고 그때 사용자는 사이트에 없다.
 * 이 웹훅이 없으면 입금된 주문이 영영 대기 상태로 남는다.
 *
 * ⚠️ 토스 개발자센터에서 이 URL을 웹훅으로 등록해야 실제로 호출된다.
 *    등록 경로: 개발자센터 → 웹훅 → `PAYMENT_STATUS_CHANGED`
 *    URL 예) https://sullyuwha.com/api/payments/webhook
 *
 * 페이로드는 신뢰하지 않는다. 이 엔드포인트는 공개돼 있어 누구나 그럴듯한
 * JSON을 보낼 수 있으므로, 주문번호만 취하고 상태는 토스 API로 다시 조회한다.
 * (별도의 서명 검증 없이도 위조 페이로드가 주문 상태를 바꿀 수 없다.)
 */
export async function POST(request: NextRequest) {
  // 호출 한 번마다 토스 API 조회가 나가므로, 제한이 없으면 이 엔드포인트가
  // 외부 호출 증폭기가 된다. 토스의 정상 웹훅 빈도보다는 넉넉하게 잡는다.
  const limited = enforceRateLimit(request, {
    name: "webhook",
    perIp: 60,
    global: 300,
    windowMs: 60_000,
  });
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const payload = body as { data?: { orderId?: unknown }; orderId?: unknown };
  // 토스는 이벤트에 따라 최상위 또는 data 안에 orderId를 넣는다.
  const orderNumber =
    typeof payload.data?.orderId === "string"
      ? payload.data.orderId
      : typeof payload.orderId === "string"
        ? payload.orderId
        : "";

  if (!orderNumber) {
    return NextResponse.json({ error: "orderId missing" }, { status: 400 });
  }

  try {
    await container.syncPaymentStatus.execute(orderNumber);
  } catch (error) {
    // 200이 아니면 토스가 재시도한다. 일시적 오류라면 그편이 낫다.
    console.error("[payments] 웹훅 처리 실패", orderNumber, error);
    return NextResponse.json({ error: "sync failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
