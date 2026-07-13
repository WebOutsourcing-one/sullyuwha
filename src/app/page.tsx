import { container } from "@/composition/container";
import { HeroSection } from "@/presentation/components/sections/HeroSection";
import { StorySection } from "@/presentation/components/sections/StorySection";
import { CollectionSection } from "@/presentation/components/sections/CollectionSection";
import { SilkSection } from "@/presentation/components/sections/SilkSection";
import { LookbookSection } from "@/presentation/components/sections/LookbookSection";
import { ContactSection } from "@/presentation/components/sections/ContactSection";

/**
 * 홈 페이지 — 조립 루트의 유스케이스로 콘텐츠를 조회하고 섹션에 주입한다.
 * (서버 컴포넌트: 정적 콘텐츠이므로 빌드 타임에 렌더링된다.)
 */
export default async function HomePage() {
  const [hero, story, products, silkFeatures, gallery, contact] =
    await Promise.all([
      container.getHero.execute(),
      container.getStory.execute(),
      container.getCollection.execute(),
      container.getSilkFeatures.execute(),
      container.getGallery.execute(),
      container.getContact.execute(),
    ]);

  return (
    <>
      <HeroSection hero={hero} />
      <StorySection story={story} />
      <CollectionSection products={products} />
      <SilkSection features={silkFeatures} />
      <LookbookSection items={gallery} />
      <ContactSection contact={contact} />
    </>
  );
}
