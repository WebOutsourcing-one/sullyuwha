import { SocialLoginButtons } from "../auth/SocialLoginButtons";

/**
 * 결제 전 로그인 안내.
 *
 * 로그인을 요구하는 이유 — 주문 후 본인이 내역을 확인하려면 본인 확인이 필요한데,
 * 이메일·SMS 발송이 연동돼 있지 않아 비회원에게 주문번호를 전달할 방법이 없다.
 * 소셜 로그인 세션을 본인 확인으로 쓰면 별도 인증 수단 없이 안전하게 조회할 수 있다.
 */
export function LoginRequired({ callbackUrl }: { callbackUrl: string }) {
  return (
    <div className="flex flex-col items-start gap-6 border border-line bg-mist/40 px-6 py-8">
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.18em] text-gold">Login</span>
        <p className="text-sm leading-relaxed text-taupe">
          주문과 결제는 로그인 후 진행됩니다. 주문 내역과 배송 상태를 언제든
          다시 확인하실 수 있도록 계정에 연결해 보관합니다.
        </p>
      </div>

      <SocialLoginButtons callbackUrl={callbackUrl} />
    </div>
  );
}
