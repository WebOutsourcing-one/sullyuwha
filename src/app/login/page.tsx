import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Container } from "@/presentation/components/ui/Container";
import { SocialLoginButtons } from "@/presentation/components/auth/SocialLoginButtons";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// 세션 상태에 따라 갈리는 화면이라 캐시하지 않는다.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "로그인 | 설유화",
  robots: { index: false, follow: false },
};

/**
 * Auth.js가 돌려주는 오류 코드 → 고객에게 보여줄 안내.
 *
 * 원인을 짐작할 수 있게 쓰되 내부 구조는 드러내지 않는다.
 * 목록에 없는 코드는 아래 기본 문구로 떨어진다.
 */
const ERROR_MESSAGE: Record<string, string> = {
  // 같은 이메일이 다른 공급자로 이미 가입된 경우.
  // Auth.js는 이메일이 겹쳐도 계정을 자동으로 잇지 않는다(계정 탈취 방지).
  // 고객 입장에서 가장 자주 만나고 가장 원인을 알기 어려운 오류라 문구를 구체적으로 둔다.
  OAuthAccountNotLinked:
    "이미 다른 방법으로 가입된 이메일입니다. 처음 가입하실 때 사용한 카카오 또는 네이버로 로그인해 주세요.",
  AccessDenied: "로그인 동의가 취소되었습니다. 다시 시도해 주세요.",
  Verification: "인증 링크가 만료되었거나 이미 사용되었습니다. 다시 시도해 주세요.",
  Configuration: "로그인 설정에 문제가 있어 진행할 수 없습니다. 잠시 후 다시 시도해 주세요.",
  OAuthSignin: "로그인 화면으로 이동하지 못했습니다. 잠시 후 다시 시도해 주세요.",
  OAuthCallback: "로그인 처리를 완료하지 못했습니다. 다시 시도해 주세요.",
  OAuthCreateAccount: "계정을 만들지 못했습니다. 잠시 후 다시 시도해 주세요.",
  Callback: "로그인 처리를 완료하지 못했습니다. 다시 시도해 주세요.",
  SessionRequired: "로그인이 필요한 페이지입니다.",
};

const DEFAULT_ERROR = "로그인하지 못했습니다. 잠시 후 다시 시도해 주세요.";

function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

/**
 * 로그인 후 돌아갈 경로. **같은 출처의 경로만** 허용한다.
 *
 * `?callbackUrl=https://evil.example` 을 심어 두면 로그인에 성공한 고객이 그대로
 * 외부 사이트로 튕겨나간다(오픈 리다이렉트). 서버 컴포넌트라 window가 없으므로
 * 절대 URL은 받지 않고 경로만 통과시킨다.
 */
function safeCallbackUrl(raw: string): string {
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

/**
 * 고객용 로그인·오류 화면.
 *
 * Auth.js의 `pages.signIn`·`pages.error`가 여기를 가리킨다.
 * 예전에는 둘 다 `/sull-admin/login`이어서, 카카오 로그인에 실패한 일반 고객이
 * 관리자 이메일·비밀번호 폼을 보게 됐다 — 원인도 알 수 없고 관리자 경로도 드러났다.
 *
 * ⚠️ 이 화면은 로그인을 요구하면 안 된다. Auth.js가 오류 페이지에서 인증을 요구하면
 *    무한 루프로 보고 거부한다(ErrorPageLoop).
 */
export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const error = one(params.error);
  const callbackUrl = safeCallbackUrl(one(params.callbackUrl) || "/");

  // 이미 로그인한 사람이 이 주소로 들어오면 머무를 이유가 없다.
  // 다만 오류를 표시해야 할 때는 남긴다(다른 계정으로 다시 시도하는 경우).
  const session = await auth();
  if (session?.user && !error) redirect(callbackUrl);

  return (
    <Container className="flex flex-col items-center py-24 text-center md:py-32">
      <span aria-hidden className={`block h-px w-12 ${error ? "bg-taupe" : "bg-gold"}`} />

      <h1 className="mt-8 text-[clamp(1.75rem,3.5vw,2.5rem)] font-light">
        {error ? "로그인하지 못했습니다" : "로그인"}
      </h1>

      {error ? (
        <p role="alert" className="mt-4 max-w-md text-sm leading-relaxed text-taupe">
          {ERROR_MESSAGE[error] ?? DEFAULT_ERROR}
        </p>
      ) : (
        <p className="mt-4 max-w-md text-sm leading-relaxed text-taupe">
          주문 내역과 배송 상태를 언제든 다시 확인하실 수 있도록
          계정에 연결해 보관합니다.
        </p>
      )}

      <div className="mt-10 flex w-full max-w-xs flex-col items-center gap-6">
        <SocialLoginButtons callbackUrl={callbackUrl} />

        <Link
          href="/"
          className="text-xs uppercase tracking-[0.16em] text-taupe transition-colors hover:text-charcoal"
        >
          홈으로
        </Link>
      </div>

      {error && (
        // 문의로 이어질 수 있게 둔다 — 문구만으로 해결되지 않는 경우가 있다.
        <p className="mt-10 text-xs text-taupe/70">
          계속 안 되시면{" "}
          <Link href="/#contact" className="underline transition-colors hover:text-charcoal">
            문의
          </Link>
          로 알려주세요.
        </p>
      )}
    </Container>
  );
}
