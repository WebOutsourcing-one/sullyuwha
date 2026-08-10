"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { assetPreviewUrl } from "@/lib/asset-url";

/** /api/admin/products가 목록용으로 골라 내려주는 칸들. */
interface ProductRow {
  id: string;
  name: string;
  category: string;
  material: string;
  price: number;
  isBest: boolean;
  thumbnailAssetKey: string | null;
  thumbnailAlt: string | null;
  thumbnailExt: string | null;
  imageAssetKey: string;
  imageAlt: string;
  imageExt: string | null;
}

/**
 * 목록에 거는 컷. 목록 썸네일이 있으면 그것, 없으면 대표 컷으로 대체한다.
 * (도메인의 thumbnailOf와 같은 규칙 — 예전에는 여기만 대표 컷을 썼다)
 */
function thumbnailUrl(p: ProductRow): string | null {
  return p.thumbnailAssetKey
    ? assetPreviewUrl(p.thumbnailAssetKey, p.thumbnailExt)
    : assetPreviewUrl(p.imageAssetKey, p.imageExt);
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // 요청 중인 상품 id — 연타로 요청이 겹쳐 되돌림 상태가 엉키는 것을 막는다.
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    // 응답 상태를 확인한다. 예전에는 곧바로 json()을 읽어서, 401·500이면
    // `{error: ...}`가 products에 들어가고 뒤의 .map에서 화면이 통째로 깨졌다.
    fetch("/api/admin/products", { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error("상품 목록을 불러오지 못했습니다.");
        const data: unknown = await res.json();
        if (!Array.isArray(data)) throw new Error("상품 목록 형식이 올바르지 않습니다.");
        return data as ProductRow[];
      })
      .then((data) => {
        setProducts(data);
        setError(null);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  /**
   * BEST COLLECTION 지정/해제. 분류당 하나뿐이라 지정하면 같은 분류의 기존 것이 내려간다.
   *
   * 화면을 먼저 바꾸고 요청을 보낸다(낙관적 갱신) — 토글은 누른 즉시 반응해야
   * 여러 개를 견주며 바꾸는 흐름이 끊기지 않는다. 실패하면 이전 상태로 되돌린다.
   */
  const handleToggleBest = async (id: string) => {
    const current = products.find((p) => p.id === id);
    if (!current || toggling) return;

    const next = !current.isBest;
    const previous = products;

    setToggling(id);
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) return { ...p, isBest: next };
        // 같은 분류의 기존 베스트는 내려간다 — 서버가 하는 일을 화면에도 그대로 반영한다.
        if (next && p.category === current.category) return { ...p, isBest: false };
        return p;
      }),
    );

    try {
      const res = await fetch(`/api/admin/products/${id}/best`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBest: next }),
      });
      if (!res.ok) {
        const data: unknown = await res.json().catch(() => null);
        const message =
          typeof data === "object" && data !== null && "error" in data
            ? String((data as { error: unknown }).error)
            : "베스트 설정을 바꾸지 못했습니다.";
        setProducts(previous);
        alert(message);
      }
    } catch {
      setProducts(previous);
      alert("베스트 설정을 바꾸지 못했습니다.");
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    // 삭제가 실패했는데 목록에서만 지우면 새로고침 때 되살아나 혼란스럽다.
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("삭제하지 못했습니다.");
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  if (loading) return <p className="text-neutral-500">로딩 중...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-light">상품 관리</h1>
          <p className="mt-1 text-sm text-neutral-400">총 {products.length}개 상품</p>
        </div>
        <Link
          href="/sull-admin/products/new"
          className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
        >
          + 새 상품 등록
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50">
              <th className="w-16 px-4 py-3 font-medium text-neutral-500"></th>
              <th className="px-4 py-3 font-medium text-neutral-500">상품명</th>
              <th className="px-4 py-3 font-medium text-neutral-500">카테고리</th>
              <th className="px-4 py-3 font-medium text-neutral-500">소재</th>
              <th className="px-4 py-3 font-medium text-neutral-500">판매가</th>
              <th className="px-4 py-3 font-medium text-neutral-500">베스트</th>
              <th className="w-40 px-4 py-3 font-medium text-neutral-500">관리</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-neutral-100 transition-colors hover:bg-neutral-50">
                <td className="px-4 py-3">
                  {thumbnailUrl(p) ? (
                    // thumbnailUrl은 NEXT_PUBLIC_ASSET_BASE_URL이 있을 때만 값을 주고,
                    // next.config.ts의 remotePatterns도 같은 값에서 생성되므로 항상 허용된 호스트다.
                    <Image
                      src={thumbnailUrl(p)!}
                      alt={p.imageAlt || p.name}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100 text-xs text-neutral-400">
                      No
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-neutral-900">{p.name}</div>
                  <div className="mt-0.5 font-mono text-xs text-neutral-400">{p.id}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                    {p.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-600">{p.material}</td>
                <td className="px-4 py-3">
                  {p.price > 0 ? (
                    <span className="text-neutral-900">
                      {p.price.toLocaleString("ko-KR")}원
                    </span>
                  ) : (
                    <span className="rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                      가격 미정
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => handleToggleBest(p.id)}
                    disabled={toggling !== null}
                    aria-pressed={p.isBest}
                    title={
                      p.isBest
                        ? `${p.category} 베스트 — 눌러서 해제`
                        : `${p.category} 베스트로 지정 (기존 베스트는 해제됩니다)`
                    }
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors disabled:opacity-50 ${
                      p.isBest
                        ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
                        : "border-neutral-200 text-neutral-400 hover:bg-neutral-100"
                    }`}
                  >
                    <span aria-hidden>{p.isBest ? "★" : "☆"}</span>
                    {p.isBest ? "베스트" : "지정"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => router.push(`/sull-admin/products/${p.id}/edit`)}
                      className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 transition-colors hover:bg-neutral-100"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-500 transition-colors hover:bg-red-50"
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-neutral-400">
                  등록된 상품이 없습니다.
                  <br />
                  <Link href="/sull-admin/products/new" className="mt-2 inline-block text-sm text-neutral-600 underline">
                    첫 상품을 등록해보세요
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
