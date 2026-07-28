import NextAuth from "next-auth";
import type { DefaultSession } from "next-auth";
import Kakao from "next-auth/providers/kakao";
import Naver from "next-auth/providers/naver";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { scryptSync, timingSafeEqual } from "node:crypto";
import { getPrisma } from "@/infrastructure/db/prisma";

/** 길이를 흘리지 않고 문자열을 비교한다. */
function timingSafeEqualStr(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * `AUTH_ADMIN_PASSWORD`에 저장된 scrypt 해시와 입력 비밀번호를 대조한다.
 *
 * 형식: `scrypt:<salt-hex>:<hash-hex>`
 *
 * 구분자로 `$`를 쓰지 않는 이유 — Next의 env 로더가 dotenv-expand를 거치면서
 * 값 안의 `$abc`를 변수 참조로 보고 빈 문자열로 치환해버린다.
 * `$`를 쓰면 해시가 조용히 잘려 로그인이 항상 실패한다.
 *
 * 평문 비교를 쓰지 않는 이유 — env가 유출되면 비밀번호가 그대로 노출되고,
 * `!==` 비교는 상수 시간이 아니다.
 * 형식이 어긋나면 로그인을 거부한다(fail-closed). 평문으로 폴백하지 않는다.
 */
function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") {
    console.error(
      "[auth] AUTH_ADMIN_PASSWORD 형식이 올바르지 않습니다. " +
        "`scrypt:<salt-hex>:<hash-hex>` 형태여야 합니다 (.env.example의 생성 명령 참고).",
    );
    return false;
  }

  const [, saltHex, hashHex] = parts;
  let expected: Buffer;
  try {
    expected = Buffer.from(hashHex, "hex");
  } catch {
    return false;
  }
  if (expected.length === 0) return false;

  const actual = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(actual, expected);
}

declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    // user.id는 next-auth가 이미 제공한다(주문을 계정에 연결할 때 쓴다).
    user: {
      role?: string;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: string;
  }
}

/**
 * 관리자 계정 행을 보장하고 그 id를 돌려준다.
 *
 * id를 돌려주는 이유 — 세션의 사용자 id가 DB에 실재해야 주문을 계정에 연결할 수 있다.
 * 예전처럼 `"admin"` 같은 가짜 id를 쓰면 orders.user_id 외래키가 깨진다.
 */
async function ensureAdminUser(): Promise<string | null> {
  const adminEmail = process.env.AUTH_ADMIN_EMAIL;
  if (!adminEmail) return null;

  const { getPrisma } = await import("@/infrastructure/db/prisma");
  const prisma = getPrisma();

  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existing) {
    const created = await prisma.user.create({
      data: { email: adminEmail, name: "Admin", role: "admin" },
    });
    return created.id;
  }

  if (existing.role !== "admin") {
    await prisma.user.update({
      where: { id: existing.id },
      data: { role: "admin" },
    });
  }
  return existing.id;
}

/**
 * 어댑터는 DATABASE_URL이 있을 때만 붙인다.
 *
 * 어댑터를 붙이면 카카오·네이버 로그인 사용자가 users/accounts에 저장되고,
 * 그래야 주문을 계정에 연결할 수 있다. 다만 DB 없이 도는 정적 개발 모드에서는
 * 어댑터 생성이 곧바로 터지므로 조건부로 둔다.
 */
function createAdapter() {
  if (!process.env.DATABASE_URL) return undefined;
  return PrismaAdapter(getPrisma());
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const adminEmail = process.env.AUTH_ADMIN_EMAIL;
        const storedHash = process.env.AUTH_ADMIN_PASSWORD;
        if (!adminEmail || !storedHash) return null;

        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") return null;
        if (!timingSafeEqualStr(email, adminEmail)) return null;
        if (!verifyPassword(password, storedHash)) return null;

        const id = await ensureAdminUser();

        return { id: id ?? "admin", email: adminEmail, name: "Admin", role: "admin" };
      },
    }),
    Kakao,
    Naver,
  ],
  adapter: createAdapter(),
  // 어댑터가 붙으면 Auth.js의 기본 세션 전략이 "database"로 바뀐다.
  // 그러면 proxy.ts의 getToken()이 아무것도 못 읽어 관리자 페이지가 전부 막힌다.
  // JWT 전략을 명시적으로 고정한다.
  session: { strategy: "jwt" },
  // Vercel이 아닌 자체 호스팅(Lightsail)에서는 이 값이 없으면 Auth.js가
  // 모든 인증 요청을 UntrustedHost로 거부한다 — 관리자 로그인이 전부 실패한다.
  //
  // 다만 이 설정은 콜백 URL을 요청의 Host 헤더에서 유도한다는 뜻이므로,
  // 프로덕션에서는 `AUTH_URL`을 명시해 Host 헤더 위조의 영향을 없애는 것이 안전하다.
  trustHost: true,
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        // JWT 전략에서는 세션에 사용자 id가 자동으로 실리지 않는다.
        // token.sub은 로그인 직후 채워지지만 타입상 optional이라 확인 후 넣는다.
        if (token.sub) session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: { signIn: "/sull-admin/login" },
});
