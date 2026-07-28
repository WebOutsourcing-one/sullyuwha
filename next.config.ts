import type { NextConfig } from "next";

function resolveRemoteHosts(): { protocol: "http" | "https"; hostname: string }[] {
  const hosts: { protocol: "http" | "https"; hostname: string }[] = [];

  const base = process.env.NEXT_PUBLIC_ASSET_BASE_URL;
  if (base) {
    try {
      const url = new URL(base);
      hosts.push({
        protocol: url.protocol.replace(":", "") as "http" | "https",
        hostname: url.hostname,
      });
    } catch {
      /* ignore */
    }
  }

  return hosts;
}

const isDev = process.env.NODE_ENV === "development";

/** next/image가 허용하는 원격 호스트 = CSP img-src에 허용할 호스트. */
const assetOrigins = resolveRemoteHosts().map((h) => `${h.protocol}://${h.hostname}`);

/**
 * 정적 마케팅 사이트 기준 CSP.
 * - 개발 모드에서는 Next의 HMR/리프레시가 eval을 쓰므로 'unsafe-eval'을 허용한다.
 * - 프로덕션에는 인라인 스크립트가 없어야 하지만, Next의 부트스트랩 인라인 스크립트 때문에
 *   'unsafe-inline'이 필요하다. nonce 기반으로 조이려면 미들웨어가 필요하다.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval' https://unpkg.com" : ""}`,
  // next/font(구글 폰트)는 빌드 타임에 self-host되므로 외부 도메인이 필요 없다.
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  `img-src 'self' blob: data: ${assetOrigins.join(" ")}`.trim(),
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // 클릭재킹 차단 (CSP frame-ancestors를 모르는 구형 브라우저용 백업)
  { key: "X-Frame-Options", value: "DENY" },
  // MIME 스니핑으로 인한 타입 혼동 차단
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // 쓰지 않는 강력한 브라우저 기능은 명시적으로 끈다.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // HTTPS 강제 (HTTPS로 서빙될 때만 브라우저가 적용한다)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  // 응답 헤더로 서버 스택을 광고하지 않는다.
  poweredByHeader: false,
  images: {
    remotePatterns: resolveRemoteHosts(),
    // 업로드 경로와 마찬가지로 SVG는 렌더링하지 않는다 (SVG = 스크립트 실행 가능).
    dangerouslyAllowSVG: false,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
