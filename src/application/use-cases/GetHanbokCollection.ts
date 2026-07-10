import type { ProductRepository } from "@/domain/repositories/ProductRepository";
import type { HanbokProduct } from "@/domain/entities/HanbokProduct";

/** 한복 컬렉션 목록을 조회하는 유스케이스. */
export class GetHanbokCollection {
  constructor(private readonly repository: ProductRepository) {}

  execute(): Promise<readonly HanbokProduct[]> {
    return this.repository.getCollection();
  }
}
