import type { Metadata } from "next";
import Script from "next/script";
import { Cormorant_Garamond, Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/presentation/components/layout/SiteHeader";
import { SiteFooter } from "@/presentation/components/layout/SiteFooter";
import { SessionProvider } from "@/presentation/components/ui/SessionProvider";

const notoSans = Noto_Sans_KR({
  variable: "--font-noto-sans",
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const notoSerif = Noto_Serif_KR({
  variable: "--font-noto-serif",
  weight: ["300", "400"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

// 라틴 세리프 — 워드마크/제목의 라틴 글자에 사용 (한글은 Noto Serif KR로 폴백)
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "설유화 | 한복 예복 · 맞춤",
  description:
    "전통의 아름다움 위에 현대의 감각을 더해 단 하나의 예복을 짓는 한복 브랜드, 설유화.",
  openGraph: {
    title: "설유화 | 한복 예복 · 맞춤",
    description:
      "전통의 아름다움 위에 현대의 감각을 더해 단 하나의 예복을 짓습니다.",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html
        lang="ko"
        className={`${notoSans.variable} ${notoSerif.variable} ${cormorant.variable} h-full antialiased`}
      >
        {process.env.NODE_ENV === "development" && (
          <head>
            {/* 프로토콜 상대 URL(`//`)은 http 페이지에서 http로 내려가 중간자 공격에
                노출된다. 서드파티 스크립트는 항상 https로 고정한다. */}
            <Script
              src="https://unpkg.com/react-grab/dist/index.global.js"
              crossOrigin="anonymous"
              strategy="beforeInteractive"
            />
          </head>
        )}
      <body className="flex min-h-full flex-col">
        <SessionProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </SessionProvider>
      </body>
    </html>
  );
}
