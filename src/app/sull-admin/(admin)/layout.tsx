import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/sull-admin/login");

  return (
    // 좁은 화면에서는 사이드바를 상단 바로 눕힌다.
    //
    // 예전에는 `w-56` 고정 사이드바가 가로로 붙박여 있었다. 375px 폰이면
    // 사이드바가 224px을 먹고 본문 여백(64px)까지 빼서 콘텐츠에 90px도 남지
    // 않았다 — 관리자 화면 전체가 폰에서 못 쓰는 상태였다.
    //
    // 햄버거 메뉴를 두지 않은 이유 — 항목이 둘뿐이라 접었다 펴는 상태를 들고 다닐
    // 만큼의 값이 없다. 그대로 늘어놓아도 한 줄에 들어가고, 레이아웃이 서버
    // 컴포넌트로 남아 클라이언트 번들도 늘지 않는다.
    <div className="flex min-h-screen flex-col bg-neutral-50 text-neutral-900 lg:flex-row">
      <aside className="flex shrink-0 flex-col border-neutral-200 bg-white lg:w-56 lg:border-r lg:p-5">
        <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3 lg:block lg:border-0 lg:px-0 lg:py-0">
          <Link
            href="/sull-admin"
            className="font-serif text-lg font-medium tracking-tight lg:mb-8 lg:block"
          >
            설유화 관리자
          </Link>
          {/* 좁은 화면에서는 계정 이름을 여기로 올린다. 아래 자리는 상단 바에 없다. */}
          <span className="truncate text-xs text-neutral-400 lg:hidden">
            {session.user.name}
          </span>
        </div>
        {/* 항목이 늘어 한 줄을 넘기면 잘리지 않고 가로로 밀리게 둔다. */}
        <nav className="flex gap-1 overflow-x-auto border-b border-neutral-200 px-4 py-2 lg:flex-col lg:overflow-visible lg:border-0 lg:px-0 lg:py-0">
          <Link
            href="/sull-admin/products"
            className="shrink-0 rounded px-3 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          >
            상품 관리
          </Link>
          <Link
            href="/sull-admin/orders"
            className="shrink-0 rounded px-3 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          >
            주문 내역
          </Link>
        </nav>
        <div className="mt-auto hidden pt-4 text-xs text-neutral-400 lg:block">
          {session.user.name}
        </div>
      </aside>
      {/* min-w-0 이 없으면 안의 표가 flex 아이템의 기본 너비(min-width:auto)를 밀어
          올려, 사이드바까지 화면 밖으로 밀려난다. */}
      <main className="min-w-0 flex-1 overflow-auto p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
