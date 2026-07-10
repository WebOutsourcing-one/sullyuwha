import type { BrandContentRepository } from "@/domain/repositories/BrandContentRepository";
import type { ContactInfo } from "@/domain/entities/ContactInfo";

/** 문의 · 오시는 길 정보를 조회하는 유스케이스. */
export class GetContactInfo {
  constructor(private readonly repository: BrandContentRepository) {}

  execute(): Promise<ContactInfo> {
    return this.repository.getContact();
  }
}
