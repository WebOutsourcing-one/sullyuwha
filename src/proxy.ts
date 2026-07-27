import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@auth/core/jwt";

export async function proxy(request: NextRequest) {
  const { pathname } = new URL(request.url);
  if (pathname === "/sull-admin/login") return NextResponse.next();

  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) {
    const url = new URL("/sull-admin/login", request.url);
    url.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(url);
  }

  const token = await getToken({ req: request, secret });
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
