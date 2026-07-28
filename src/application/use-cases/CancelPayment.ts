import type { OrderRepository } from "@/domain/repositories/OrderRepository";
import type { Order } from "@/domain/entities/Order";
import {
  TossPaymentsError,
  cancelPayment,
} from "@/infrastructure/payments/TossPaymentsClient";

export type CancelPaymentFailure =
  | { kind: "ORDER_NOT_FOUND" }
  | { kind: "NOT_CANCELABLE"; message: string }
  | { kind: "GATEWAY_ERROR"; code: string; message: string };

export type CancelPaymentResult =
  | { ok: true; order: Order }
  | { ok: false; failure: CancelPaymentFailure };

/**
 * 승인된 결제를 전액 취소(환불)한다. 관리자만 호출한다.
 *
 * 취소는 되돌릴 수 없으므로 라우트 핸들러에서 관리자 세션을 먼저 확인해야 한다.
 * 부분취소는 지원하지 않는다 — 단건 즉시구매라 나눌 금액이 없다.
 */
export class CancelPayment {
  constructor(private readonly orders: OrderRepository) {}

  async execute(orderId: string, reason: string): Promise<CancelPaymentResult> {
    const order = await this.orders.findById(orderId);
    if (!order) return { ok: false, failure: { kind: "ORDER_NOT_FOUND" } };

    if (order.status === "CANCELED") {
      return { ok: false, failure: { kind: "NOT_CANCELABLE", message: "이미 취소된 주문입니다." } };
    }
    if (order.status !== "PAID" && order.status !== "WAITING_FOR_DEPOSIT") {
      return {
        ok: false,
        failure: { kind: "NOT_CANCELABLE", message: "결제가 완료된 주문만 취소할 수 있습니다." },
      };
    }
    if (!order.payment.paymentKey) {
      return {
        ok: false,
        failure: { kind: "NOT_CANCELABLE", message: "결제 정보가 없어 취소할 수 없습니다." },
      };
    }

    const cancelReason = reason.trim() || "판매자 취소";

    try {
      await cancelPayment({
        paymentKey: order.payment.paymentKey,
        cancelReason,
        // 같은 주문을 두 번 눌러도 환불이 두 번 나가지 않도록 주문 단위로 고정한다.
        idempotencyKey: `cancel-${order.orderNumber}`,
      });
    } catch (error) {
      if (error instanceof TossPaymentsError) {
        return {
          ok: false,
          failure: { kind: "GATEWAY_ERROR", code: error.code, message: error.message },
        };
      }
      console.error("[payments] 예상치 못한 취소 오류", error);
      return {
        ok: false,
        failure: { kind: "GATEWAY_ERROR", code: "UNKNOWN", message: "취소 처리 중 오류가 발생했습니다." },
      };
    }

    let updated: Order | null = null;
    try {
      updated = await this.orders.applyPayment(order.orderNumber, "CANCELED", {
        canceledAt: new Date(),
        cancelReason,
      });
    } catch (error) {
      // 환불은 이미 나갔는데 기록만 실패한 상태다. 다시 누르면 토스가 멱등키로
      // 막아주지만, 목록에는 여전히 결제 완료로 보인다. 대사할 수 있게 남긴다.
      console.error(
        "[payments] 🚨 환불은 성공했으나 주문 저장에 실패했습니다. 수동 대사 필요:",
        { orderNumber: order.orderNumber, paymentKey: order.payment.paymentKey },
        error,
      );
      throw error;
    }

    return { ok: true, order: updated ?? order };
  }
}
