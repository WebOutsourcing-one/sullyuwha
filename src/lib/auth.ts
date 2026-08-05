import NextAuth from "next-auth";
import type { DefaultSession } from "next-auth";
import Kakao from "next-auth/providers/kakao";
import Naver from "next-auth/providers/naver";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { getPrisma } from "@/infrastructure/db/prisma";

/**
 * scrypt를 비동기로 쓴다.
 *
 * `scryptSync`는 시도 한 번마다 수십 ms 동안 **이벤트 루프를 통째로 막는다**.
 * 로그인 요청을 동시에 퍼부으면 로그인뿐 아니라 상품 페이지·결제까지 같이 멈춘다.
 * 비동기 버전은 libuv 스레드풀에서 돌아 요청 처리를 막지 않는다.
 * (무차별 대입 자체는 라우트의 속도 제한이 막는다 — api/auth/[...nextauth]/route.ts)
 */
const scrypt = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

/**
 * 문자열을 상수 시간으로 비교한다.
 *
 * 길이가 다르면 곧바로 false다 — timingSafeEqual이 같은 길이를 요구하기 때문이며,
 * 여기서 길이는 새어 나간다. 관리자 이메일 길이는 비밀이 아니라 문제되지 않는다.
 * 비밀번호에는 쓰지 말 것(verifyPassword가 해시끼리 비교한다).
 */
function timingSafeEqualStr(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** 저장 형식 접두사. 구분자가 `:`인 이유는 verifyPassword 주석 참고. */
const HASH_PREFIX = "scrypt:";

/** 평문 비밀번호를 `scrypt:<salt-hex>:<hash-hex>` 형태로 만든다. */
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `${HASH_PREFIX}${salt.toString("hex")}:${hash.toString("hex")}`;
}

/**
 * 저장된 scrypt 해시와 입력 비밀번호를 대조한다.
 *
 * 형식: `scrypt:<salt-hex>:<hash-hex>`
 *
 * 구분자로 `$`를 쓰지 않는 이유 — Next의 env 로더가 dotenv-expand를 거치면서
 * 값 안의 `$abc`를 변수 참조로 보고 빈 문자열로 치환해버린다.
 * `$`를 쓰면 해시가 조용히 잘려 로그인이 항상 실패한다.
 *
 * 평문 비교를 쓰지 않는 이유 — 저장소가 유출되면 비밀번호가 그대로 노출되고,
 * `!==` 비교는 상수 시간이 아니다.
 * 형식이 어긋나면 로그인을 거부한다(fail-closed). 평문으로 폴백하지 않는다.
 */
async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") {
    console.error(
      "[auth] 저장된 관리자 비밀번호 해시 형식이 올바르지 않습니다. " +
        "`scrypt:<salt-hex>:<hash-hex>` 형태여야 합니다.",
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

  const actual = await scrypt(password, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(actual, expected);
}

/**
 * `AUTH_ADMIN_PASSWORD`를 읽어 저장 가능한 형태로 정규화한다.
 *
 * 평문과 이미 해싱된 값을 모두 받는다:
 * - 평문 (`AUTH_ADMIN_PASSWORD=mySecret`) — 초기 설정 편의를 위한 입력.
 *   그대로 두지 않고 해싱해서 DB에 저장한다.
 * - `scrypt:...` 해시 — env에 원문을 남기고 싶지 않을 때 쓰는 기존 방식.
 *
 * `plaintext`를 따로 들고 있는 이유 — 평문을 해싱하면 salt가 매번 달라져
 * 문자열 비교로는 "env 값이 바뀌었는지"를 판단할 수 없다.
 * 저장된 해시와 대조하려면 원문이 필요하다.
 */
interface EnvAdminPassword {
  readonly plaintext: string | null;
  readonly hash: string;
}

async function readEnvAdminPassword(): Promise<EnvAdminPassword | null> {
  const raw = process.env.AUTH_ADMIN_PASSWORD?.trim();
  if (!raw) return null;

  if (raw.startsWith(HASH_PREFIX)) {
    const parts = raw.split(":");
    if (parts.length !== 3 || !parts[1] || !parts[2]) {
      console.error(
        "[auth] AUTH_ADMIN_PASSWORD가 `scrypt:`로 시작하지만 형식이 올바르지 않습니다. " +
          "`scrypt:<salt-hex>:<hash-hex>` 형태여야 합니다.",
      );
      return null;
    }
    return { plaintext: null, hash: raw };
  }

  return { plaintext: raw, hash: await hashPassword(raw) };
}

/** env의 비밀번호가 저장된 해시와 같은 비밀번호를 가리키는가. */
async function envMatchesStored(
  env: EnvAdminPassword,
  storedHash: string,
): Promise<boolean> {
  // 평문이면 저장된 해시로 검증한다(salt가 달라 문자열 비교는 무의미하다).
  if (env.plaintext !== null) return verifyPassword(env.plaintext, storedHash);
  return env.hash === storedHash;
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

/** 관리자 계정의 id와 대조에 쓸 비밀번호 해시. */
interface AdminCredential {
  readonly id: string;
  readonly passwordHash: string;
}

/**
 * 관리자 계정을 보장하고, 비밀번호 대조에 쓸 해시를 돌려준다.
 *
 * 동작 요약 — env의 `AUTH_ADMIN_PASSWORD`가 진실의 출처다:
 * 1. 계정이 없으면 env 비밀번호를 **해싱해서** 만든다.
 * 2. 계정이 있는데 env 비밀번호가 저장된 해시와 다르면 저장된 해시를 갱신한다.
 *    (비밀번호를 바꾸려면 env만 고치고 재시작하면 된다)
 * 3. env에 비밀번호가 없으면 **DB에 저장된 해시로 검증한다.**
 *    즉 한 번 부팅한 뒤에는 env에서 평문을 지워도 로그인이 유지된다.
 *
 * id를 돌려주는 이유 — 세션의 사용자 id가 DB에 실재해야 주문을 계정에 연결할 수 있다.
 * `"admin"` 같은 가짜 id를 쓰면 orders.user_id 외래키가 깨진다.
 */
async function ensureAdminCredential(adminEmail: string): Promise<AdminCredential | null> {
  const env = await readEnvAdminPassword();

  // DB 없이 도는 정적 개발 모드. getPrisma()가 곧바로 던지므로 DB를 건드리지 않는다.
  // authorize() 안에서 던진 예외는 Auth.js가 Configuration 오류로 바꿔버려서
  // 비밀번호가 맞아도 로그인이 실패하고 화면에 원인이 드러나지 않는다.
  if (!process.env.DATABASE_URL) {
    if (!env) {
      console.error("[auth] AUTH_ADMIN_PASSWORD가 설정되지 않아 관리자 로그인이 불가합니다.");
      return null;
    }
    // 저장할 DB가 없으니 env 값으로만 검증한다. 주문 연결은 어차피 DB가 필요하다.
    return { id: "admin", passwordHash: env.hash };
  }

  const prisma = getPrisma();
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existing) {
    if (!env) {
      console.error(
        "[auth] 관리자 계정이 없고 AUTH_ADMIN_PASSWORD도 비어 있습니다. " +
          "초기 비밀번호를 env에 넣고 다시 시도하세요.",
      );
      return null;
    }
    const created = await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Admin",
        role: "admin",
        passwordHash: env.hash,
      },
    });
    console.info(`[auth] 관리자 계정을 생성했습니다: ${adminEmail}`);
    return { id: created.id, passwordHash: env.hash };
  }

  // 소셜 로그인으로 먼저 만들어진 행이 관리자 이메일과 겹칠 수 있다. 역할을 맞춰 준다.
  if (existing.role !== "admin") {
    await prisma.user.update({ where: { id: existing.id }, data: { role: "admin" } });
  }

  if (!env) {
    if (!existing.passwordHash) {
      console.error(
        "[auth] 관리자 계정에 비밀번호가 없고 AUTH_ADMIN_PASSWORD도 비어 있습니다. " +
          "env에 비밀번호를 넣고 다시 시도하세요.",
      );
      return null;
    }
    // env에서 평문을 지운 뒤의 정상 경로다.
    return { id: existing.id, passwordHash: existing.passwordHash };
  }

  if (!existing.passwordHash || !(await envMatchesStored(env, existing.passwordHash))) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { passwordHash: env.hash },
    });
    console.info("[auth] 관리자 비밀번호를 AUTH_ADMIN_PASSWORD 값으로 갱신했습니다.");
    return { id: existing.id, passwordHash: env.hash };
  }

  return { id: existing.id, passwordHash: existing.passwordHash };
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
        const adminEmail = process.env.AUTH_ADMIN_EMAIL?.trim();
        if (!adminEmail) {
          console.error("[auth] AUTH_ADMIN_EMAIL이 설정되지 않았습니다.");
          return null;
        }

        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") return null;

        // 이메일 대조를 DB 조회보다 먼저 한다 —
        // 아무나 계정 생성·갱신 경로를 건드리지 못하게 막는 순서다.
        if (!timingSafeEqualStr(email, adminEmail)) return null;

        const admin = await ensureAdminCredential(adminEmail);
        if (!admin) return null;
        if (!(await verifyPassword(password, admin.passwordHash))) return null;

        return { id: admin.id, email: adminEmail, name: "Admin", role: "admin" };
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
