import type { BrandContentRepository } from "@/domain/repositories/BrandContentRepository";
import type { SilkFeature } from "@/domain/entities/SilkFeature";

/** 실크 소재 이야기(피처)를 조회하는 유스케이스. */
export class GetSilkFeatures {
  constructor(private readonly repository: BrandContentRepository) {}

  execute(): Promise<readonly SilkFeature[]> {
    return this.repository.getSilkFeatures();
  }
}
