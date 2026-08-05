import { NextRequest, NextResponse } from "next/server";

/**
 * 인증 없이 열려 있는 쓰기 엔드포인트용 최소 속도 제한.
 *
 * 막으려는 것:
 * - 주문 생성(`/api/orders`)은 로그인 없이 호출 가능하므로, 반복 호출로
 *   주문 테이블을 무한정 부풀릴 수 있다.
 * - 웹훅(`/api/payments/webhook`)은 호출 한 번마다 토스 API 조회가 나가므로,
 *   그대로 두면 우리 서버를 증폭기로 삼아 외부 호출을 퍼부을 수 있다.
 *
 * ⚠️ 한계 — 프로세스 메모리 기반이라 인스턴스마다 따로 센다. 여러 대로 확장하면
 *    Redis 같은 공유 저장소로 옮겨야 한다. 또 IP는 프록시 헤더에서 얻으므로
 *    신뢰 경계가 아니다. 그래서 IP별 제한과 **전역 제한**을 함께 둔다 —
 *    IP를 위조해도 전역 상한이 DB 폭주를 막는다.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** 메모리가 무한정 늘지 않도록 하는 상한. 넘으면 만료된 항목부터 쓸어낸다. */
const MAX_BUCKETS = 10_000;

function hit(key: string, limit: number, windowMs: number, now: number): boolean {
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    if (buckets.size >= MAX_BUCKETS) sweep(now);
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (existing.count >= limit) return false;

  existing.count += 1;
  return true;
}

function sweep(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  // 전부 유효해서 지울 게 없으면 가장 오래된 것부터 버린다(최악의 경우 방지).
  if (buckets.size >= MAX_BUCKETS) {
    const excess = buckets.size - Math.floor(MAX_BUCKETS / 2);
    let removed = 0;
    for (const key of buckets.keys()) {
      buckets.delete(key);
      if (++removed >= excess) break;
    }
  }
}

/**
 * 요청 IP를 추정한다.
 *
 * 프록시 뒤에 있으면 `x-forwarded-for`가 클라이언트에서 위조될 수 있다.
 * 그래서 이 값은 남용 완화용 힌트일 뿐 인증 수단이 아니다 —
 * 위조에 대비해 전역 제한을 함께 건다.
 */
function clientKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

/**
 * 상품 쓰기(등록·수정·삭제) 제한.
 *
 * 세 라우트가 같은 예산을 나눠 쓰도록 여기에 둔다 — route 파일에서 상수를
 * 내보내면 Next의 라우트 export 검사에 걸리고, 각자 선언하면 값이 갈린다.
 *
 * 어느 경우든 **인증을 통과한 뒤에** 센다. 막으려는 것은 세션이 탈취됐을 때의
 * 피해 범위이고, 인증 전에 세면 외부인이 관리자 몫의 예산을 대신 소진시켜
 * 정상 작업을 막을 수 있다.
 */
export const PRODUCT_WRITE_LIMIT: RateLimitOptions = {
  name: "admin-product-write",
  perIp: 60,
  global: 200,
  windowMs: 60_000,
};

export interface RateLimitOptions {
  /** 버킷 이름. 엔드포인트마다 다르게 준다. */
  readonly name: string;
  /** IP 하나가 창 안에서 보낼 수 있는 최대 요청 수. */
  readonly perIp: number;
  /** 인스턴스 전체가 창 안에서 받는 최대 요청 수. */
  readonly global: number;
  readonly windowMs: number;
}

/** 제한에 걸리면 429 응답, 통과하면 null. */
export function enforceRateLimit(
  request: NextRequest,
  options: RateLimitOptions,
): NextResponse | null {
  const now = Date.now();
  const retryAfter = Math.ceil(options.windowMs / 1000);

  const globalOk = hit(`${options.name}:__global__`, options.global, options.windowMs, now);
  const ipOk = hit(
    `${options.name}:${clientKey(request)}`,
    options.perIp,
    options.windowMs,
    now,
  );

  if (globalOk && ipOk) return null;

  return NextResponse.json(
    { error: "요청이 너무 잦습니다. 잠시 후 다시 시도해 주세요." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}

/** 테스트용 — 버킷을 비운다. */
export function __resetRateLimits(): void {
  buckets.clear();
}
