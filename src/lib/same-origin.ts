import { NextRequest, NextResponse } from "next/server";

/**
 * 상태를 바꾸는 요청이 우리 사이트에서 온 것인지 확인한다(CSRF 방어).
 *
 * 1차 방어는 NextAuth 세션 쿠키의 `SameSite=Lax`다 — 크로스 사이트 POST에는
 * 쿠키가 실리지 않는다. 다만 그것만 믿으면 다음이 남는다:
 *
 * - 라우트 핸들러는 `request.json()`이 Content-Type을 보지 않으므로,
 *   `enctype="text/plain"` 폼으로도 유효한 JSON 본문을 만들 수 있다.
 *   즉 SameSite가 무력화되는 순간(구형 브라우저·쿠키 설정 변경) 곧바로
 *   /api/admin/orders/[id]의 환불이 크로스 사이트에서 호출 가능해진다.
 * - 쿠키 설정을 나중에 `SameSite=None`으로 바꾸면 방어가 통째로 사라진다.
 *
 * Origin 헤더가 **있는데** 우리 출처와 다르면 거부한다.
 * 헤더가 아예 없으면 브라우저가 아닌 클라이언트(서버 간 호출·curl·토스 웹훅)이므로
 * 통과시킨다 — CSRF는 브라우저가 쿠키를 자동으로 실어 보낼 때만 성립한다.
 */
export function denyCrossOrigin(request: NextRequest): NextResponse | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;

  const allowed = allowedOrigins(request);
  if (allowed.has(origin)) return null;

  console.warn("[security] 교차 출처 요청 거부", {
    origin,
    allowed: [...allowed],
    path: request.nextUrl.pathname,
  });
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/**
 * 허용 출처 — 설정된 `AUTH_URL`과 요청이 실제로 도달한 출처.
 *
 * 요청 출처를 함께 허용해도 CSRF 방어는 약해지지 않는다. 교차 사이트 요청에서
 * 브라우저는 Origin에 **공격자 페이지의 출처**를 넣고 Host에는 우리 도메인을 넣는다.
 * 따라서 Origin이 요청 출처와 같다는 것은 우리 도메인의 페이지에서 온 요청이라는 뜻이다.
 * (Host 위조는 별개의 공격이며, 그 경우 브라우저 쿠키가 실리지 않아 CSRF가 성립하지 않는다.)
 *
 * 둘 다 보는 이유 — AUTH_URL만 쓰면 apex/www가 다르거나 스테이징 도메인에서
 * 정상 요청이 403으로 막힌다. 요청 출처만 쓰면 프록시 구성에 따라 흔들린다.
 */
function allowedOrigins(request: NextRequest): Set<string> {
  const origins = new Set<string>([request.nextUrl.origin]);

  // 리버스 프록시가 TLS를 종단하면 앱에 도달하는 요청은 평문 http다.
  // 그래서 nextUrl.origin은 `http://도메인`이 되는데 브라우저가 보내는 Origin은
  // `https://도메인`이라 스킴만 달라 어긋난다. AUTH_URL이 덮어 주는 것은
  // 그 한 도메인뿐이라, apex와 www를 함께 서비스하면 한쪽이 통째로 막힌다.
  // (실제로 www 없이 접속하면 관리자 쓰기 요청이 전부 403이었다)
  //
  // 호스트는 여전히 Host 헤더에서 온 값(nextUrl.host)을 쓰고 스킴만 바로잡는다.
  // 교차 사이트 공격에서는 브라우저가 Origin에 공격자 출처를 넣으므로,
  // 요청이 도달한 출처를 허용해도 CSRF 방어는 그대로다(위 주석 참고).
  const forwardedProto = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();
  if (forwardedProto) {
    origins.add(`${forwardedProto}://${request.nextUrl.host}`);
  }

  const configured = process.env.AUTH_URL?.trim();
  if (configured) {
    try {
      origins.add(new URL(configured).origin);
    } catch {
      /* 형식이 잘못된 값은 무시한다 */
    }
  }

  return origins;
}
