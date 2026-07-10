import { StaticProductRepository } from "@/infrastructure/repositories/StaticProductRepository";
import { StaticGalleryRepository } from "@/infrastructure/repositories/StaticGalleryRepository";
import { StaticBrandContentRepository } from "@/infrastructure/repositories/StaticBrandContentRepository";
import { GetHeroContent } from "@/application/use-cases/GetHeroContent";
import { GetBrandStory } from "@/application/use-cases/GetBrandStory";
import { GetHanbokCollection } from "@/application/use-cases/GetHanbokCollection";
import { GetCraftProcess } from "@/application/use-cases/GetCraftProcess";
import { GetGallery } from "@/application/use-cases/GetGallery";
import { GetContactInfo } from "@/application/use-cases/GetContactInfo";

/**
 * 조립 루트(Composition Root).
 * 인프라 구현을 도메인 계약에 주입해 유스케이스를 완성한다.
 * 저장소 구현(Static → CMS/파일서버)이 바뀌어도 이 파일만 수정하면 된다.
 */
function createContainer() {
  const productRepository = new StaticProductRepository();
  const galleryRepository = new StaticGalleryRepository();
  const brandContentRepository = new StaticBrandContentRepository();

  return {
    getHero: new GetHeroContent(brandContentRepository),
    getStory: new GetBrandStory(brandContentRepository),
    getCollection: new GetHanbokCollection(productRepository),
    getCraftProcess: new GetCraftProcess(brandContentRepository),
    getGallery: new GetGallery(galleryRepository),
    getContact: new GetContactInfo(brandContentRepository),
  } as const;
}

export const container = createContainer();
export type Container = ReturnType<typeof createContainer>;
