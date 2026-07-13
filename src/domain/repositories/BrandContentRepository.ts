import type { HeroContent } from "../entities/HeroContent";
import type { BrandStory } from "../entities/BrandStory";
import type { SilkFeature } from "../entities/SilkFeature";
import type { ContactInfo } from "../entities/ContactInfo";

/**
 * 브랜드 서사 콘텐츠(히어로 · 스토리 · 실크 소재 · 문의) 조회 계약.
 * 정적 콘텐츠이므로 하나의 저장소로 묶는다.
 */
export interface BrandContentRepository {
  getHero(): Promise<HeroContent>;
  getStory(): Promise<BrandStory>;
  getSilkFeatures(): Promise<readonly SilkFeature[]>;
  getContact(): Promise<ContactInfo>;
}
