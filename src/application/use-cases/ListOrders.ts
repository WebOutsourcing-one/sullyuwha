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
