import { LoadingScreen } from "@/presentation/components/ui/LoadingScreen";

/**
 * 루트 로딩 UI.
 * 자체 loading.tsx가 없는 모든 하위 세그먼트가 이 화면을 물려받는다 —
 * 즉 라우트 전환/스트리밍 중 프로젝트 전역에서 이 화면이 뜬다.
 */
export default function Loading() {
  return <LoadingScreen />;
}
