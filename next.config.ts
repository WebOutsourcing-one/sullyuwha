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

const nextConfig: NextConfig = {
  images: {
    remotePatterns: resolveRemoteHosts(),
  },
};

export default nextConfig;
