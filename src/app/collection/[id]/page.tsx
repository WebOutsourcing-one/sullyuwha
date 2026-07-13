import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { container } from "@/composition/container";
import { ProductDetail } from "@/presentation/components/sections/ProductDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

/** 빌드 타임에 모든 품목 상세를 정적 생성(SSG)한다. */
export async function generateStaticParams() {
  const products = await container.getCollection.execute();
  return products.map((product) => ({ id: product.id }));
}

/** 품목별 메타데이터(제목·설명·OG). */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await container.getProduct.execute(id);

  if (!product) {
    return { title: "제품을 찾을 수 없습니다 | 설유화" };
  }

  const title = `${product.name} | 설유화`;
  const description = product.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "ko_KR",
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;

  const [product, products] = await Promise.all([
    container.getProduct.execute(id),
    container.getCollection.execute(),
  ]);

  if (!product) {
    notFound();
  }

  const index = products.findIndex((p) => p.id === product.id);
  const prev = index > 0 ? products[index - 1] : null;
  const next =
    index >= 0 && index < products.length - 1 ? products[index + 1] : null;
  const related = products.filter((p) => p.id !== product.id);

  return (
    <ProductDetail
      product={product}
      related={related}
      prev={prev}
      next={next}
    />
  );
}
