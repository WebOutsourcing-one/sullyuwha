"use client";

import { useEffect, useState } from "react";
import { Container } from "../ui/Container";

const NAV_LINKS = [
  { label: "브랜드", href: "/#story" },
  { label: "컬렉션", href: "/#collection" },
  { label: "실크", href: "/#silk" },
  { label: "룩북", href: "/#lookbook" },
  { label: "문의", href: "/#contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  // 메뉴 열림 시 배경 스크롤 잠금 + ESC 닫기
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

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-ivory/80 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between md:h-20">
          {/* 워드마크 */}
          <a href="/#top" className="flex items-baseline gap-2.5" aria-label="설유화 홈">
            <span className="font-serif text-2xl font-light tracking-tight text-charcoal">
              설유화
            </span>
            <span className="hidden text-[0.65rem] uppercase tracking-[0.22em] text-gold sm:inline">
              Seolyuhwa
            </span>
          </a>

          {/* 데스크톱 내비 */}
          <nav
            className="hidden items-center gap-9 md:flex"
            aria-label="주요 메뉴"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-taupe transition-colors duration-200 hover:text-charcoal"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/#contact"
              className="rounded-sm border border-charcoal px-5 py-2 text-xs uppercase tracking-[0.12em] text-charcoal transition-colors duration-300 ease-silk hover:bg-charcoal hover:text-ivory"
            >
              문의하기
            </a>
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
          <nav
            className="flex flex-col gap-1 px-6 py-8"
            aria-label="모바일 메뉴"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-line/60 py-4 font-serif text-xl font-light text-charcoal"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/#contact"
              onClick={() => setOpen(false)}
              className="mt-6 rounded-sm bg-charcoal px-5 py-4 text-center text-xs uppercase tracking-[0.12em] text-ivory"
            >
              문의하기
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
