import { LoadingScreen } from "@/presentation/components/ui/LoadingScreen";

/**
 * 홈 로딩 UI.
 *
 * `(main)` 라우트 그룹 안에만 적용된다(URL에는 영향이 없다).
 *
 * 예전처럼 `app/loading.tsx`에 두면 **모든 하위 세그먼트**를 Suspense로 감싸는데,
 * 그러면 렌더가 스트리밍으로 시작되면서 HTTP 200이 먼저 나가버린다. 그 뒤에
 * `notFound()`를 불러도 상태코드를 바꿀 수 없어, 없는 상품·주문 URL이 200으로
 * 응답하는 소프트 404가 된다(검색엔진이 빈 페이지를 색인한다).
 *
 * 그래서 로딩 화면은 404가 날 일이 없고 가장 무거운 홈에만 두고,
 * `/collection/[id]` · `/checkout/*` · `/orders/*`에는 경계를 두지 않는다.
 */
export default function Loading() {
  return <LoadingScreen />;
}
