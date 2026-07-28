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
 * 토스페이먼츠 결제위젯이 필요로 하는 출처.
 *
 * 위젯은 `js.tosspayments.com`에서 SDK를 받아 결제수단 UI를 iframe으로 띄우고,
 * 결제 진행 중 `*.tosspayments.com`으로 XHR·폴링을 한다.
 * 이 출처들이 빠지면 체크아웃 화면에서 위젯이 아예 렌더되지 않는다.
 *
 * 실제 카드사·은행 인증 화면은 토스 도메인에서 새 창/리다이렉트로 열리므로
 * 우리 문서의 CSP 관할 밖이다 — 카드사 도메인을 여기 나열할 필요는 없다.
 */
const TOSS_SCRIPT = "https://js.tosspayments.com";
// api·event·polling 외에도 결제 수단에 따라 다른 서브도메인을 쓴다.
// 개별 호스트를 나열하면 특정 결제 수단에서만 조용히 실패하므로 토스 도메인 전체를 연다.
// 여전히 tosspayments.com으로 한정되므로 임의 외부 출처가 열리는 것은 아니다.
const TOSS_CONNECT = "https://*.tosspayments.com";
const TOSS_FRAME = "https://js.tosspayments.com https://*.tosspayments.com";
const TOSS_IMG = "https://static.tosspayments.com";

/**
 * 정적 마케팅 사이트 기준 CSP.
 * - 개발 모드에서는 Next의 HMR/리프레시가 eval을 쓰므로 'unsafe-eval'을 허용한다.
 * - 프로덕션에는 인라인 스크립트가 없어야 하지만, Next의 부트스트랩 인라인 스크립트 때문에
 *   'unsafe-inline'이 필요하다. nonce 기반으로 조이려면 미들웨어가 필요하다.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${TOSS_SCRIPT}${isDev ? " 'unsafe-eval' https://unpkg.com" : ""}`,
  // next/font(구글 폰트)는 빌드 타임에 self-host되므로 외부 도메인이 필요 없다.
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  `img-src 'self' blob: data: ${TOSS_IMG} ${assetOrigins.join(" ")}`.trim(),
  `connect-src 'self' ${TOSS_CONNECT}`,
  `frame-src 'self' ${TOSS_FRAME}`,
  "object-src 'none'",
  "base-uri 'self'",
  // 일부 결제 수단은 토스 도메인으로 폼을 submit한다.
  "form-action 'self' https://*.tosspayments.com",
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
