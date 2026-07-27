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
  imageAssetKey: string;
  imageAlt: string;
  imageExt: string;
  imageAspectRatio: string;
  tags: string;
  story: string;
  specs: string;
  care: string;
  sortOrder: string;
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
          imageAssetKey: p.imageAssetKey,
          imageAlt: p.imageAlt,
          imageExt: p.imageExt ?? "",
          imageAspectRatio: p.imageAspectRatio != null ? String(p.imageAspectRatio) : "",
          tags: JSON.stringify(p.tags),
          story: p.story ?? "",
          specs: JSON.stringify(p.specs),
          care: JSON.stringify(p.care),
          sortOrder: String(p.sortOrder),
        }),
      )
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <p className="text-neutral-500">Loading...</p>;
  if (!initial) return <p className="text-red-500">Product not found</p>;

  return <ProductForm initial={initial} />;
}
