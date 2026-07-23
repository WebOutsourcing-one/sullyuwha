import { loadEnv } from "@/infrastructure/config/env";
import { R2AssetResolver, type AssetResolver } from "@/infrastructure/assets/R2AssetResolver";

const env = loadEnv();

/**
 * URL 해석용 — 항상 R2AssetResolver 사용.
 * `R2Image` 등 클라이언트/서버 컴포넌트에서 안전하게 쓸 수 있음.
 * AWS SDK(`S3AssetResolver`)는 업로드/관리용으로만 사용.
 */
export const assetResolver: AssetResolver = new R2AssetResolver(env.assetBaseUrl);

let _s3Resolver: AssetResolver | null = null;

/**
 * S3/MinIO 리졸버 (AWS SDK import = lazy).
 * API Route, DB Repository 등 서버 전용 코드에서만 호출.
 */
export function getAssetResolver(): AssetResolver {
  if (_s3Resolver) return _s3Resolver;

  if (env.s3AccessKey) {
    const { S3AssetResolver } = require("@/infrastructure/assets/S3AssetResolver");
    _s3Resolver = new S3AssetResolver({
      endpoint: env.s3Endpoint ?? undefined,
      region: env.s3Region,
      accessKey: env.s3AccessKey,
      secretKey: env.s3SecretKey,
      bucket: env.s3Bucket,
      publicUrl: env.s3PublicUrl ?? `https://${env.s3Bucket}.s3.${env.s3Region}.amazonaws.com`,
    });
    return _s3Resolver!;
  }

  return assetResolver;
}
