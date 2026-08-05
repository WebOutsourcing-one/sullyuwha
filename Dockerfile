# ─────────────────────────────────────────────────────────────
# Production build (AWS Lightsail)
# ─────────────────────────────────────────────────────────────
FROM oven/bun:1.3 AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .

# ─────────────────────────────────────────────────────────────
# NEXT_PUBLIC_* 는 런타임이 아니라 **빌드 타임에 번들로 인라인**된다.
# .dockerignore가 .env.* 를 빌드 컨텍스트에서 빼기 때문에, 여기서 받지 않으면
# 빈 값으로 굳어 버린다. 런타임에 --env-file로 넣어도 이미 늦다.
#
#   NEXT_PUBLIC_TOSS_CLIENT_KEY 없음 -> 체크아웃에 "결제 모듈이 설정되지 않았습니다"
#   NEXT_PUBLIC_ASSET_BASE_URL 없음  -> 이미지가 플레이스홀더로 나가고
#                                       next.config.ts의 remotePatterns도 비어
#                                       원격 이미지가 아예 차단된다
#
# ⚠️ 시크릿(TOSS_SECRET_KEY·AUTH_SECRET·DATABASE_URL 등)은 절대 여기에 넣지 않는다.
#    build arg는 이미지 레이어 히스토리에 남는다. 그것들은 런타임에 주입한다.
# ─────────────────────────────────────────────────────────────
ARG NEXT_PUBLIC_TOSS_CLIENT_KEY=""
ARG NEXT_PUBLIC_ASSET_BASE_URL=""
ENV NEXT_PUBLIC_TOSS_CLIENT_KEY=$NEXT_PUBLIC_TOSS_CLIENT_KEY
ENV NEXT_PUBLIC_ASSET_BASE_URL=$NEXT_PUBLIC_ASSET_BASE_URL

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
