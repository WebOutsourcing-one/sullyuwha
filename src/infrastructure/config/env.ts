/** 애플리케이션 환경 설정. */
export interface AppEnv {
  /** R2 공개 버킷 베이스 URL(끝 슬래시 제거). 미설정 시 null. */
  readonly assetBaseUrl: string | null;
}

/** process.env로부터 앱 환경을 로드한다. */
export function loadEnv(): AppEnv {
  const raw = process.env.NEXT_PUBLIC_ASSET_BASE_URL?.trim();
  return {
    assetBaseUrl: raw ? raw.replace(/\/+$/, "") : null,
  };
}
