"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface ProductImage {
  id: string;
  assetKey: string;
  alt: string;
  aspectRatio: number | null;
  ext: string | null;
  sortOrder: number;
}

interface ProductRow {
  id: string;
  name: string;
  category: string;
  material: string;
  description: string;
  price: number;
  imageAssetKey: string;
  imageAlt: string;
  imageExt: string | null;
  tags: unknown;
  sortOrder: number;
  images: ProductImage[];
}

const S3_BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL || "";

function thumbnailUrl(p: ProductRow): string | null {
  const key = p.imageAssetKey;
  if (!key || !S3_BASE) return null;
  const ext = p.imageExt || "jpg";
  return `${S3_BASE}/${key}.${ext}`;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((data) => setProducts(data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  if (loading) return <p className="text-neutral-500">로딩 중...</p>;

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
              <th className="px-4 py-3 font-medium text-neutral-500">정렬</th>
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
                  <span className="font-mono text-xs text-neutral-400">{p.sortOrder}</span>
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
