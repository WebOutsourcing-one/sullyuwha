import { container } from "@/composition/container";
import {
  categoriesData,
  bespokeData,
  processData,
} from "@/infrastructure/data/brandContent.data";
import { HeroSection } from "@/presentation/components/sections/HeroSection";
import { FeaturesSection } from "@/presentation/components/sections/FeaturesSection";
import { StorySection } from "@/presentation/components/sections/StorySection";
import { CollectionSection } from "@/presentation/components/sections/CollectionSection";
import { BespokeSection } from "@/presentation/components/sections/BespokeSection";
import { ProcessSection } from "@/presentation/components/sections/ProcessSection";
import { ContactSection } from "@/presentation/components/sections/ContactSection";
import { IntroSplash } from "@/presentation/components/ui/IntroSplash";

/**
 * 정적 생성된 페이지를 주기적으로 다시 만든다(ISR).
 *
 * 이 값이 없으면 페이지가 **빌드 시점 데이터로 영구히 고정**된다.
 * DATA_SOURCE=database에서는 관리자가 상품·가격을 고쳐도 재배포 전까지 반영되지
 * 않는데, 특히 가격이 반영되지 않으면 컬렉션 카드가 계속 "가격 문의"로 남아
 * 구매 진입 자체가 막힌다.
 */
export const revalidate = 60;

/**
 * 홈 페이지 — 한복 예복 브랜드 설유화.
 * Hero → 브랜드 특징 → About → 컬렉션 → 맞춤(Bespoke) → 제작 과정 → 문의.
 *
 * 로딩 화면이 필요해 보여도 `app/loading.tsx`는 두지 말 것.
 * 그러면 **모든 하위 세그먼트**가 Suspense로 감싸여 렌더가 스트리밍으로 시작되고
 * HTTP 200이 먼저 나가버린다. 그 뒤 `notFound()`를 불러도 상태코드를 바꿀 수 없어
 * 없는 상품·주문 URL이 200으로 응답하는 소프트 404가 된다(검색엔진이 빈 페이지를 색인한다).
 */
export default async function HomePage() {
  const [hero, features, story, products, contact] = await Promise.all([
    container.getHero.execute(),
    container.getSilkFeatures.execute(),
    container.getStory.execute(),
    container.getCollection.execute(),
    container.getContact.execute(),
  ]);

  return (
    <>
      <IntroSplash />
      <HeroSection hero={hero} features={features} />
      <FeaturesSection features={features} />
      <StorySection story={story} />
      <CollectionSection products={products} categories={categoriesData} />
      <BespokeSection bespoke={bespokeData} />
      <ProcessSection steps={processData} />
      <ContactSection contact={contact} />
    </>
  );
}
