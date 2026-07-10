import type { Metadata } from "next";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/presentation/components/layout/SiteHeader";
import { SiteFooter } from "@/presentation/components/layout/SiteFooter";

const notoSans = Noto_Sans_KR({
  variable: "--font-noto-sans",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const notoSerif = Noto_Serif_KR({
  variable: "--font-noto-serif",
  weight: ["500", "700"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "수려화 | 전통 한복 공방",
  description:
    "전통의 결을 오늘의 삶에 맞춰 짓는 한복 브랜드, 수려화(秀麗花). 당의·활옷·철릭·도포 맞춤 제작.",
  openGraph: {
    title: "수려화 | 전통 한복 공방",
    description: "전통의 결을 오늘의 삶에 맞춰 짓는 한복 브랜드, 수려화.",
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
      className={`${notoSans.variable} ${notoSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
