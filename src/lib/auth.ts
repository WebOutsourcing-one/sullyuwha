import NextAuth from "next-auth";
import type { DefaultSession } from "next-auth";
import Kakao from "next-auth/providers/kakao";
import Naver from "next-auth/providers/naver";
import Credentials from "next-auth/providers/credentials";
import { scryptSync, timingSafeEqual } from "node:crypto";

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

async function ensureAdminUser() {
  const adminEmail = process.env.AUTH_ADMIN_EMAIL;
  if (!adminEmail) return;

  const { getPrisma } = await import("@/infrastructure/db/prisma");
  const prisma = getPrisma();

  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existing) {
    await prisma.user.create({
      data: { email: adminEmail, name: "Admin", role: "admin" },
    });
  } else if (existing.role !== "admin") {
    await prisma.user.update({
      where: { id: existing.id },
      data: { role: "admin" },
    });
  }
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

        await ensureAdminUser();

        return { id: "admin", email: adminEmail, name: "Admin", role: "admin" };
      },
    }),
    Kakao,
    Naver,
  ],
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
      if (session.user) session.user.role = token.role;
      return session;
    },
  },
  pages: { signIn: "/sull-admin/login" },
});
