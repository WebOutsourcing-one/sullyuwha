import type { BrandContentRepository } from "@/domain/repositories/BrandContentRepository";
import type { CraftStep } from "@/domain/entities/CraftStep";

/** 제작 과정 단계를 순서대로 조회하는 유스케이스. */
export class GetCraftProcess {
  constructor(private readonly repository: BrandContentRepository) {}

  async execute(): Promise<readonly CraftStep[]> {
    const steps = await this.repository.getCraftSteps();
    return [...steps].sort((a, b) => a.order - b.order);
  }
}
