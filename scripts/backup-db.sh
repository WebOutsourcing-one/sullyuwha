#!/usr/bin/env bash
#
# Postgres 논리 백업 → S3.
#
# Lightsail 자동 스냅샷과 역할이 다르다:
#   자동 스냅샷  인스턴스가 통째로 죽었을 때 복구. 7일 롤링, 디스크 단위.
#   이 스크립트  보관 기간을 원하는 대로 잡고, 테이블 단위로 되돌릴 수 있다.
#
# 주문 테이블에 이름·연락처·배송지가 들어가므로 7일 롤링만으로 끝내지 않는다.
#
# 크론 등록은 docs/deploy.md 참고.
set -euo pipefail

# ── 설정 ──────────────────────────────────────────────────────
# 서버의 .env.production 에서 S3 자격증명을 읽는다.
ENV_FILE="${ENV_FILE:-/opt/sullyuwha/.env.production}"
COMPOSE_FILE="${COMPOSE_FILE:-/opt/sullyuwha/docker-compose.prod.yml}"
DB_SERVICE="${DB_SERVICE:-postgres}"
DB_USER="${DB_USER:-sullyuwha}"
DB_NAME="${DB_NAME:-sullyuwha}"
# 백업 전용 버킷/프리픽스. 에셋 버킷과 섞지 않는다 —
# 에셋 버킷은 공개 읽기라, 거기에 덤프를 두면 개인정보가 인터넷에 열린다.
S3_BACKUP_BUCKET="${S3_BACKUP_BUCKET:-}"
S3_BACKUP_PREFIX="${S3_BACKUP_PREFIX:-db-backups}"

log() { printf '[backup] %s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
die() { log "ERROR: $*" >&2; exit 1; }

[ -f "$ENV_FILE" ] || die "환경 파일이 없습니다: $ENV_FILE"
# shellcheck disable=SC1090
set -a; . "$ENV_FILE"; set +a

: "${S3_BACKUP_BUCKET:=${BACKUP_S3_BUCKET:-}}"
[ -n "$S3_BACKUP_BUCKET" ] || die "S3_BACKUP_BUCKET(또는 BACKUP_S3_BUCKET)이 비어 있습니다."

command -v aws >/dev/null || die "aws CLI가 없습니다. docs/deploy.md의 설치 절차를 보세요."
command -v docker >/dev/null || die "docker가 없습니다."

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
FILE="sullyuwha-${STAMP}.sql.gz"
TMP="$(mktemp -d)"
# 실패하든 성공하든 임시 파일은 남기지 않는다 — 덤프에 개인정보가 들어 있다.
trap 'rm -rf "$TMP"' EXIT

log "덤프 시작 (${DB_NAME})"

# --clean --if-exists: 복원 시 기존 객체를 지우고 다시 만든다.
# 압축은 파이프에서 바로 한다 — 평문 덤프를 디스크에 떨구지 않는다.
if ! docker compose -f "$COMPOSE_FILE" exec -T "$DB_SERVICE" \
      pg_dump -U "$DB_USER" -d "$DB_NAME" --clean --if-exists \
      | gzip -9 > "$TMP/$FILE"; then
  die "pg_dump 실패"
fi

SIZE=$(wc -c < "$TMP/$FILE" | tr -d ' ')
# 빈 덤프를 올리면 "백업이 있다"고 착각하게 된다. 최소 크기를 확인한다.
[ "$SIZE" -gt 1024 ] || die "덤프가 비정상적으로 작습니다(${SIZE} bytes). 업로드하지 않습니다."

# gzip 무결성 검사 — 깨진 파일을 올려두고 안심하는 상황을 막는다.
gzip -t "$TMP/$FILE" || die "덤프가 깨졌습니다(gzip 검사 실패)."

log "덤프 완료 (${SIZE} bytes) → s3://${S3_BACKUP_BUCKET}/${S3_BACKUP_PREFIX}/${FILE}"

# 서버 측 암호화를 걸어 올린다. 버킷은 비공개여야 한다(docs/deploy.md).
aws s3 cp "$TMP/$FILE" "s3://${S3_BACKUP_BUCKET}/${S3_BACKUP_PREFIX}/${FILE}" \
  --sse AES256 --only-show-errors \
  || die "S3 업로드 실패"

log "업로드 완료"

# 보관 기간은 S3 수명주기 규칙으로 관리한다(docs/deploy.md).
# 스크립트에서 지우지 않는 이유 — 삭제 로직이 버그를 내면 백업이 사라진다.
# 지우는 일은 S3에 맡기고 여기서는 만들기만 한다.
