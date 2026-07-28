# ─────────────────────────────────────────────────────────────
# Production build (AWS Lightsail)
# ─────────────────────────────────────────────────────────────
FROM oven/bun:1.3 AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM oven/bun:1.3 AS runner
WORKDIR /app
ENV NODE_ENV=production

# 런타임은 비특권 사용자로 실행한다. (oven/bun 이미지에 기본 제공되는 uid 1000 계정)
COPY --from=builder --chown=bun:bun /app/.next ./.next
COPY --from=builder --chown=bun:bun /app/public ./public
COPY --from=builder --chown=bun:bun /app/package.json ./package.json
COPY --from=builder --chown=bun:bun /app/next.config.ts ./
COPY --from=builder --chown=bun:bun /app/node_modules ./node_modules

USER bun

EXPOSE 5001
CMD ["bun", "run", "start"]
