import type { BrandContentRepository } from "@/domain/repositories/BrandContentRepository";
import type { HeroContent } from "@/domain/entities/HeroContent";
import type { BrandStory } from "@/domain/entities/BrandStory";
import type { SilkFeature } from "@/domain/entities/SilkFeature";
import type { ContactInfo } from "@/domain/entities/ContactInfo";
import {
  heroData,
  storyData,
  silkFeaturesData,
  contactData,
} from "../data/brandContent.data";

/** 정적 데이터 기반 BrandContentRepository 구현. */
export class StaticBrandContentRepository implements BrandContentRepository {
  async getHero(): Promise<HeroContent> {
    return heroData;
  }

  async getStory(): Promise<BrandStory> {
    return storyData;
  }

  async getSilkFeatures(): Promise<readonly SilkFeature[]> {
    return silkFeaturesData;
  }

  async getContact(): Promise<ContactInfo> {
    return contactData;
  }
}
