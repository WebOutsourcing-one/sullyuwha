"use client";

import { signIn } from "next-auth/react";

const PROVIDERS = [
  { id: "kakao", label: "카카오로 계속하기" },
  { id: "naver", label: "네이버로 계속하기" },
] as const;

/**
 * 소셜 로그인 버튼 묶음.
 *
 * 결제 전 안내(LoginRequired)와 고객용 로그인 화면(/login) 두 곳에서 쓴다.
 * 각자 버튼을 들고 있으면 공급자를 추가할 때 한 곳만 고쳐져 화면마다 목록이 갈린다.
 */
export function SocialLoginButtons({ callbackUrl }: { callbackUrl: string }) {
  return (
    <div className="flex w-full flex-col gap-2 sm:max-w-xs">
      {PROVIDERS.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => signIn(p.id, { callbackUrl })}
          className="w-full border border-line px-5 py-3.5 text-xs uppercase tracking-[0.16em] text-taupe transition-colors duration-200 hover:border-gold hover:text-charcoal"
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
