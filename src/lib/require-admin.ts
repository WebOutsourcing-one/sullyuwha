import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * 관리자 세션을 요구하는 API 가드.
 *
 * `src/proxy.ts`의 matcher는 `/sull-admin/:path*` 뿐이라 `/api/*`를 덮지 않는다.
 * 따라서 미들웨어에만 의존하면 API는 무방비가 된다 —
 * 쓰기 가능한 라우트 핸들러는 각자 이 가드를 호출해야 한다.
 *
 * @returns 통과 시 null, 거부 시 그대로 반환할 응답
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // 카카오·네이버로 가입한 일반 사용자는 role이 없다. 관리자만 통과시킨다.
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}
