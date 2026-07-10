"use client";

import { useEffect, useState } from "react";
import { Container } from "../ui/Container";

const NAV_LINKS = [
  { label: "이야기", href: "#story" },
  { label: "컬렉션", href: "#collection" },
  { label: "장인정신", href: "#craft" },
  { label: "갤러리", href: "#gallery" },
  { label: "문의", href: "#contact" },
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
    <header className="sticky top-0 z-50 border-b border-line/70 bg-hanji/80 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between md:h-20">
          {/* 로고 */}
          <a href="#top" className="flex items-baseline gap-2" aria-label="설유화 홈">
            <span className="font-display text-2xl font-bold tracking-tight text-meok">
              설유화
            </span>
            <span className="hidden text-xs uppercase tracking-widest text-hwangto sm:inline">
              sullyuwha
            </span>
          </a>

          {/* 데스크톱 내비 */}
          <nav
            className="hidden items-center gap-8 md:flex"
            aria-label="주요 메뉴"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-meok-soft transition-colors duration-200 hover:text-dancheong-red"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              className="rounded-sm border border-meok px-4 py-2 text-sm text-meok transition-colors duration-200 ease-hanok hover:bg-meok hover:text-hanji"
            >
              상담 예약
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
                className={`absolute left-0 block h-0.5 w-6 bg-meok transition-all duration-300 ${
                  open ? "top-1.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-1.5 block h-0.5 w-6 bg-meok transition-opacity duration-300 ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 block h-0.5 w-6 bg-meok transition-all duration-300 ${
                  open ? "top-1.5 -rotate-45" : "top-3"
                }`}
              />
            </span>
          </button>
        </div>
      </Container>

      {/* 모바일 전체화면 메뉴 */}
      {open && (
        <div className="fixed inset-0 top-16 z-40 bg-hanji md:hidden">
          <nav
            className="flex flex-col gap-1 px-6 py-8"
            aria-label="모바일 메뉴"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-line/60 py-4 font-display text-xl text-meok"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="mt-6 rounded-sm bg-meok px-5 py-4 text-center text-hanji"
            >
              상담 예약
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
