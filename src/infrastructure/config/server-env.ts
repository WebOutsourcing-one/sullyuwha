/**
 * 서버 전용 환경 변수 — 비밀값을 포함한다.
 *
 * 이 모듈은 클라이언트 컴포넌트에서 절대 import하면 안 된다.
 * (route handler, 서버 컴포넌트, 리포지토리 등 서버 코드에서만 사용)
 */

if (typeof window !== "undefined") {
  throw new Error(
    "server-env.ts는 서버 전용입니다. 클라이언트 컴포넌트에서 import하지 마세요.",
  );
}

export interface ServerEnv {
  readonly databaseUrl: string | null;
  readonly s3Endpoint: string | null;
  readonly s3Region: string;
  readonly s3AccessKey: string;
  readonly s3SecretKey: string;
  readonly s3Bucket: string;
  readonly s3PublicUrl: string | null;
  /**
   * 토스페이먼츠 시크릿 키. 이 값이 있으면 임의의 금액을 승인·환불할 수 있으므로
   * 절대 `NEXT_PUBLIC_` 접두사를 붙이거나 클라이언트로 내려보내면 안 된다.
   * 없으면 결제 승인은 실패한다(성공으로 폴백하지 않는다).
   */
  readonly tossSecretKey: string | null;
}

export function loadServerEnv(): ServerEnv {
  return {
    databaseUrl: env("DATABASE_URL"),
    s3Endpoint: env("S3_ENDPOINT"),
    s3Region: env("S3_REGION") ?? "ap-northeast-2",
    s3AccessKey: env("S3_ACCESS_KEY") ?? "",
    s3SecretKey: env("S3_SECRET_KEY") ?? "",
    s3Bucket: env("S3_BUCKET") ?? "sullyuwha-assets",
    s3PublicUrl: env("S3_PUBLIC_URL"),
    tossSecretKey: env("TOSS_SECRET_KEY"),
  };
}

function env(key: string): string | null {
  return process.env[key]?.trim() ?? null;
}
