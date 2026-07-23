"use client";

import { useEffect, useState } from "react";
import { Container } from "../ui/Container";
import { Emblem } from "../ui/Icons";

const NAV_LINKS = [
  { label: "BRAND", href: "/#top" },
  { label: "COLLECTION", href: "/#collection" },
  { label: "BESPOKE", href: "/#bespoke" },
  { label: "STORY", href: "/#about" },
  { label: "CONTACT", href: "/#contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

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
    <header className="sticky top-0 z-50 border-b border-line/60 bg-ivory">
      <Container>
        <div className="flex h-16 items-center justify-between md:h-20">
          {/* 워드마크 + 엠블럼 */}
          <a
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
          </a>

          {/* 데스크톱 내비 */}
          <nav
            className="hidden items-center gap-10 md:flex"
            aria-label="주요 메뉴"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs uppercase tracking-[0.16em] text-taupe transition-colors duration-200 hover:text-charcoal"
              >
                {link.label}
              </a>
            ))}
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
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-line/60 py-4 font-serif text-xl font-light tracking-[0.05em] text-charcoal"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
