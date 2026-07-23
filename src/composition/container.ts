import { StaticProductRepository } from "@/infrastructure/repositories/StaticProductRepository";
import { StaticGalleryRepository } from "@/infrastructure/repositories/StaticGalleryRepository";
import { StaticBrandContentRepository } from "@/infrastructure/repositories/StaticBrandContentRepository";
import { DbProductRepository } from "@/infrastructure/repositories/DbProductRepository";
import { DbGalleryRepository } from "@/infrastructure/repositories/DbGalleryRepository";
import { DbBrandContentRepository } from "@/infrastructure/repositories/DbBrandContentRepository";
import { GetHeroContent } from "@/application/use-cases/GetHeroContent";
import { GetBrandStory } from "@/application/use-cases/GetBrandStory";
import { GetCollection } from "@/application/use-cases/GetCollection";
import { GetProduct } from "@/application/use-cases/GetProduct";
import { GetSilkFeatures } from "@/application/use-cases/GetSilkFeatures";
import { GetGallery } from "@/application/use-cases/GetGallery";
import { GetContactInfo } from "@/application/use-cases/GetContactInfo";
import { getAssetResolver } from "./assets";

const useDatabase = process.env.DATA_SOURCE === "database";

function createContainer() {
  const productRepository = useDatabase
    ? new DbProductRepository()
    : new StaticProductRepository();
  const galleryRepository = useDatabase
    ? new DbGalleryRepository()
    : new StaticGalleryRepository();
  const brandContentRepository = useDatabase
    ? new DbBrandContentRepository(getAssetResolver())
    : new StaticBrandContentRepository();

  return {
    getHero: new GetHeroContent(brandContentRepository),
    getStory: new GetBrandStory(brandContentRepository),
    getCollection: new GetCollection(productRepository),
    getProduct: new GetProduct(productRepository),
    getSilkFeatures: new GetSilkFeatures(brandContentRepository),
    getGallery: new GetGallery(galleryRepository),
    getContact: new GetContactInfo(brandContentRepository),
  } as const;
}

export const container = createContainer();
export type Container = ReturnType<typeof createContainer>;
