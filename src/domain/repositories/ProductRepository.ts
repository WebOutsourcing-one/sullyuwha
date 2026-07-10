import type { HanbokProduct } from "../entities/HanbokProduct";

/** 한복 컬렉션 조회 계약. 구현은 인프라 계층이 제공한다. */
export interface ProductRepository {
  getCollection(): Promise<readonly HanbokProduct[]>;
}
