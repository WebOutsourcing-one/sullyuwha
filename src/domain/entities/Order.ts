import type { Krw } from "../value-objects/Money";

/**
 * 주문 상태.
 *
 * - `PENDING` — 주문서만 만들어진 상태. 아직 결제창을 통과하지 않았다.
 * - `WAITING_FOR_DEPOSIT` — 가상계좌 발급 완료, 입금 대기. 웹훅으로 `PAID`가 된다.
 * - `PAID` — 토스 승인 완료. 이 상태에서만 배송 준비에 들어간다.
 * - `FAILED` — 결제창에서 실패하거나 승인이 거절됐다.
 * - `CANCELED` — 승인 후 취소(환불).
 */
export const ORDER_STATUSES = [
  "PENDING",
  "WAITING_FOR_DEPOSIT",
  "PAID",
  "FAILED",
  "CANCELED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    typeof value === "string" &&
    (ORDER_STATUSES as readonly string[]).includes(value)
  );
}

/** 화면 표기용 한글 라벨. */
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "결제 대기",
  WAITING_FOR_DEPOSIT: "입금 대기",
  PAID: "결제 완료",
  FAILED: "결제 실패",
  CANCELED: "결제 취소",
};

/** 주문자 정보. 비회원 주문이 기본이므로 계정과 무관하게 여기에 담는다. */
export interface OrderCustomer {
  readonly name: string;
  readonly phone: string;
  readonly email?: string;
}

/** 배송지. */
export interface ShippingAddress {
  readonly postcode?: string;
  readonly address: string;
  readonly detail?: string;
  readonly memo?: string;
}

/**
 * 주문 시점의 상품 스냅샷.
 *
 * 상품이 나중에 수정·삭제돼도 주문 내역은 결제 당시의 이름·가격을 보여야 한다.
 * `productId`는 참조용이며 상품이 삭제되면 null이 된다.
 */
export interface OrderLine {
  readonly productId: string | null;
  readonly productName: string;
  readonly unitPrice: Krw;
  readonly quantity: number;
}

/** 토스 결제 결과. 승인 전에는 대부분 비어 있다. */
export interface PaymentResult {
  readonly paymentKey?: string;
  /** 카드 · 가상계좌 · 간편결제 등 토스가 돌려준 결제수단 문자열 */
  readonly method?: string;
  readonly approvedAt?: Date;
  readonly receiptUrl?: string;
  readonly failCode?: string;
  readonly failMessage?: string;
  readonly canceledAt?: Date;
  readonly cancelReason?: string;
}

export interface Order {
  readonly id: string;
  /** 토스에 넘기는 주문번호. 고객·관리자에게 노출되는 식별자이기도 하다. */
  readonly orderNumber: string;
  readonly status: OrderStatus;
  /** 서버가 상품 가격에서 계산한 결제 금액. 클라이언트 입력은 반영하지 않는다. */
  readonly amount: Krw;
  /** 결제창에 표시되는 주문명. 예) 수복문 당의 */
  readonly orderName: string;
  readonly line: OrderLine;
  readonly customer: OrderCustomer;
  readonly shipping: ShippingAddress;
  readonly payment: PaymentResult;
  /** 비회원 주문이면 null. */
  readonly userId: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
