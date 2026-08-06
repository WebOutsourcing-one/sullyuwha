# 배포 · 백업 운영 문서

Lightsail 인스턴스 한 대에 **앱 + Postgres + 리버스 프록시**를 올리고,
GitHub Actions로 배포하며, DB는 S3로 백업하는 구성이다.

```
GitHub push(main)
  → Actions: 이미지 빌드 → GHCR 푸시
  → SSH: 인스턴스에서 pull → 마이그레이션 → 컨테이너 교체 → 헬스체크

인스턴스
  caddy(443) → app(5001) → postgres   ← 전부 한 대, DB는 외부 미노출
  cron: 매일 pg_dump → S3(비공개 버킷)
```

## 왜 이 구성인가

- **DB를 인터넷에 열지 않는다.** 주문 테이블에 이름·연락처·배송지가 들어간다.
  앱과 DB가 같은 compose 네트워크에 있어 포트를 호스트에도 열지 않는다.
- **인스턴스에서 빌드하지 않는다.** Next 빌드는 메모리를 많이 써서 1~2GB
  인스턴스에서는 OOM으로 죽거나 서비스 중인 앱을 밀어낸다.
- **TLS는 Caddy가 자동 처리.** Lightsail 로드밸런서는 월 $18로 인스턴스보다 비싸다.

---

# 1. 최초 세팅

## 1-1. 인스턴스

Lightsail에서 Ubuntu 인스턴스를 만든다. **1GB 이상**을 권한다(0.5GB는 부족하다).

```bash
# Docker 설치
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER   # 재로그인 필요

# aws CLI (백업 스크립트가 쓴다)
sudo apt-get update && sudo apt-get install -y unzip
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o awscliv2.zip
unzip -q awscliv2.zip && sudo ./aws/install && rm -rf aws awscliv2.zip

# 디렉터리
sudo mkdir -p /opt/sullyuwha/scripts
sudo chown -R $USER:$USER /opt/sullyuwha
```

방화벽(Lightsail 콘솔 → Networking)에서 **80, 443만** 연다. 5432는 절대 열지 않는다.

## 1-2. 자동 스냅샷

인스턴스 → Snapshots 탭 → **Automatic snapshots** 토글 ON.

7일 롤링이고 인스턴스를 지우면 같이 지워진다. 그래서 아래 S3 백업을 **함께** 건다.

## 1-3. S3 버킷 두 개

| 버킷 | 용도 | 공개 여부 |
|---|---|---|
| `sullyuwha-assets` | 상품 이미지 | 공개 읽기 |
| `sullyuwha-backups` | DB 덤프 | **반드시 비공개** |

> ⚠️ 덤프를 에셋 버킷에 두면 개인정보가 인터넷에 열린다. 반드시 분리한다.

백업 버킷에 수명주기 규칙을 건다 (콘솔 → Management → Lifecycle rules):
- 접두사 `db-backups/`, **90일 후 만료**
- 스크립트가 삭제하지 않는 이유 — 삭제 로직이 버그를 내면 백업이 사라진다.
  만드는 일만 스크립트가 하고, 지우는 일은 S3에 맡긴다.

## 1-4. `.env.production` (서버에만 둔다)

`/opt/sullyuwha/.env.production`:

```bash
# ── 필수 ──────────────────────────────────────
POSTGRES_PASSWORD=<강한 비밀번호>
DOMAIN=sullyuwha.com
APP_IMAGE=ghcr.io/<org>/sullyuwha:latest   # 배포 시 Actions가 덮어쓴다

AUTH_SECRET=<openssl rand -base64 32>
AUTH_URL=https://sullyuwha.com
AUTH_ADMIN_EMAIL=admin@sullyuwha.com
AUTH_ADMIN_PASSWORD=<평문. 첫 로그인 후 지워도 된다>

# ── S3 (에셋) ─────────────────────────────────
S3_REGION=ap-northeast-2
S3_BUCKET=sullyuwha-assets
S3_ACCESS_KEY=<IAM 액세스 키>
S3_SECRET_KEY=<IAM 시크릿 키>
S3_PUBLIC_URL=https://assets.sullyuwha.com
NEXT_PUBLIC_ASSET_BASE_URL=https://assets.sullyuwha.com

# ── 백업 ──────────────────────────────────────
S3_BACKUP_BUCKET=sullyuwha-backups
AWS_ACCESS_KEY_ID=<백업 전용 IAM 키>
AWS_SECRET_ACCESS_KEY=<백업 전용 IAM 시크릿>
AWS_DEFAULT_REGION=ap-northeast-2

# ── GHCR이 비공개일 때만 ──────────────────────
GHCR_USER=<github 사용자명>
GHCR_TOKEN=<read:packages 권한 PAT>
```

```bash
chmod 600 /opt/sullyuwha/.env.production
```

백업용 IAM은 **해당 버킷 `PutObject`만** 주는 별도 사용자로 만든다.
에셋용 키를 재사용하면 키 하나가 유출됐을 때 피해 범위가 두 배가 된다.

## 1-5. GitHub 시크릿 · 변수

Settings → Secrets and variables → Actions

**Secrets**

| 이름 | 값 |
|---|---|
| `LIGHTSAIL_HOST` | 인스턴스 고정 IP |
| `LIGHTSAIL_USER` | `ubuntu` |
| `LIGHTSAIL_SSH_KEY` | 배포용 개인키 전문 |
| `LIGHTSAIL_KNOWN_HOSTS` | `ssh-keyscan -H <IP>` 결과 |

`LIGHTSAIL_KNOWN_HOSTS`를 쓰는 이유 — `StrictHostKeyChecking=no`로 두면
중간자 공격을 감지하지 못한 채 배포 자격증명이 넘어간다.

**Variables** (시크릿 아님 — 어차피 번들에 실린다)

| 이름 | 값 |
|---|---|
| `NEXT_PUBLIC_ASSET_BASE_URL` | `https://assets.sullyuwha.com` |
| `NEXT_PUBLIC_TOSS_CLIENT_KEY` | 결제를 열 때 채운다 |

## 1-6. 첫 기동

```bash
cd /opt/sullyuwha
# docker-compose.prod.yml, Caddyfile 을 올려둔다 (이후엔 Actions가 자동 전송)
docker compose -f docker-compose.prod.yml --env-file .env.production up -d postgres
docker compose -f docker-compose.prod.yml --env-file .env.production \
  run --rm --no-deps app bunx prisma migrate deploy
docker compose -f docker-compose.prod.yml --env-file .env.production \
  run --rm --no-deps app bun prisma/seed.ts     # 브랜드 콘텐츠 초기값
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

시드를 건너뛰면 히어로·스토리·문의가 **기본 문구**로 나간다(500이 나지는 않는다).

## 1-7. 백업 크론

```bash
crontab -e
```

```cron
# 매일 03:20 KST(=18:20 UTC) DB 백업
20 18 * * * /opt/sullyuwha/scripts/backup-db.sh >> /var/log/sullyuwha-backup.log 2>&1
```

한 번 손으로 돌려 확인한다:

```bash
/opt/sullyuwha/scripts/backup-db.sh
aws s3 ls s3://sullyuwha-backups/db-backups/
```

---

# 2. 평소 운영

## 배포

`main`에 push하면 자동으로 나간다. 특정 커밋으로 배포하거나 롤백하려면
Actions → Deploy → **Run workflow**에서 커밋 해시를 넣는다.

> 지금은 main에 push할 때마다 배포된다. WIP 커밋이 그대로 나가는 게 곤란하면
> `on.push`를 지우고 `workflow_dispatch`만 남기거나, 태그 기준으로 바꾸면 된다.

## 복원

```bash
/opt/sullyuwha/scripts/restore-db.sh              # 최근 백업 목록
/opt/sullyuwha/scripts/restore-db.sh sullyuwha-20260806T182000Z.sql.gz
```

앱을 잠깐 내렸다가 복원하고 다시 올린다. `restore`를 타이핑해야 진행된다.

**사고 나기 전에 한 번은 돌려볼 것.** 복원해 본 적 없는 백업은 백업이 아니다.

## 로그 · 상태

```bash
cd /opt/sullyuwha
C="docker compose -f docker-compose.prod.yml --env-file .env.production"
$C ps
$C logs -f app
$C logs --tail=50 caddy      # 인증서 발급이 안 될 때
```

## 관리자 비밀번호 변경

`.env.production`의 `AUTH_ADMIN_PASSWORD`를 새 평문으로 바꾸고 앱만 재시작한다.
앱이 해싱해서 DB에 저장하고, 이후 env에서 지워도 로그인이 유지된다.

```bash
$C up -d --force-recreate app
```

---

# 3. 알아둘 것

**마이그레이션은 새 컨테이너가 뜨기 전에 돈다.** 컬럼 추가처럼 되돌릴 필요 없는
변경은 문제없지만, 컬럼 삭제·이름 변경처럼 옛 코드가 못 읽는 변경은 배포 중
잠깐 옛 앱이 새 스키마를 보게 된다. 그런 마이그레이션은 두 번에 나눠 배포한다
(먼저 추가 → 코드 교체 → 나중에 삭제).

**속도 제한은 이 구성에서 정상 동작한다.** `src/lib/rate-limit.ts`가 프로세스
메모리를 쓰는데 앱 컨테이너가 하나뿐이라 전역 카운터가 실제로 전역이다.
인스턴스를 늘리면 Redis로 옮겨야 한다.

**이미지 업로드 10MB 제한도 그대로 유효하다.** 리버스 프록시가 Caddy라 별도
상한이 없다(서버리스의 4.5MB 같은 제약이 없다).
