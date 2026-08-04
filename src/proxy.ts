import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@auth/core/jwt";

/**
 * 세션 쿠키가 `__Secure-` 접두사로 구워졌는지 판단한다.
 *
 * Auth.js는 HTTPS에서 세션 쿠키를 `__Secure-authjs.session-token`으로 굽고,
 * **그 이름을 salt로 삼아** JWT를 암호화한다(@auth/core/jwt의 `salt = cookieName`).
 * getToken()에 secureCookie를 넘기지 않으면 기본값이 non-secure 이름
 * (`authjs.session-token`)이라 쿠키를 찾지도, 찾았더라도 복호화하지도 못한다.
 *
 * 그러면 로그인은 성공해 쿠키까지 발급되는데 /sull-admin 접근이 매번 로그인
 * 페이지로 튕겨 무한 루프가 된다. 로컬 http에서는 이름이 우연히 맞아떨어져
 * 드러나지 않고, HTTPS로 서비스할 때만 터진다.
 *
 * TLS를 리버스 프록시가 종단하면 이 요청 자체는 http로 보이므로
 * x-forwarded-proto와 AUTH_URL도 함께 본다 — Auth.js가 쿠키 이름을 정할 때
 * 보는 신호와 같은 것을 봐야 양쪽이 어긋나지 않는다.
 */
function usesSecureCookies(request: NextRequest): boolean {
  if (process.env.AUTH_URL?.startsWith("https://")) return true;
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded?.split(",")[0]?.trim() === "https") return true;
  return new URL(request.url).protocol === "https:";
}

export async function proxy(request: NextRequest) {
  const { pathname } = new URL(request.url);
  if (pathname === "/sull-admin/login") return NextResponse.next();

  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) {
    const url = new URL("/sull-admin/login", request.url);
    url.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(url);
  }

  const token = await getToken({
    req: request,
    secret,
    secureCookie: usesSecureCookies(request),
  });
  if (!token || token.role !== "admin") {
    const url = new URL("/sull-admin/login", request.url);
    url.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/sull-admin/:path*"],
};
