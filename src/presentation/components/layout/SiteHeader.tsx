"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Container } from "../ui/Container";
import { Emblem } from "../ui/Icons";

const NAV_LINKS = [
  { label: "BRAND", href: "/#top" },
  { label: "COLLECTION", href: "/#collection" },
  { label: "BESPOKE", href: "/#bespoke" },
  { label: "STORY", href: "/#about" },
  { label: "CONTACT", href: "/#contact" },
] as const;

const LOGIN_PROVIDERS = [
  { id: "kakao", label: "카카오 로그인", short: "Kakao" },
  { id: "naver", label: "네이버 로그인", short: "Naver" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { data: session, status } = useSession();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDropdownOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [dropdownOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-line/60 bg-ivory">
      <Container>
        <div className="flex h-16 items-center justify-between md:h-20">
          {/* 워드마크 + 엠블럼 */}
          <Link
            href="/#top"
            className="flex items-center gap-2.5"
            aria-label="설유화 홈"
          >
            <Emblem className="h-6 w-6 text-gold" aria-hidden />
            <span className="flex flex-col leading-none">
              <span className="font-serif text-xl font-light tracking-tight text-charcoal">
                설유화
              </span>
              <span className="mt-1 text-[0.55rem] uppercase tracking-[0.32em] text-taupe">
                Sullyuwha
              </span>
            </span>
          </Link>

          {/* 데스크톱 내비 */}
          <nav
            className="hidden items-center gap-10 md:flex"
            aria-label="주요 메뉴"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs uppercase tracking-[0.16em] text-taupe transition-colors duration-200 hover:text-charcoal"
              >
                {link.label}
              </Link>
            ))}

            {/* 로그인 */}
            <div className="relative" ref={dropdownRef}>
              {status === "authenticated" ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/sull-admin"
                    className="text-xs uppercase tracking-[0.16em] text-taupe transition-colors duration-200 hover:text-charcoal"
                  >
                    Admin
                  </Link>
                  <span className="text-xs text-taupe">
                    {session.user?.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="text-xs uppercase tracking-[0.16em] text-taupe transition-colors duration-200 hover:text-charcoal"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen((v) => !v)}
                    className="text-xs uppercase tracking-[0.16em] text-taupe transition-colors duration-200 hover:text-charcoal"
                  >
                    Login
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-44 rounded-sm border border-line/60 bg-ivory py-1 shadow-lg">
                      {LOGIN_PROVIDERS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => signIn(p.id)}
                          className="flex w-full items-center px-4 py-2.5 text-sm text-charcoal transition-colors duration-200 hover:bg-mist/50"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </nav>

          {/* 모바일 토글 */}
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center md:hidden"
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative block h-4 w-6">
              <span
                className={`absolute left-0 block h-px w-6 bg-charcoal transition-all duration-300 ${
                  open ? "top-1.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-1.5 block h-px w-6 bg-charcoal transition-opacity duration-300 ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 block h-px w-6 bg-charcoal transition-all duration-300 ${
                  open ? "top-1.5 -rotate-45" : "top-3"
                }`}
              />
            </span>
          </button>
        </div>
      </Container>

      {/* 모바일 전체화면 메뉴 */}
      {open && (
        <div className="fixed inset-0 top-16 z-40 bg-ivory md:hidden">
          <nav className="flex flex-col gap-1 px-6 py-8" aria-label="모바일 메뉴">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-line/60 py-4 font-serif text-xl font-light tracking-[0.05em] text-charcoal"
              >
                {link.label}
              </Link>
            ))}

            {/* 모바일 로그인 — 내비게이션의 하위 액션이므로 산세리프 소형 라벨로
                한 단계 낮춘다. font-serif(Cormorant)는 라틴 전용이라 한글이
                Noto Serif KR로 대체되며 같은 크기에서도 훨씬 크고 무겁게 보인다. */}
            {status === "authenticated" ? (
              <div className="mt-8">
                <p className="text-[0.6rem] uppercase tracking-[0.28em] text-gold">
                  Account
                </p>
                <p className="mt-2 text-sm text-taupe">{session.user?.name}</p>
                <div className="mt-3 flex gap-2">
                  <Link
                    href="/sull-admin"
                    onClick={() => setOpen(false)}
                    className="flex-1 border border-line px-4 py-3 text-center text-xs uppercase tracking-[0.16em] text-taupe transition-colors duration-200 hover:border-gold hover:text-charcoal"
                  >
                    Admin
                  </Link>
                  <button
                    type="button"
                    onClick={() => { setOpen(false); signOut(); }}
                    className="flex-1 border border-line px-4 py-3 text-xs uppercase tracking-[0.16em] text-taupe transition-colors duration-200 hover:border-gold hover:text-charcoal"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-8">
                <p className="text-[0.6rem] uppercase tracking-[0.28em] text-gold">
                  Login
                </p>
                <div className="mt-3 flex gap-2">
                  {LOGIN_PROVIDERS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { setOpen(false); signIn(p.id); }}
                      className="flex-1 border border-line px-4 py-3 text-xs uppercase tracking-[0.16em] text-taupe transition-colors duration-200 hover:border-gold hover:text-charcoal"
                    >
                      {p.short}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
