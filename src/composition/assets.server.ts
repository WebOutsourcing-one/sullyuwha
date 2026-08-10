import { loadServerEnv } from "@/infrastructure/config/server-env";
import { S3AssetResolver } from "@/infrastructure/assets/S3AssetResolver";
import type { AssetResolver } from "@/infrastructure/assets/R2AssetResolver";
import { assetResolver } from "./assets";

let _s3Resolver: AssetResolver | null = null;

/**
 * S3/MinIO 리졸버 — 서버 전용.
 * API Route, DB Repository 등 서버 코드에서만 호출한다.
 * 자격증명이 없으면 공개 URL 기반 리졸버로 폴백한다.
 */
export function getAssetResolver(): AssetResolver {
  if (_s3Resolver) return _s3Resolver;

  const env = loadServerEnv();
  if (!env.s3AccessKey || !env.s3SecretKey) {
    return assetResolver;
  }

  _s3Resolver = new S3AssetResolver({
    endpoint: env.s3Endpoint ?? undefined,
    region: env.s3Region,
    accessKey: env.s3AccessKey,
    secretKey: env.s3SecretKey,
    bucket: env.s3Bucket,
    keyPrefix: env.s3KeyPrefix,
    publicUrl: env.s3PublicUrl ?? `https://${env.s3Bucket}.s3.${env.s3Region}.amazonaws.com`,
  });
  return _s3Resolver;
}
