import type { NextConfig } from "next";

/**
 * Cloudflare R2 공개 버킷(커스텀 도메인)의 호스트를
 * next/image 최적화 허용 목록(remotePatterns)에 동적으로 등록한다.
 *
 * NEXT_PUBLIC_ASSET_BASE_URL 예) https://assets.sullyuwha.com
 * 값이 없으면(로컬 개발) remotePatterns는 비어 있고,
 * 프론트는 한지 플레이스홀더로 대체 렌더링한다.
 */
function resolveAssetHost():
  | { protocol: "http" | "https"; hostname: string }
  | null {
  const base = process.env.NEXT_PUBLIC_ASSET_BASE_URL;
  if (!base) return null;
  try {
    const url = new URL(base);
    return {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
    };
  } catch {
    return null;
  }
}

const assetHost = resolveAssetHost();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: assetHost
      ? [{ protocol: assetHost.protocol, hostname: assetHost.hostname }]
      : [],
  },
};

export default nextConfig;
