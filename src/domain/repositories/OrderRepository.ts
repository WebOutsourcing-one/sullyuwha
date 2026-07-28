import type {
  Order,
  OrderCustomer,
  OrderLine,
  OrderStatus,
  PaymentResult,
  ShippingAddress,
} from "../entities/Order";
import type { Krw } from "../value-objects/Money";

/** 주문 생성 입력. `amount`는 호출자(유스케이스)가 상품 가격에서 계산해 넣는다. */
export interface CreateOrderInput {
  readonly orderNumber: string;
  readonly amount: Krw;
  readonly orderName: string;
  readonly line: OrderLine;
  readonly customer: OrderCustomer;
  readonly shipping: ShippingAddress;
  /** 주문에는 반드시 계정이 붙는다(로그인 필수). */
  readonly userId: string;
}

/** 목록 조회 필터. */
export interface OrderListQuery {
  readonly status?: OrderStatus;
  /** 지정하면 해당 계정의 주문만 반환한다. 고객용 주문 내역에 쓴다. */
  readonly userId?: string;
  readonly limit?: number;
  readonly offset?: number;
}

export interface OrderListPage {
  readonly orders: readonly Order[];
  readonly total: number;
}

/** 주문 저장소 계약. 주문은 DB 없이는 성립하지 않으므로 정적 구현은 두지 않는다. */
export interface OrderRepository {
  create(input: CreateOrderInput): Promise<Order>;
  findByOrderNumber(orderNumber: string): Promise<Order | null>;
  findById(id: string): Promise<Order | null>;
  list(query?: OrderListQuery): Promise<OrderListPage>;

  /**
   * 결제 결과를 반영한다.
   *
   * `expectedStatus`를 주면 현재 상태가 그것과 같을 때만 갱신한다(낙관적 조건부 갱신).
   * 승인 응답과 웹훅이 동시에 도착해도 한 쪽만 이기게 만들기 위한 것으로,
   * 갱신하지 못하면 null을 돌려준다.
   */
  applyPayment(
    orderNumber: string,
    status: OrderStatus,
    payment: PaymentResult,
    expectedStatus?: OrderStatus,
  ): Promise<Order | null>;
}
