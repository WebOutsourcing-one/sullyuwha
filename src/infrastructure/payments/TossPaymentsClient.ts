/**
 * 토스페이먼츠 코어 API 클라이언트 (서버 전용).
 *
 * 시크릿 키는 절대 클라이언트로 나가면 안 되므로 이 모듈은 서버에서만 import한다.
 * 인증은 Basic 방식이며 `base64(secretKey + ":")` — 비밀번호 자리를 비운 형태다.
 */
import { loadServerEnv } from "@/infrastructure/config/server-env";

const TOSS_API_BASE = "https://api.tosspayments.com/v1";

/** 네트워크가 멎었을 때 요청이 무한정 매달리지 않도록. */
const REQUEST_TIMEOUT_MS = 10_000;

/**
 * 토스 결제 상태.
 * - `DONE` — 승인 완료
 * - `WAITING_FOR_DEPOSIT` — 가상계좌 발급 후 입금 대기
 * - `CANCELED` / `PARTIAL_CANCELED` — 취소
 * - `ABORTED` — 승인 실패, `EXPIRED` — 유효시간 만료
 */
export type TossPaymentStatus =
  | "READY"
  | "IN_PROGRESS"
  | "WAITING_FOR_DEPOSIT"
  | "DONE"
  | "CANCELED"
  | "PARTIAL_CANCELED"
  | "ABORTED"
  | "EXPIRED";

/** 응답에서 실제로 쓰는 필드만 추린 형태. */
export interface TossPayment {
  readonly paymentKey: string;
  readonly orderId: string;
  readonly status: TossPaymentStatus;
  readonly totalAmount: number;
  readonly balanceAmount?: number;
  readonly method?: string;
  readonly approvedAt?: string | null;
  readonly requestedAt?: string | null;
  readonly receipt?: { readonly url?: string } | null;
  readonly virtualAccount?: {
    readonly accountNumber?: string;
    readonly bankCode?: string;
    readonly dueDate?: string;
  } | null;
}

/** 토스가 `{ code, message }`로 돌려주는 실패. HTTP 상태와 함께 감싼다. */
export class TossPaymentsError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly httpStatus: number,
  ) {
    super(message);
    this.name = "TossPaymentsError";
  }

  /**
   * 결제가 승인됐는지 **알 수 없는** 실패인가.
   *
   * 타임아웃·연결 실패·토스 5xx는 "거절"이 아니다. 요청이 토스에 닿아 승인까지
   * 끝난 뒤 응답만 못 받았을 수도 있다. 이 경우 주문을 실패로 확정하면
   * 고객은 결제됐는데 화면과 관리자 목록에는 실패로 남는다.
   * 그래서 이런 오류는 주문 상태를 건드리지 않고 대사(reconcile) 대상으로 남긴다.
   */
  get isIndeterminate(): boolean {
    if (this.code === "NETWORK_ERROR" || this.code === "INVALID_RESPONSE") return true;
    return this.httpStatus >= 500;
  }
}

/** 이미 승인이 끝난 결제에 다시 승인을 요청했을 때 토스가 주는 코드. */
export const ALREADY_PROCESSED = "ALREADY_PROCESSED_PAYMENT";

function authHeader(secretKey: string): string {
  return `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;
}

function requireSecretKey(): string {
  const { tossSecretKey } = loadServerEnv();
  if (!tossSecretKey) {
    // 키가 없으면 결제를 "성공"시켜서는 안 된다. 즉시 끊는다.
    throw new TossPaymentsError(
      "CONFIG_MISSING",
      "TOSS_SECRET_KEY가 설정되지 않았습니다.",
      500,
    );
  }
  return tossSecretKey;
}

async function request<T>(
  path: string,
  init: { method: "GET" | "POST"; body?: unknown; idempotencyKey?: string },
): Promise<T> {
  const secretKey = requireSecretKey();

  const headers: Record<string, string> = {
    Authorization: authHeader(secretKey),
  };
  if (init.body !== undefined) headers["Content-Type"] = "application/json";
  // 같은 키로 재요청하면 토스가 최초 처리 결과를 그대로 돌려준다 —
  // 네트워크 재시도로 중복 승인·중복 환불이 나는 것을 막는다.
  if (init.idempotencyKey) headers["Idempotency-Key"] = init.idempotencyKey;

  let response: Response;
  try {
    response = await fetch(`${TOSS_API_BASE}${path}`, {
      method: init.method,
      headers,
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch {
    throw new TossPaymentsError(
      "NETWORK_ERROR",
      "결제 서버에 연결하지 못했습니다.",
      502,
    );
  }

  const text = await response.text();
  let payload: unknown = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    /* 아래에서 형식 오류로 처리한다 */
  }

  if (!response.ok) {
    const err = payload as { code?: string; message?: string } | null;
    throw new TossPaymentsError(
      err?.code ?? "UNKNOWN",
      err?.message ?? "결제 처리 중 오류가 발생했습니다.",
      response.status,
    );
  }

  if (payload === null) {
    throw new TossPaymentsError(
      "INVALID_RESPONSE",
      "결제 서버 응답을 해석하지 못했습니다.",
      502,
    );
  }

  return payload as T;
}

/**
 * 결제 승인. 이 호출이 성공해야 실제로 돈이 빠져나간다.
 *
 * `amount`는 반드시 **서버에 저장된 주문 금액**을 넘겨야 한다.
 * 결제창이 돌려준 값을 그대로 넘기면 위변조를 검증할 수 없다.
 */
export function confirmPayment(params: {
  paymentKey: string;
  orderId: string;
  amount: number;
}): Promise<TossPayment> {
  return request<TossPayment>("/payments/confirm", {
    method: "POST",
    body: params,
    // 주문번호는 주문당 하나뿐이라 멱등키로 그대로 쓸 수 있다.
    idempotencyKey: `confirm-${params.orderId}`,
  });
}

/** 승인된 결제를 전액 취소한다. */
export function cancelPayment(params: {
  paymentKey: string;
  cancelReason: string;
  idempotencyKey?: string;
}): Promise<TossPayment> {
  return request<TossPayment>(
    `/payments/${encodeURIComponent(params.paymentKey)}/cancel`,
    {
      method: "POST",
      body: { cancelReason: params.cancelReason },
      idempotencyKey: params.idempotencyKey ?? `cancel-${params.paymentKey}`,
    },
  );
}

/** 주문번호로 결제를 조회한다. 웹훅 페이로드를 그대로 믿지 않고 재확인할 때 쓴다. */
export function getPaymentByOrderId(orderId: string): Promise<TossPayment> {
  return request<TossPayment>(
    `/payments/orders/${encodeURIComponent(orderId)}`,
    { method: "GET" },
  );
}
