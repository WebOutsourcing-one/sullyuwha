import type { Product } from "../entities/Product";

/** 컬렉션(실크 기성복) 조회 계약. 구현은 인프라 계층이 제공한다. */
export interface ProductRepository {
  getCollection(): Promise<readonly Product[]>;
  /** id로 단일 품목을 조회한다. 없으면 null. */
  getById(id: string): Promise<Product | null>;
}
