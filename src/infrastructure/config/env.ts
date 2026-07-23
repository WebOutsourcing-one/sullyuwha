export interface AppEnv {
  readonly assetBaseUrl: string | null;
  readonly databaseUrl: string | null;
  readonly s3Endpoint: string | null;
  readonly s3Region: string;
  readonly s3AccessKey: string;
  readonly s3SecretKey: string;
  readonly s3Bucket: string;
  readonly s3PublicUrl: string | null;
}

export function loadEnv(): AppEnv {
  return {
    assetBaseUrl: env("NEXT_PUBLIC_ASSET_BASE_URL"),
    databaseUrl: env("DATABASE_URL"),
    s3Endpoint: env("S3_ENDPOINT"),
    s3Region: env("S3_REGION") ?? "ap-northeast-2",
    s3AccessKey: env("S3_ACCESS_KEY") ?? "",
    s3SecretKey: env("S3_SECRET_KEY") ?? "",
    s3Bucket: env("S3_BUCKET") ?? "sullyuwha-assets",
    s3PublicUrl: env("S3_PUBLIC_URL"),
  };
}

function env(key: string): string | null {
  return process.env[key]?.trim() ?? null;
}
