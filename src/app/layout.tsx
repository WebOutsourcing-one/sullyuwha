import type { Metadata } from "next";
import { Cormorant_Garamond, Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/presentation/components/layout/SiteHeader";
import { SiteFooter } from "@/presentation/components/layout/SiteFooter";

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
  title: "설유화 | 실크 기성복",
  description:
    "실크를 일상으로 들이는 기성복 브랜드, 설유화. 실크 블라우스·슬립 원피스·셋업·스카프.",
  openGraph: {
    title: "설유화 | 실크 기성복",
    description: "실크를 일상으로 들이는 기성복 브랜드, 설유화.",
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
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
