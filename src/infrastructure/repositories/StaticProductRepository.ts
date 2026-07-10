import type { ProductRepository } from "@/domain/repositories/ProductRepository";
import type { HanbokProduct } from "@/domain/entities/HanbokProduct";
import { productsData } from "../data/products.data";

/**
 * 정적 데이터 기반 ProductRepository 구현.
 * 추후 CMS/파일서버 연동 시 이 클래스만 교체하면 된다.
 */
export class StaticProductRepository implements ProductRepository {
  async getCollection(): Promise<readonly HanbokProduct[]> {
    return productsData;
  }
}
