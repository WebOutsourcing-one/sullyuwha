#!/usr/bin/env bash
#
# S3에 올라간 덤프로 되돌린다.
#
# 복원해 본 적 없는 백업은 백업이 아니다. 실제 사고가 나기 전에 한 번은
# 스테이징이나 임시 DB에 돌려보고 절차를 확인해 둘 것.
#
# 사용:
#   scripts/restore-db.sh                      # 최신 백업 목록만 보여준다
#   scripts/restore-db.sh <파일명>              # 지정한 백업으로 복원
set -euo pipefail

ENV_FILE="${ENV_FILE:-/opt/sullyuwha/.env.production}"
COMPOSE_FILE="${COMPOSE_FILE:-/opt/sullyuwha/docker-compose.prod.yml}"
DB_SERVICE="${DB_SERVICE:-postgres}"
DB_USER="${DB_USER:-sullyuwha}"
DB_NAME="${DB_NAME:-sullyuwha}"
S3_BACKUP_PREFIX="${S3_BACKUP_PREFIX:-db-backups}"

log() { printf '[restore] %s\n' "$*"; }
die() { log "ERROR: $*" >&2; exit 1; }

[ -f "$ENV_FILE" ] || die "환경 파일이 없습니다: $ENV_FILE"
# shellcheck disable=SC1090
set -a; . "$ENV_FILE"; set +a
: "${S3_BACKUP_BUCKET:=${BACKUP_S3_BUCKET:-}}"
[ -n "${S3_BACKUP_BUCKET:-}" ] || die "S3_BACKUP_BUCKET이 비어 있습니다."

BASE="s3://${S3_BACKUP_BUCKET}/${S3_BACKUP_PREFIX}"

if [ $# -eq 0 ]; then
  log "최근 백업 10개:"
  aws s3 ls "${BASE}/" | sort -r | head -10
  echo
  log "복원하려면: $0 <파일명>"
  exit 0
fi

FILE="$1"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

log "내려받는 중: ${BASE}/${FILE}"
aws s3 cp "${BASE}/${FILE}" "$TMP/$FILE" --only-show-errors || die "다운로드 실패"
gzip -t "$TMP/$FILE" || die "받은 파일이 깨졌습니다."

cat <<WARN

  ⚠️  ${DB_NAME} 의 현재 데이터를 덮어씁니다.
      덤프가 --clean 으로 만들어져 기존 테이블을 지우고 다시 만듭니다.
      되돌릴 수 없습니다.

WARN
read -r -p "정말 복원하시겠습니까? 'restore' 를 입력하세요: " CONFIRM
[ "$CONFIRM" = "restore" ] || die "취소했습니다."

# 복원 중에 앱이 쓰기를 하면 충돌한다. 잠깐 내렸다가 올린다.
log "앱 정지"
docker compose -f "$COMPOSE_FILE" stop app

log "복원 중"
if gunzip -c "$TMP/$FILE" \
   | docker compose -f "$COMPOSE_FILE" exec -T "$DB_SERVICE" \
       psql -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 >/dev/null; then
  log "복원 완료"
else
  log "복원 실패 — 앱을 다시 올린 뒤 상태를 확인하세요."
  docker compose -f "$COMPOSE_FILE" start app
  exit 1
fi

log "앱 기동"
docker compose -f "$COMPOSE_FILE" start app
log "끝. 사이트와 관리자 화면을 확인하세요."
