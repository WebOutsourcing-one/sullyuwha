import type { Product } from "../entities/Product";

/** 컬렉션(실크 기성복) 조회 계약. 구현은 인프라 계층이 제공한다. */
export interface ProductRepository {
  /**
   * 전체 컬렉션을 **최신순(최근 등록이 앞)** 으로 돌려준다.
   *
   * 순서가 계약의 일부다 — `latestByCategory()`가 "그 분류에서 처음 만난 것이 최신"
   * 이라는 규칙으로 랜딩 카드를 고르므로, 순서가 흐트러지면 카드에 엉뚱한 상품이 걸린다.
   */
  getCollection(): Promise<readonly Product[]>;
  /** id로 단일 품목을 조회한다. 없으면 null. */
  getById(id: string): Promise<Product | null>;
}
