/**
 * 클라이언트 번들에 포함되어도 안전한 공개 환경 변수.
 *
 * 서버 전용 비밀값(DB 접속 문자열, S3 자격증명)은 절대 여기에 두지 않는다.
 * 이 모듈은 클라이언트 컴포넌트에서 도달 가능한 경로에 있으므로,
 * 비밀값을 추가하면 그대로 브라우저 번들에 실릴 수 있다.
 * 서버 전용 값은 `server-env.ts`를 사용한다.
 */
export interface PublicEnv {
  readonly assetBaseUrl: string | null;
}

export function loadPublicEnv(): PublicEnv {
  // 번들러가 정적으로 치환할 수 있도록 반드시 리터럴 키로 접근한다.
  const base = process.env.NEXT_PUBLIC_ASSET_BASE_URL?.trim();
  return {
    assetBaseUrl: base ? base.replace(/\/+$/, "") : null,
  };
}
