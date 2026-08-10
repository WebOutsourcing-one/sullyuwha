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

### 에셋 버킷을 다른 프로젝트와 공유할 때

`S3_KEY_PREFIX` 를 주면 이 프로젝트가 쓰는 파일이 전부 그 경로 아래로만 들어간다.
접두사를 키 문자열에 직접 박지 않는 이유 — 키는 업로드가 만드는 것(`products/<uuid>`)과
`prisma/seed.ts` 에 손으로 적은 것(`hero/main` 등 45개) 두 종류다. 키에 박으면 양쪽을
다 고쳐야 하고, 앞으로 키를 적을 때마다 빠뜨리면 **에러 없이** 버킷 루트로 떨어진다.

```
<버킷>/
  sullyuwha/          ← S3_KEY_PREFIX
    products/<uuid>.png     관리자 업로드
    hero/main.jpg           콘솔에서 직접 올린 것
    collection/dangui-subok.jpg
  다른프로젝트/
```

콘솔에서 직접 올려도 된다 — 앱은 `{베이스URL}/{키}.{확장자}` 로 조립할 뿐이라
그 자리에 파일이 있으면 그대로 나온다. 단, **확장자가 DB 값과 맞아야** 한다
(`image_ext` 가 비어 있으면 `.jpg` 로 조립하므로 `main.png` 는 안 뜬다).

공개 읽기는 버킷 전체가 아니라 이 접두사에만 준다:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadSullyuwhaAssets",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::<버킷>/sullyuwha/*"
  }]
}
```

버킷의 **Block public access** 에서 "새 공개 버킷 정책 차단" 항목을 꺼야 이 정책이 먹는다.
안 열면 업로드는 성공하는데 이미지 요청이 전부 `403 AccessDenied` 로 돌아온다.

백업 버킷에 수명주기 규칙을 건다 (콘솔 → Management → Lifecycle rules):
- 접두사 `db-backups/`, **90일 후 만료**
- 스크립트가 삭제하지 않는 이유 — 삭제 로직이 버그를 내면 백업이 사라진다.
  만드는 일만 스크립트가 하고, 지우는 일은 S3에 맡긴다.

## 1-4. `.env.production` (서버에만 둔다)

> 저장소의 템플릿은 `.env.production.example` 이다. 이름을 다르게 둔 이유 —
> 같으면 서버 파일을 저장소로 복사해 오는 순간 비밀값이 커밋된다.
> 이 이름(`.env.production`)은 gitignore 대상이라 실수로 커밋되지 않는다.

`/opt/sullyuwha/.env.production`:

```bash
# ── 필수 ──────────────────────────────────────
POSTGRES_PASSWORD=<강한 비밀번호>
# 서비스하는 모든 호스트. 리다이렉트만 하는 것도 인증서가 필요하므로 함께 적는다.
DOMAIN=sullyuwha.co.kr, www.sullyuwha.co.kr
# 실제로 앱을 서빙할 하나의 호스트. 나머지는 여기로 301 리다이렉트된다.
CANONICAL_HOST=sullyuwha.co.kr
APP_IMAGE=ghcr.io/<org>/sullyuwha:latest   # 배포 시 Actions가 덮어쓴다

AUTH_SECRET=<openssl rand -base64 32>
# ⚠️ CANONICAL_HOST 와 같은 호스트여야 한다. 어긋나면 로그인이 맴돈다.
#    (배포가 이 불일치를 확인해 컨테이너를 건드리기 전에 멈춘다)
AUTH_URL=https://sullyuwha.co.kr
AUTH_ADMIN_EMAIL=admin@sullyuwha.com
AUTH_ADMIN_PASSWORD=<평문. 첫 로그인 후 지워도 된다>

# ── S3 (에셋) ─────────────────────────────────
S3_REGION=ap-northeast-2
S3_BUCKET=<에셋 버킷>
S3_ACCESS_KEY=<IAM 액세스 키>
S3_SECRET_KEY=<IAM 시크릿 키>
# 버킷을 다른 프로젝트와 공유할 때만. 단독 버킷이면 비운다.
S3_KEY_PREFIX=sullyuwha
# ⚠️ 아래 두 값은 끝이 S3_KEY_PREFIX 와 같아야 한다 (1-3 참고).
S3_PUBLIC_URL=https://<버킷>.s3.ap-northeast-2.amazonaws.com/sullyuwha
# ⚠️ 이 값은 빌드 타임에 굳는다. 여기 적어도 빌드에는 반영되지 않는다 — 1-5 참고.
NEXT_PUBLIC_ASSET_BASE_URL=https://<버킷>.s3.ap-northeast-2.amazonaws.com/sullyuwha

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
| `NEXT_PUBLIC_ASSET_BASE_URL` | `https://<버킷>.s3.ap-northeast-2.amazonaws.com/sullyuwha` |
| `NEXT_PUBLIC_TOSS_CLIENT_KEY` | 결제를 열 때 채운다 |

> ⚠️ **`NEXT_PUBLIC_*` 의 진짜 출처는 서버의 `.env.production` 이 아니라 이 표다.**
> 빌드 타임에 번들로 굳기 때문에 런타임에 주입해도 이미 늦다. CSP의 `img-src` 와
> `next.config.ts` 의 `remotePatterns` 도 같은 값에서 나오므로, 여기가 틀리면
> 이미지 URL이 틀리는 동시에 브라우저가 그 호스트를 차단한다.
>
> 값을 바꾼 뒤에는 **반드시 재배포**해야 반영된다. 커밋 없이 반영하려면
> Actions → Deploy → `Run workflow`.
>
> 확인하는 법 — 배포된 사이트의 응답 헤더에 실제로 박힌 값이 보인다:
> ```bash
> curl -sI https://<도메인>/ | grep -i content-security-policy
> ```
> `img-src` 에 버킷 호스트가 없으면 이 변수가 틀린 것이다.

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

### 로그 파일부터 만든다

크론은 `ubuntu` 로 도는데 `/var/log` 는 root 소유다. 이 단계를 빠뜨리면
리다이렉트가 권한 오류로 막혀 **작업이 시작도 못 하고 매번 조용히 실패한다.**
로그가 없으니 실패했다는 사실조차 남지 않는다.

```bash
sudo touch /var/log/sullyuwha-backup.log /var/log/sullyuwha-prune.log
sudo chown "$USER":"$USER" /var/log/sullyuwha-backup.log /var/log/sullyuwha-prune.log
```

### 백업 스크립트가 필요로 하는 것

`backup-db.sh` 는 아래가 갖춰지지 않으면 첫 줄에서 멈춘다. 크론만 등록하고
끝내면 실패한다는 사실조차 모르게 되므로, **손으로 한 번 돌려 확인한 뒤** 등록한다.

| 필요한 것 | 확인 |
|---|---|
| 비공개 백업 버킷 | 에셋 버킷과 **반드시 분리**. 그쪽은 공개 읽기라 덤프를 두면 주문자 개인정보가 인터넷에 열린다 |
| 백업 전용 IAM 키 | 해당 버킷 `PutObject` 만. 에셋 키를 재사용하면 유출 시 피해 범위가 두 배가 된다 |
| `.env.production` | `S3_BACKUP_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION` |
| `aws` CLI | `command -v aws` |

```bash
/opt/sullyuwha/scripts/backup-db.sh    # "업로드 완료" 가 나와야 한다
```

### 등록

```bash
crontab -e
```

```cron
# 매일 03:20 KST(=18:20 UTC) DB 백업
20 18 * * * /opt/sullyuwha/scripts/backup-db.sh >> /var/log/sullyuwha-backup.log 2>&1

# 매월 1일·16일 04:40 KST(=19:40 UTC) 쓰이지 않는 상품 이미지 정리
40 19 1,16 * * cd /opt/sullyuwha && docker compose -f docker-compose.prod.yml --env-file .env.production run --rm --no-deps app bun scripts/prune-assets.ts --apply >> /var/log/sullyuwha-prune.log 2>&1
```

이미지 정리가 필요한 이유 — 업로드는 파일을 고른 즉시 S3에 올라간다(미리보기를
바로 보여주기 위해서다). 저장·삭제 때의 정리는 앱이 하지만, **등록하다 취소하거나
뒤로 가면 서버는 그 사실을 알 방법이 없다.** 그렇게 남은 것을 걷어낸다.

`--apply` 없이 돌리면 지우지 않고 목록만 보여준다. 처음에는 그렇게 한 번 확인한다:

```bash
cd /opt/sullyuwha
docker compose -f docker-compose.prod.yml --env-file .env.production \
  run --rm --no-deps app bun scripts/prune-assets.ts
```

> ⚠️ **DATABASE_URL 이 운영 DB를 가리키는지 반드시 확인한다.** 다른 DB를 보면
> 참조가 잡히지 않아 살아 있는 이미지가 전부 고아로 보인다. 스크립트가
> 24시간 유예와 "훑은 것의 절반 넘게 지우려 하면 중단" 두 겹으로 막지만,
> 애초에 맞는 DB를 보게 하는 것이 먼저다.

등록한 뒤에는 크론이 실제로 물렸는지, 첫 실행이 남았는지 확인한다:

```bash
crontab -l
aws s3 ls s3://sullyuwha-backups/db-backups/
tail -n 20 /var/log/sullyuwha-backup.log
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
