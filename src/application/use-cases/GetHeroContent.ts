import type { BrandContentRepository } from "@/domain/repositories/BrandContentRepository";
import type { HeroContent } from "@/domain/entities/HeroContent";

/** 히어로 콘텐츠를 조회하는 유스케이스. */
export class GetHeroContent {
  constructor(private readonly repository: BrandContentRepository) {}

  execute(): Promise<HeroContent> {
    return this.repository.getHero();
  }
}
