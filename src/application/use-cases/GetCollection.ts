import type { ProductRepository } from "@/domain/repositories/ProductRepository";
import type { Product } from "@/domain/entities/Product";

/** 컬렉션(실크 기성복) 목록을 조회하는 유스케이스. */
export class GetCollection {
  constructor(private readonly repository: ProductRepository) {}

  execute(): Promise<readonly Product[]> {
    return this.repository.getCollection();
  }
}
