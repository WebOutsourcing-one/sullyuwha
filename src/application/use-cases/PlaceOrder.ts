import { randomBytes } from "node:crypto";
import type { ProductRepository } from "@/domain/repositories/ProductRepository";
import type { OrderRepository } from "@/domain/repositories/OrderRepository";
import type { Order, OrderCustomer, ShippingAddress } from "@/domain/entities/Order";
import { isPayableKrw } from "@/domain/value-objects/Money";

/** 한 번에 살 수 있는 수량 상한. 맞춤 제작 품목이라 실수 입력을 막는 선에서 둔다. */
const MAX_QUANTITY = 10;

/**
 * 입력 문자열 길이 상한.
 *
 * DB 컬럼이 TEXT라 길이 제한이 없다 — 막지 않으면 주소 한 칸에 수십 KB를 넣어
 * 저장소를 부풀리거나 관리자 화면을 망가뜨릴 수 있다. 실제 필요한 길이보다
 * 넉넉하게 잡되 상한은 둔다.
 */
const MAX_LENGTH = {
  name: 60,
  phone: 20,
  email: 254,
  postcode: 10,
  address: 200,
  detail: 200,
  memo: 500,
} as const;

export interface PlaceOrderInput {
  readonly productId: string;
  readonly quantity: number;
  readonly customer: OrderCustomer;
  readonly shipping: ShippingAddress;
  /** 로그인 상태면 사용자 id, 비회원이면 null. */
  readonly userId: string | null;
}

/** 주문서를 만들지 못한 이유. 호출자가 HTTP 상태로 옮긴다. */
export type PlaceOrderFailure =
  | { kind: "PRODUCT_NOT_FOUND" }
  | { kind: "NOT_PURCHASABLE"; message: string }
  | { kind: "INVALID_INPUT"; message: string };

export type PlaceOrderResult =
  | { ok: true; order: Order }
  | { ok: false; failure: PlaceOrderFailure };

/**
 * 결제 전 주문서를 만든다.
 *
 * 핵심은 **금액을 서버에서 정한다**는 것이다. 클라이언트가 보낸 가격이나 총액은
 * 아예 받지 않고 DB의 상품 가격 × 수량으로 계산한다. 이 값이 이후 승인 단계에서
 * 토스가 돌려준 금액과 대조되므로, 결제창을 조작해도 승인이 통과하지 않는다.
 */
export class PlaceOrder {
  constructor(
    private readonly products: ProductRepository,
    private readonly orders: OrderRepository,
  ) {}

  async execute(input: PlaceOrderInput): Promise<PlaceOrderResult> {
    const quantity = Math.trunc(input.quantity);
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      return {
        ok: false,
        failure: {
          kind: "INVALID_INPUT",
          message: `수량은 1개 이상 ${MAX_QUANTITY}개 이하여야 합니다.`,
        },
      };
    }

    const customer = normalizeCustomer(input.customer);
    if (!customer.name) {
      return { ok: false, failure: { kind: "INVALID_INPUT", message: "주문자 이름을 입력해 주세요." } };
    }
    if (!isValidPhone(customer.phone)) {
      return { ok: false, failure: { kind: "INVALID_INPUT", message: "연락처 형식이 올바르지 않습니다." } };
    }
    if (customer.email && !isValidEmail(customer.email)) {
      return { ok: false, failure: { kind: "INVALID_INPUT", message: "이메일 형식이 올바르지 않습니다." } };
    }

    const shipping = normalizeShipping(input.shipping);
    if (!shipping.address) {
      return { ok: false, failure: { kind: "INVALID_INPUT", message: "배송지 주소를 입력해 주세요." } };
    }

    const product = await this.products.getById(input.productId);
    if (!product) return { ok: false, failure: { kind: "PRODUCT_NOT_FOUND" } };

    // price 0은 "가격 미정"이다. 결제로 넘어가면 안 된다.
    if (!isPayableKrw(product.price)) {
      return {
        ok: false,
        failure: {
          kind: "NOT_PURCHASABLE",
          message: "가격이 책정되지 않은 품목입니다. 문의를 통해 주문해 주세요.",
        },
      };
    }

    const amount = product.price * quantity;
    if (!isPayableKrw(amount)) {
      return {
        ok: false,
        failure: { kind: "INVALID_INPUT", message: "결제 금액을 계산할 수 없습니다." },
      };
    }

    const order = await this.orders.create({
      orderNumber: generateOrderNumber(),
      amount,
      orderName: buildOrderName(product.name, quantity),
      line: {
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        quantity,
      },
      customer,
      shipping,
      userId: input.userId,
    });

    return { ok: true, order };
  }
}

/**
 * 토스 orderId 규격에 맞는 주문번호를 만든다 — 6~64자, 영숫자·`-`·`_`.
 *
 * 순번을 쓰지 않는 이유: 주문번호만 알면 결제 상태를 조회할 수 있으므로
 * 추측 가능한 값이면 남의 주문을 열람할 수 있다. 그래서 난수 부분을
 * `Math.random`이 아니라 CSPRNG로 만든다.
 */
export function generateOrderNumber(now: Date = new Date()): string {
  const yyyymmdd = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const random = randomBytes(8).toString("hex").toUpperCase();
  return `SUL-${yyyymmdd}-${random}`;
}

/** 결제창에 노출되는 주문명. */
function buildOrderName(productName: string, quantity: number): string {
  const name = quantity > 1 ? `${productName} 외 ${quantity - 1}점` : productName;
  // 토스 orderName은 100자 제한이다.
  return name.length > 100 ? `${name.slice(0, 99)}…` : name;
}

/** 앞뒤 공백과 제어문자를 걷어내고 길이를 자른다. */
function clean(value: string | undefined, max: number): string {
  if (!value) return "";
  // 제어문자는 관리자 화면·CSV 내보내기에서 표시를 깨뜨린다.
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
}

function optional(value: string): string | undefined {
  return value ? value : undefined;
}

function normalizeCustomer(customer: OrderCustomer): OrderCustomer {
  return {
    name: clean(customer.name, MAX_LENGTH.name),
    phone: clean(customer.phone, MAX_LENGTH.phone).replace(/[^0-9]/g, ""),
    email: optional(clean(customer.email, MAX_LENGTH.email)),
  };
}

function normalizeShipping(shipping: ShippingAddress): ShippingAddress {
  return {
    postcode: optional(clean(shipping.postcode, MAX_LENGTH.postcode)),
    address: clean(shipping.address, MAX_LENGTH.address),
    detail: optional(clean(shipping.detail, MAX_LENGTH.detail)),
    memo: optional(clean(shipping.memo, MAX_LENGTH.memo)),
  };
}

/** 하이픈을 제거한 국내 휴대폰·유선번호 자릿수만 확인한다. */
function isValidPhone(digits: string): boolean {
  return /^0\d{8,10}$/.test(digits);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}
