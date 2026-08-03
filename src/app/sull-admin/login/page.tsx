"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import type { SignInResponse } from "next-auth/react";
import { useSearchParams } from "next/navigation";

/** Auth.js가 돌려주는 오류 코드 → 화면에 보여줄 문구. */
const ERROR_MESSAGE: Record<string, string> = {
  CredentialsSignin: "아이디 또는 비밀번호가 올바르지 않습니다.",
  Configuration: "로그인 서버 설정에 문제가 있습니다. 관리자에게 문의해 주세요.",
  AccessDenied: "이 계정으로는 관리자 페이지에 접근할 수 없습니다.",
};

/**
 * 로그인 후 돌아갈 경로. **같은 출처만** 허용한다.
 *
 * `?callbackUrl=https://evil.example` 처럼 외부 URL을 심어 두면 로그인에 성공한
 * 관리자가 그대로 외부 사이트로 튕겨나간다(오픈 리다이렉트). proxy.ts는 이 값에
 * 요청 URL 전체를 넣으므로 절대 URL도 받아야 하고, 그래서 출처를 직접 대조한다.
 */
function safeCallbackUrl(raw: string | null): string {
  const fallback = "/sull-admin";
  if (!raw) return fallback;
  try {
    const url = new URL(raw, window.location.origin);
    if (url.origin !== window.location.origin) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    // 선언된 반환 타입은 SignInResponse지만 런타임에는 undefined가 나올 수 있다.
    // (아래 !res 분기 참고) 타입을 실제 동작에 맞춰 넓힌다.
    let res: SignInResponse | undefined;
    try {
      res = await signIn("credentials", { email, password, redirect: false });
    } catch (err) {
      // 응답이 JSON이 아니거나 네트워크가 끊긴 경우. 이걸 잡지 않으면
      // 예외가 그대로 새어나가 로딩 상태에 멈춘 채 아무 안내도 뜨지 않는다.
      console.error("[admin-login] 로그인 요청 실패", err);
      setError("로그인 요청을 보내지 못했습니다. 네트워크 상태를 확인해 주세요.");
      setLoading(false);
      return;
    }

    // next-auth의 signIn은 `/api/auth/providers`가 실패하면 아무것도 돌려주지 않고
    // 끝난다(AUTH_SECRET 누락 등으로 500이 나는 경우). 예전에는 이 undefined를
    // 성공으로 보고 callbackUrl로 이동시켰는데, 그러면 proxy가 토큰이 없다며 다시
    // 로그인 페이지로 돌려보내서 "아무 안내 없이 화면만 새로고침"되는 것처럼 보였다.
    if (!res) {
      console.error(
        "[admin-login] 인증 설정을 불러오지 못했습니다. " +
          "AUTH_SECRET이 설정되어 있는지 확인하세요 (/api/auth/providers가 500을 반환합니다).",
      );
      setError(ERROR_MESSAGE.Configuration);
      setLoading(false);
      return;
    }

    if (res.error) {
      // 코드까지 남겨야 설정 문제(Configuration)와 자격증명 오류를 구분할 수 있다.
      console.error("[admin-login] 로그인 실패", res.error, res.code ?? "");
      setError(ERROR_MESSAGE[res.error] ?? `로그인에 실패했습니다. (${res.error})`);
      setLoading(false);
      return;
    }

    window.location.href = safeCallbackUrl(searchParams.get("callbackUrl"));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <h1 className="font-serif text-3xl font-light tracking-tight text-neutral-900">
            설유화
          </h1>
          <p className="mt-2 text-sm text-neutral-500">관리자 로그인</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-medium text-neutral-500">
              아이디
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              aria-invalid={error ? true : undefined}
              className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-neutral-400 focus:outline-none"
              placeholder="admin@sullyuwha.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-medium text-neutral-500">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              aria-invalid={error ? true : undefined}
              className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-neutral-400 focus:outline-none"
              placeholder="········"
            />
          </div>

          {/* role="alert"이라야 스크린리더가 제출 직후 읽어준다. */}
          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs leading-relaxed text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "로딩 중..." : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
