import type { OrderRepository } from "@/domain/repositories/OrderRepository";
import type { Order, OrderStatus, PaymentResult } from "@/domain/entities/Order";
import {
  ALREADY_PROCESSED,
  TossPaymentsError,
  confirmPayment,
  getPaymentByOrderId,
  type TossPayment,
  type TossPaymentStatus,
} from "@/infrastructure/payments/TossPaymentsClient";

export interface ConfirmPaymentInput {
  readonly orderNumber: string;
  readonly paymentKey: string;
  /** 결제창이 돌려준 금액. **신뢰하지 않고** 저장된 주문 금액과 대조만 한다. */
  readonly amount: number;
}

export type ConfirmPaymentFailure =
  | { kind: "ORDER_NOT_FOUND" }
  | { kind: "AMOUNT_MISMATCH" }
  | { kind: "ALREADY_PAID_WITH_OTHER_PAYMENT" }
  | { kind: "NOT_CONFIRMABLE"; status: OrderStatus }
  | { kind: "GATEWAY_ERROR"; code: string; message: string }
  /** 승인 여부를 확정할 수 없음 — 주문은 PENDING으로 남고 대사가 필요하다. */
  | { kind: "INDETERMINATE"; code: string; message: string };

export type ConfirmPaymentResult =
  | { ok: true; order: Order; alreadyProcessed: boolean }
  | { ok: false; failure: ConfirmPaymentFailure };

/**
 * 토스 결제를 승인하고 주문에 결과를 반영한다.
 *
 * 이 유스케이스가 지켜야 하는 두 가지:
 *
 * 1. **금액 검증** — 결제창이 돌려준 `amount`를 그대로 승인에 넘기지 않는다.
 *    저장된 주문 금액과 먼저 대조하고, 승인 요청에는 저장된 값을 보낸다.
 *    이렇게 해야 결제창을 조작해 1원만 결제하는 시나리오가 막힌다.
 *
 * 2. **멱등성** — 성공 페이지는 새로고침될 수 있고 웹훅과 경쟁할 수도 있다.
 *    이미 승인된 주문에 같은 paymentKey로 다시 들어오면 재승인 없이 성공으로 돌려준다.
 */
export class ConfirmPayment {
  constructor(private readonly orders: OrderRepository) {}

  async execute(input: ConfirmPaymentInput): Promise<ConfirmPaymentResult> {
    const order = await this.orders.findByOrderNumber(input.orderNumber);
    if (!order) return { ok: false, failure: { kind: "ORDER_NOT_FOUND" } };

    // 이미 처리된 주문 — 같은 결제면 성공으로 통과(새로고침·웹훅 경쟁).
    if (order.status === "PAID" || order.status === "WAITING_FOR_DEPOSIT") {
      if (order.payment.paymentKey === input.paymentKey) {
        return { ok: true, order, alreadyProcessed: true };
      }
      return { ok: false, failure: { kind: "ALREADY_PAID_WITH_OTHER_PAYMENT" } };
    }

    if (order.status !== "PENDING") {
      return { ok: false, failure: { kind: "NOT_CONFIRMABLE", status: order.status } };
    }

    // 위변조 검사. 여기서 걸리면 승인 요청 자체를 보내지 않는다.
    if (order.amount !== input.amount) {
      await this.orders.applyPayment(
        order.orderNumber,
        "FAILED",
        {
          failCode: "AMOUNT_MISMATCH",
          failMessage: `결제 금액이 주문 금액과 다릅니다. (주문 ${order.amount} / 요청 ${input.amount})`,
        },
        "PENDING",
      );
      return { ok: false, failure: { kind: "AMOUNT_MISMATCH" } };
    }

    let payment: TossPayment;
    try {
      payment = await confirmPayment({
        paymentKey: input.paymentKey,
        orderId: order.orderNumber,
        // 클라이언트가 보낸 값이 아니라 저장된 금액으로 승인한다.
        amount: order.amount,
      });
    } catch (error) {
      return this.handleConfirmError(order.orderNumber, error);
    }

    const status = toOrderStatus(payment.status);
    const updated = await this.applyOrLog(order.orderNumber, status, payment);

    if (!updated) {
      // 승인 중에 웹훅이 먼저 반영한 경우. 돈은 이미 승인됐으므로 실패로 처리하지 않는다.
      const current = await this.orders.findByOrderNumber(order.orderNumber);
      if (current && (current.status === "PAID" || current.status === "WAITING_FOR_DEPOSIT")) {
        return { ok: true, order: current, alreadyProcessed: true };
      }
      return {
        ok: false,
        failure: { kind: "NOT_CONFIRMABLE", status: current?.status ?? "PENDING" },
      };
    }

    return { ok: true, order: updated, alreadyProcessed: false };
  }

  /**
   * 승인 호출이 던진 오류를 주문 상태로 옮긴다.
   *
   * 여기서 갈리는 세 갈래가 중요하다:
   * 1. 이미 승인된 결제 → 실패가 아니다. 토스에서 실제 상태를 읽어 반영한다.
   * 2. 승인 여부 불명(타임아웃·네트워크·토스 5xx) → **주문을 건드리지 않는다**.
   *    실패로 확정하면 실제로는 결제된 건이 실패로 남아 환불 누락으로 이어진다.
   * 3. 확정 거절(한도 초과·세션 만료 등) → FAILED로 기록한다.
   */
  private async handleConfirmError(
    orderNumber: string,
    error: unknown,
  ): Promise<ConfirmPaymentResult> {
    const gateway = error instanceof TossPaymentsError ? error : null;

    if (gateway?.code === ALREADY_PROCESSED) {
      const synced = await new SyncPaymentStatus(this.orders).execute(orderNumber);
      if (synced && (synced.status === "PAID" || synced.status === "WAITING_FOR_DEPOSIT")) {
        return { ok: true, order: synced, alreadyProcessed: true };
      }
    }

    const { code, message } = toGatewayError(error);

    if (!gateway || gateway.isIndeterminate) {
      // 결제가 됐는지 알 수 없다. PENDING을 유지해 재시도·웹훅·수동 대사가 가능하게 둔다.
      console.error(
        "[payments] 승인 결과 불명 — 주문 상태를 변경하지 않음. 대사 필요:",
        { orderNumber, code, message },
      );
      return { ok: false, failure: { kind: "INDETERMINATE", code, message } };
    }

    await this.orders.applyPayment(
      orderNumber,
      "FAILED",
      { failCode: code, failMessage: message },
      "PENDING",
    );
    return { ok: false, failure: { kind: "GATEWAY_ERROR", code, message } };
  }

  /**
   * 승인 결과를 저장한다. 저장이 실패하면 **돈은 빠져나갔는데 기록이 없는** 상태이므로
   * 수동 대사를 할 수 있도록 결제 키를 남겨 크게 로그한다.
   */
  private async applyOrLog(
    orderNumber: string,
    status: OrderStatus,
    payment: TossPayment,
  ): Promise<Order | null> {
    try {
      return await this.orders.applyPayment(
        orderNumber,
        status,
        toPaymentResult(payment),
        "PENDING",
      );
    } catch (error) {
      console.error(
        "[payments] 🚨 승인은 성공했으나 주문 저장에 실패했습니다. 수동 대사 필요:",
        { orderNumber, paymentKey: payment.paymentKey, amount: payment.totalAmount },
        error,
      );
      throw error;
    }
  }
}

/**
 * 웹훅용 — 토스에서 결제 상태를 다시 읽어 주문에 반영한다.
 *
 * 웹훅 페이로드를 그대로 믿지 않는 이유: 엔드포인트가 공개돼 있어 누구나
 * 그럴듯한 JSON을 POST할 수 있다. 주문번호만 취하고 사실은 API로 확인한다.
 */
export class SyncPaymentStatus {
  constructor(private readonly orders: OrderRepository) {}

  async execute(orderNumber: string): Promise<Order | null> {
    const order = await this.orders.findByOrderNumber(orderNumber);
    if (!order) return null;

    let payment: TossPayment;
    try {
      payment = await getPaymentByOrderId(orderNumber);
    } catch (error) {
      console.error("[payments] 웹훅 동기화 실패", orderNumber, error);
      return null;
    }

    // 금액이 다르면 우리 주문과 짝이 맞지 않는 결제다. 반영하지 않는다.
    if (payment.totalAmount !== order.amount) {
      console.error(
        "[payments] 웹훅 금액 불일치",
        orderNumber,
        payment.totalAmount,
        order.amount,
      );
      return null;
    }

    const status = toOrderStatus(payment.status);
    if (status === order.status) return order;

    return this.orders.applyPayment(orderNumber, status, toPaymentResult(payment));
  }
}

/** 토스 결제 상태 → 주문 상태. */
function toOrderStatus(status: TossPaymentStatus): OrderStatus {
  switch (status) {
    case "DONE":
      return "PAID";
    case "WAITING_FOR_DEPOSIT":
      return "WAITING_FOR_DEPOSIT";
    case "CANCELED":
    case "PARTIAL_CANCELED":
      return "CANCELED";
    case "ABORTED":
    case "EXPIRED":
      return "FAILED";
    // READY·IN_PROGRESS는 아직 결제창을 벗어나지 않은 상태다.
    default:
      return "PENDING";
  }
}

function toPaymentResult(payment: TossPayment): PaymentResult {
  return {
    paymentKey: payment.paymentKey,
    method: payment.method ?? undefined,
    approvedAt: payment.approvedAt ? new Date(payment.approvedAt) : undefined,
    receiptUrl: payment.receipt?.url ?? undefined,
  };
}

function toGatewayError(error: unknown): { code: string; message: string } {
  if (error instanceof TossPaymentsError) {
    return { code: error.code, message: error.message };
  }
  console.error("[payments] 예상치 못한 승인 오류", error);
  return { code: "UNKNOWN", message: "결제 처리 중 오류가 발생했습니다." };
}
