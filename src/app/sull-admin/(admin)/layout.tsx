import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/sull-admin/login");

  return (
    <div className="flex min-h-screen bg-neutral-50 text-neutral-900">
      <aside className="flex w-56 flex-col border-r border-neutral-200 bg-white p-5">
          <Link href="/sull-admin" className="mb-8 font-serif text-lg font-medium tracking-tight">
          설유화 관리자
        </Link>
        <nav className="flex flex-col gap-1">
          <Link
            href="/sull-admin/products"
            className="rounded px-3 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          >
            상품 관리
          </Link>
        </nav>
        <div className="mt-auto pt-4 text-xs text-neutral-400">
          {session.user.name}
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
