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
  /**
   * 버킷 안에서 이 프로젝트가 쓰는 루트 경로. 예) `sullyuwha`
   *
   * 버킷을 여러 프로젝트가 공유할 때 서로의 키를 밟지 않도록 격리한다.
   * 업로드·삭제·목록 조회에만 붙는 **저장소 레벨** 접두사다 —
   * DB에 들어가는 논리 키(`products/<uuid>`)에는 포함되지 않는다.
   * 덕분에 버킷이나 접두사가 바뀌어도 DB는 그대로 둘 수 있다.
   *
   * ⚠️ 이 값을 설정하면 `S3_PUBLIC_URL`·`NEXT_PUBLIC_ASSET_BASE_URL` 도
   *    같은 경로로 끝나야 한다. 읽기 URL은 `{base}/{논리키}.{ext}` 로 만들어지므로
   *    base에 접두사가 빠지면 방금 올린 파일을 못 찾는다.
   *    (S3 기본 도메인을 쓰는 경우 아래 loadServerEnv에서 어긋남을 경고한다)
   */
  readonly s3KeyPrefix: string | null;
  readonly s3PublicUrl: string | null;
  /**
   * 토스페이먼츠 시크릿 키. 이 값이 있으면 임의의 금액을 승인·환불할 수 있으므로
   * 절대 `NEXT_PUBLIC_` 접두사를 붙이거나 클라이언트로 내려보내면 안 된다.
   * 없으면 결제 승인은 실패한다(성공으로 폴백하지 않는다).
   */
  readonly tossSecretKey: string | null;
}

export function loadServerEnv(): ServerEnv {
  const s3PublicUrl = env("S3_PUBLIC_URL");
  const s3KeyPrefix = normalizeKeyPrefix(env("S3_KEY_PREFIX"));

  warnIfPrefixMissingFromPublicUrl(s3KeyPrefix, s3PublicUrl);

  return {
    databaseUrl: env("DATABASE_URL"),
    s3Endpoint: env("S3_ENDPOINT"),
    s3Region: env("S3_REGION") ?? "ap-northeast-2",
    s3AccessKey: env("S3_ACCESS_KEY") ?? "",
    s3SecretKey: env("S3_SECRET_KEY") ?? "",
    s3Bucket: env("S3_BUCKET") ?? "sullyuwha-assets",
    s3KeyPrefix,
    s3PublicUrl,
    tossSecretKey: env("TOSS_SECRET_KEY"),
  };
}

function env(key: string): string | null {
  return process.env[key]?.trim() ?? null;
}

/** 앞뒤 슬래시를 떼어 `a/b` 형태로 맞춘다. 빈 값은 "접두사 없음"이다. */
function normalizeKeyPrefix(raw: string | null): string | null {
  const normalized = raw?.replace(/^\/+|\/+$/g, "") ?? "";
  return normalized || null;
}

/**
 * 접두사와 공개 URL이 어긋나면 경고한다.
 *
 * 이 둘이 따로 놀면 업로드는 성공하는데 화면에는 안 나오는,
 * 원인을 찾기 가장 번거로운 형태로 깨진다. 실제로 그렇게 한 번 깨졌다.
 *
 * S3 기본 도메인(`*.amazonaws.com`)일 때만 본다 — CDN·커스텀 도메인은
 * origin path로 접두사를 흡수할 수 있어서 URL에 안 보이는 게 정상이다.
 */
function warnIfPrefixMissingFromPublicUrl(
  prefix: string | null,
  publicUrl: string | null,
): void {
  if (!prefix || !publicUrl) return;

  let host: string;
  let path: string;
  try {
    const url = new URL(publicUrl);
    host = url.hostname;
    path = url.pathname.replace(/^\/+|\/+$/g, "");
  } catch {
    return;
  }

  if (!host.endsWith(".amazonaws.com")) return;
  if (path === prefix) return;

  console.warn(
    `[env] S3_KEY_PREFIX="${prefix}" 인데 S3_PUBLIC_URL 의 경로는 "${path || "(없음)"}" 입니다. ` +
      `업로드는 "${prefix}/" 아래로 들어가지만 화면은 다른 경로를 읽습니다 — ` +
      `S3_PUBLIC_URL 과 NEXT_PUBLIC_ASSET_BASE_URL 을 "/${prefix}" 로 끝나게 맞추세요.`,
  );
}
