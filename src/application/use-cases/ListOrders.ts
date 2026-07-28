import type {
  OrderListPage,
  OrderListQuery,
  OrderRepository,
} from "@/domain/repositories/OrderRepository";
import type { Order } from "@/domain/entities/Order";

/** 관리자 주문 내역 목록. 최신순으로 내려온다. */
export class ListOrders {
  constructor(private readonly repository: OrderRepository) {}

  execute(query?: OrderListQuery): Promise<OrderListPage> {
    return this.repository.list(query);
  }
}

/** 관리자 주문 상세. */
export class GetOrder {
  constructor(private readonly repository: OrderRepository) {}

  execute(id: string): Promise<Order | null> {
    return this.repository.findById(id);
  }
}

/** 로그인한 고객 본인의 주문 내역. */
export class GetMyOrders {
  constructor(private readonly repository: OrderRepository) {}

  execute(userId: string, limit = 50): Promise<OrderListPage> {
    return this.repository.list({ userId, limit });
  }
}

/**
 * 로그인한 고객 본인의 주문 상세.
 *
 * 주문번호로 찾은 뒤 **소유자를 반드시 대조한다**. 이 확인이 없으면
 * 주문번호만 알면 남의 배송지·연락처를 열람할 수 있다.
 * 없는 주문과 남의 주문을 똑같이 null로 돌려줘 존재 여부도 흘리지 않는다.
 */
export class GetMyOrder {
  constructor(private readonly repository: OrderRepository) {}

  async execute(orderNumber: string, userId: string): Promise<Order | null> {
    const order = await this.repository.findByOrderNumber(orderNumber);
    if (!order || order.userId !== userId) return null;
    return order;
  }
}
