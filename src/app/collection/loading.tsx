import { LoadingScreen } from "@/presentation/components/ui/LoadingScreen";

/**
 * 컬렉션 세그먼트 로딩 UI.
 * 루트와 동일한 화면을 쓰지만, 페이지 컴포넌트를 서로 import하지 않도록
 * 공용 `LoadingScreen`을 각자 참조한다.
 */
export default function CollectionLoading() {
  return <LoadingScreen />;
}
