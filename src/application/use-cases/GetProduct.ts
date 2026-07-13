import type { ProductRepository } from "@/domain/repositories/ProductRepository";
import type { Product } from "@/domain/entities/Product";

/** id로 단일 품목을 조회하는 유스케이스. 없으면 null을 반환한다. */
export class GetProduct {
  constructor(private readonly repository: ProductRepository) {}

  execute(id: string): Promise<Product | null> {
    return this.repository.getById(id);
  }
}
