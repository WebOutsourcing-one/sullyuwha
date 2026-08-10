import type { Metadata } from "next";
import { getCollectionCached } from "@/composition/queries";
import { CollectionList } from "@/presentation/components/sections/CollectionList";

/**
 * 정적 생성된 목록을 주기적으로 다시 만든다(ISR).
 *
 * 홈·상세와 같은 주기로 맞춘다. 여기만 길게 잡으면 관리자가 올린 새 상품이
 * 홈의 분류 카드에는 떠 있는데 전체 목록에는 없는 상태가 한동안 이어진다.
 */
export const revalidate = 60;

export const metadata: Metadata = {
  title: "전체 컬렉션 | 설유화",
  description:
    "설유화의 예복 컬렉션을 한자리에서 만나보세요. 당의·스란치마·두루마기 등 전통 예복을 현대의 감각으로 짓습니다.",
  openGraph: {
    title: "전체 컬렉션 | 설유화",
    description: "설유화의 예복 컬렉션을 한자리에서 만나보세요.",
    type: "website",
    locale: "ko_KR",
  },
};

export default async function CollectionPage() {
  const products = await getCollectionCached();
  return <CollectionList products={products} />;
}
