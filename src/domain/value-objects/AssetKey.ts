/**
 * R2 버킷 내 에셋의 "논리 키"를 표현하는 값 객체.
 *
 * 도메인은 에셋이 "어디에 있는가"(key)만 안다.
 * 실제 접근 가능한 URL 조립은 인프라 계층(R2AssetResolver)의 책임이다.
 * 이 경계 덕분에 저장소(R2 → S3 → 로컬)가 바뀌어도 도메인은 불변이다.
 */
export interface AssetKey {
  /** 버킷 루트 기준 상대 키. 예) "collection/dangui" */
  readonly value: string;
}

/** 앞뒤 슬래시를 정리해 안전한 AssetKey를 생성한다. */
export function assetKey(value: string): AssetKey {
  const normalized = value.trim().replace(/^\/+|\/+$/g, "");
  if (!normalized) {
    throw new Error("AssetKey는 비어 있을 수 없습니다.");
  }
  return { value: normalized };
}
