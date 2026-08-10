"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProductForm } from "@/presentation/components/admin/ProductForm";

interface FormData {
  id: string;
  name: string;
  category: string;
  material: string;
  description: string;
  price: string;
  imageAssetKey: string;
  imageAlt: string;
  imageExt: string;
  thumbnailAssetKey: string;
  thumbnailAlt: string;
  thumbnailExt: string;
  tags: string;
  story: string;
  specs: string;
  care: string;
  detail: string;
}

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const [initial, setInitial] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/products/${params.id}`)
      .then((r) => r.json())
      .then((p) =>
        setInitial({
          id: p.id,
          name: p.name,
          category: p.category,
          material: p.material,
          description: p.description,
          price: String(p.price ?? 0),
          imageAssetKey: p.imageAssetKey,
          imageAlt: p.imageAlt,
          imageExt: p.imageExt ?? "",
          thumbnailAssetKey: p.thumbnailAssetKey ?? "",
          thumbnailAlt: p.thumbnailAlt ?? "",
          thumbnailExt: p.thumbnailExt ?? "",
          tags: JSON.stringify(p.tags),
          story: p.story ?? "",
          specs: JSON.stringify(p.specs),
          care: JSON.stringify(p.care),
          // 컬럼이 비어 있으면 null이 와서 JSON.stringify가 "null"이 된다 —
          // 폼은 객체를 기대하므로 빈 객체로 바꿔 넘긴다.
          detail: JSON.stringify(p.detail ?? {}),
        }),
      )
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <p className="text-neutral-500">Loading...</p>;
  if (!initial) return <p className="text-red-500">Product not found</p>;

  return <ProductForm initial={initial} />;
}
