/**
 * 관리자 화면에서 업로드한 에셋의 미리보기 URL을 만든다.
 *
 * 도메인의 `R2AssetResolver.resolve`와 같은 규칙(`{base}/{key}.{ext}`)이지만
 * 그쪽은 `AssetKey` 값 객체를 받는 서버 코드라 클라이언트에서 바로 쓸 수 없다.
 * 관리자 폼·목록 네 곳에 같은 문자열 조립이 흩어져 있어서 여기로 모은다 —
 * 흩어져 있으면 규칙이 바뀔 때 한 곳만 고쳐지고 나머지가 어긋난다.
 * (실제로 확장자를 두 번 붙이는 버그가 그렇게 생겼다)
 */
const BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL || "";

export function assetPreviewUrl(
  assetKey: string | null | undefined,
  ext?: string | null,
): string | null {
  if (!assetKey || !BASE) return null;
  return `${BASE}/${assetKey}.${ext || "jpg"}`;
}
