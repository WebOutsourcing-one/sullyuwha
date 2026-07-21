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

/**
 * 홈 페이지 — 한복 예복 브랜드 설유화.
 * Hero → 브랜드 특징 → About → 컬렉션 → 맞춤(Bespoke) → 제작 과정 → 문의.
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
      <HeroSection hero={hero} />
      <FeaturesSection features={features} />
      <StorySection story={story} />
      <CollectionSection products={products} categories={categoriesData} />
      <BespokeSection bespoke={bespokeData} />
      <ProcessSection steps={processData} />
      <ContactSection contact={contact} />
    </>
  );
}
