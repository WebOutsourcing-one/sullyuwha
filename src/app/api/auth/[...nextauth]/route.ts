import { NextRequest } from "next/server";
import { handlers } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rate-limit";

export const { GET } = handlers;

/** 자격증명 로그인 경로. 여기만 무차별 대입의 표적이 된다. */
const CREDENTIALS_CALLBACK = "/api/auth/callback/credentials";

/**
 * 관리자 비밀번호 로그인에 속도 제한을 건다.
 *
 * 두 가지를 막는다:
 *
 * 1. **무차별 대입** — 관리자 계정은 하나뿐이고 이메일도 추측 가능하다.
 *    제한이 없으면 남는 것은 비밀번호 강도뿐이다.
 * 2. **CPU 고갈** — 검증이 scrypt라 시도 한 번에 수십 ms의 CPU를 쓴다.
 *    동시 요청을 퍼부으면 로그인뿐 아니라 사이트 전체가 느려진다.
 *
 * 소셜 로그인(카카오·네이버)이나 세션 조회는 제한하지 않는다 —
 * 정상 사용에서 자주 호출되고, 비밀번호를 맞히는 경로가 아니다.
 *
 * ⚠️ 제한은 프로세스 메모리 기준이라 인스턴스마다 따로 센다(rate-limit.ts 참고).
 *    여러 대로 확장하면 공유 저장소로 옮겨야 한다.
 */
export async function POST(request: NextRequest) {
  if (request.nextUrl.pathname === CREDENTIALS_CALLBACK) {
    const limited = enforceRateLimit(request, {
      name: "admin-login",
      // 사람이 오타를 내며 다시 치는 정도는 넉넉히 통과하는 값.
      perIp: 10,
      // IP는 헤더에서 오므로 위조된다. 전역 상한이 실질적인 방어선이다.
      global: 60,
      windowMs: 60_000,
    });
    if (limited) return limited;
  }

  return handlers.POST(request);
}
