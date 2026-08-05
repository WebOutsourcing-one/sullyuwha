import { cache } from "react";
import { container } from "./container";

/**
 * 한 요청 안에서 같은 조회를 여러 번 해도 DB는 한 번만 친다.
 *
 * `generateMetadata`와 페이지 본문은 따로 실행되지만 같은 데이터를 필요로 한다.
 * 그대로 두면 상세 페이지 한 번 그리는 데 같은 상품을 두 번 읽는다.
 *
 * Next의 자동 중복 제거는 `fetch`에만 걸리고 DB 호출에는 걸리지 않는다.
 * React의 `cache()`는 요청 단위로 결과를 기억하므로 이 경우를 덮는다.
 */
export const getProductCached = cache((id: string) => container.getProduct.execute(id));

export const getCollectionCached = cache(() => container.getCollection.execute());
