import type { BrandContentRepository } from "@/domain/repositories/BrandContentRepository";
import type { HeroContent } from "@/domain/entities/HeroContent";
import type { BrandStory } from "@/domain/entities/BrandStory";
import type { CraftStep } from "@/domain/entities/CraftStep";
import type { ContactInfo } from "@/domain/entities/ContactInfo";
import {
  heroData,
  storyData,
  craftStepsData,
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

  async getCraftSteps(): Promise<readonly CraftStep[]> {
    return craftStepsData;
  }

  async getContact(): Promise<ContactInfo> {
    return contactData;
  }
}
