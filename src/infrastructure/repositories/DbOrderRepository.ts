import type {
  CreateOrderInput,
  OrderListPage,
  OrderListQuery,
  OrderRepository,
} from "@/domain/repositories/OrderRepository";
import type { Order, OrderStatus, PaymentResult } from "@/domain/entities/Order";
import { isOrderStatus } from "@/domain/entities/Order";
import { getPrisma } from "@/infrastructure/db/prisma";

/** 목록 기본 페이지 크기. */
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

export class DbOrderRepository implements OrderRepository {
  async create(input: CreateOrderInput): Promise<Order> {
    const prisma = getPrisma();
    const row = await prisma.order.create({
      data: {
        orderNumber: input.orderNumber,
        status: "PENDING",
        amount: input.amount,
        orderName: input.orderName,
        productId: input.line.productId,
        productName: input.line.productName,
        unitPrice: input.line.unitPrice,
        quantity: input.line.quantity,
        customerName: input.customer.name,
        customerPhone: input.customer.phone,
        customerEmail: input.customer.email ?? null,
        shippingPostcode: input.shipping.postcode ?? null,
        shippingAddress: input.shipping.address,
        shippingDetail: input.shipping.detail ?? null,
        shippingMemo: input.shipping.memo ?? null,
        userId: input.userId,
      },
    });
    return toOrder(row);
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    const prisma = getPrisma();
    const row = await prisma.order.findUnique({ where: { orderNumber } });
    return row ? toOrder(row) : null;
  }

  async findById(id: string): Promise<Order | null> {
    const prisma = getPrisma();
    const row = await prisma.order.findUnique({ where: { id } });
    return row ? toOrder(row) : null;
  }

  async list(query: OrderListQuery = {}): Promise<OrderListPage> {
    const prisma = getPrisma();
    const where = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.userId ? { userId: query.userId } : {}),
    };
    const take = Math.min(query.limit ?? DEFAULT_LIMIT, MAX_LIMIT);

    const [rows, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take,
        skip: query.offset ?? 0,
      }),
      prisma.order.count({ where }),
    ]);

    return { orders: rows.map(toOrder), total };
  }

  async applyPayment(
    orderNumber: string,
    status: OrderStatus,
    payment: PaymentResult,
    expectedStatus?: OrderStatus,
  ): Promise<Order | null> {
    const prisma = getPrisma();

    // updateMany + where로 조건부 갱신을 한 번의 쿼리로 처리한다.
    // findUnique 후 update로 나누면 그 사이에 웹훅이 끼어들어
    // 이미 처리된 주문을 되돌릴 수 있다.
    const data = {
      status,
      paymentKey: payment.paymentKey ?? undefined,
      method: payment.method ?? undefined,
      approvedAt: payment.approvedAt ?? undefined,
      receiptUrl: payment.receiptUrl ?? undefined,
      failCode: payment.failCode ?? undefined,
      failMessage: payment.failMessage ?? undefined,
      canceledAt: payment.canceledAt ?? undefined,
      cancelReason: payment.cancelReason ?? undefined,
    };

    const result = await prisma.order.updateMany({
      where: expectedStatus
        ? { orderNumber, status: expectedStatus }
        : { orderNumber },
      data,
    });

    if (result.count === 0) return null;
    return this.findByOrderNumber(orderNumber);
  }
}

type OrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  amount: number;
  orderName: string;
  productId: string | null;
  productName: string;
  unitPrice: number;
  quantity: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  shippingPostcode: string | null;
  shippingAddress: string;
  shippingDetail: string | null;
  shippingMemo: string | null;
  paymentKey: string | null;
  method: string | null;
  approvedAt: Date | null;
  receiptUrl: string | null;
  failCode: string | null;
  failMessage: string | null;
  canceledAt: Date | null;
  cancelReason: string | null;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function toOrder(row: OrderRow): Order {
  return {
    id: row.id,
    orderNumber: row.orderNumber,
    // 컬럼은 String이라 이론상 아무 값이나 들어갈 수 있다. 모르는 값은
    // 결제 완료로 오인하지 않도록 PENDING으로 떨어뜨린다.
    status: isOrderStatus(row.status) ? row.status : "PENDING",
    amount: row.amount,
    orderName: row.orderName,
    line: {
      productId: row.productId,
      productName: row.productName,
      unitPrice: row.unitPrice,
      quantity: row.quantity,
    },
    customer: {
      name: row.customerName,
      phone: row.customerPhone,
      email: row.customerEmail ?? undefined,
    },
    shipping: {
      postcode: row.shippingPostcode ?? undefined,
      address: row.shippingAddress,
      detail: row.shippingDetail ?? undefined,
      memo: row.shippingMemo ?? undefined,
    },
    payment: {
      paymentKey: row.paymentKey ?? undefined,
      method: row.method ?? undefined,
      approvedAt: row.approvedAt ?? undefined,
      receiptUrl: row.receiptUrl ?? undefined,
      failCode: row.failCode ?? undefined,
      failMessage: row.failMessage ?? undefined,
      canceledAt: row.canceledAt ?? undefined,
      cancelReason: row.cancelReason ?? undefined,
    },
    userId: row.userId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
