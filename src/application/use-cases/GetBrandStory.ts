import type { BrandContentRepository } from "@/domain/repositories/BrandContentRepository";
import type { BrandStory } from "@/domain/entities/BrandStory";

/** 브랜드 스토리를 조회하는 유스케이스. */
export class GetBrandStory {
  constructor(private readonly repository: BrandContentRepository) {}

  execute(): Promise<BrandStory> {
    return this.repository.getStory();
  }
}
