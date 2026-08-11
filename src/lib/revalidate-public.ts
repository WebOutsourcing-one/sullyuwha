import { revalidatePath } from "next/cache";

/**
 * 관리자 쓰기 직후 공개 페이지의 캐시를 무효화한다.
 *
 * 공개 페이지(홈·전체 목록·상세)는 ISR로 굴러간다 — `revalidate = 60`이 붙어 있어
 * 관리자가 무엇을 고치든 화면에 뜨기까지 최대 1분이 걸린다. 그 값은 원래 "1분이
 * 적당한 신선도"라서 고른 것이 아니라, 페이지가 빌드 시점 데이터로 영구히 고정되던
 * 것을 막으려고 넣은 안전망이다.
 *
 * 무엇이 언제 바뀌었는지 서버가 정확히 아는 경우까지 시간 만료를 기다릴 이유는 없다.
 * 쓰기가 끝난 자리에서 해당 경로를 바로 무효화하고, `revalidate = 60`은 여기서
 * 놓친 경로를 위한 백업으로 남긴다.
 *
 * 무효화는 다시 만들라는 표시일 뿐 그 자리에서 페이지를 굽지 않는다.
 * 실제 재생성은 다음 요청 때 일어나므로 쓰기 응답이 느려지지 않는다.
 */

/**
 * 무효화 실패가 쓰기 응답을 뒤집지 않게 감싼다.
 *
 * 호출 시점에는 DB 쓰기가 이미 끝나 있다. 여기서 예외가 새어 나가 500이 되면
 * 관리자는 저장이 실패한 줄 알고 다시 시도하는데, 등록이라면 같은 상품이 하나 더
 * 생긴다. 무효화가 실패해도 최대 1분 뒤 ISR이 같은 일을 하므로 로그만 남긴다.
 */
function safeRevalidate(path: string, type?: "page" | "layout"): void {
  try {
    revalidatePath(path, type);
  } catch (error) {
    console.error("[revalidate] failed", path, error);
  }
}

/**
 * BEST COLLECTION 지정/해제 뒤 — 홈만 다시 만든다.
 *
 * `isBest`를 읽는 곳은 `bestByCategory()` 하나뿐이고, 그것을 쓰는 화면은
 * 홈의 CollectionSection뿐이다. 목록·상세에는 베스트 여부가 드러나지 않으므로
 * 같이 무효화하면 이유 없이 페이지를 다시 굽게 된다.
 */
export function revalidateBestCollection(): void {
  safeRevalidate("/");
}

/**
 * 상품 추가·수정·삭제 뒤 — 홈·전체 목록·모든 상세를 다시 만든다.
 *
 * 손댄 상품의 상세 경로 하나만 무효화하면 모자란다. 상세 페이지는 나머지 상품
 * 전부를 연관 목록과 이전/다음 링크로 싣고 있어서(`app/collection/[id]/page.tsx`),
 * 상품 하나가 바뀌면 다른 상품들의 상세도 같이 낡는다. 삭제라면 이미 없는 상품이
 * 다른 상세 페이지의 연관 목록에 계속 남아 클릭하면 404로 떨어진다.
 * 그래서 경로 하나가 아니라 `/collection/[id]` 라우트에 속한 페이지 전부를 무효화한다.
 *
 * 홈은 분류 카드가 그 분류의 최신 상품을 물어오고 베스트도 함께 걸리므로 같이 넣는다.
 */
export function revalidateProductPages(): void {
  safeRevalidate("/");
  safeRevalidate("/collection");
  // 두 번째 인자가 없으면 `[id]`를 리터럴 경로로 읽어 아무것도 걸리지 않는다.
  safeRevalidate("/collection/[id]", "page");
}
