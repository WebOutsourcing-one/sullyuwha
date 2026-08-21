import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getCollectionCached,
  getContactCached,
  getProductCached,
} from "@/composition/queries";
import { ProductDetail } from "@/presentation/components/sections/ProductDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * 정적 생성된 상세 페이지를 주기적으로 다시 만든다(ISR).
 *
 * 이 값이 없으면 빌드 시점 데이터로 고정되어, 관리자가 판매가를 넣어도
 * 상세 페이지는 계속 "가격 문의"에 머물고 구매하기 버튼이 나오지 않는다.
 * (체크아웃 페이지는 동적이라 값이 달라 보이는 불일치도 생긴다)
 */
export const revalidate = 60;

/** 빌드 타임에 모든 품목 상세를 정적 생성(SSG)한다. */
export async function generateStaticParams() {
  const products = await getCollectionCached();
  return products.map((product) => ({ id: product.id }));
}

/** 품목별 메타데이터(제목·설명·OG). */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductCached(id);

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

  const [product, products, contact] = await Promise.all([
    getProductCached(id),
    getCollectionCached(),
    getContactCached(),
  ]);

  if (!product) {
    notFound();
  }

  const index = products.findIndex((p) => p.id === product.id);
  const prev = index > 0 ? products[index - 1] : null;
  const next =
    index >= 0 && index < products.length - 1 ? products[index + 1] : null;
  const related = products.filter((p) => p.id !== product.id);
  const instagramUrl = contact.socials.find(
    (s) => s.label.toLowerCase() === "instagram",
  )?.url;

  return (
    <ProductDetail
      product={product}
      related={related}
      prev={prev}
      next={next}
      instagramUrl={instagramUrl}
    />
  );
}
