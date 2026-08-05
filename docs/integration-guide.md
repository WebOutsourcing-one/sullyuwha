# 소셜 로그인 · 결제 연동 가이드

카카오/네이버 로그인과 토스페이먼츠 결제를 실제로 동작시키기 위한 문서다.

**코드는 양쪽 다 구현이 끝나 있다.** 남은 일은 각 콘솔에서 키를 발급받아 env에 채우고,
배포 배선을 맞추는 것이다.

## 현재 상태

| 항목 | 코드 | 설정값 |
|---|---|---|
| 카카오/네이버 로그인 | 완료 — `src/lib/auth.ts:141-142` | ❌ `.env.production`에 키가 전부 빈 값 |
| 토스 결제 (주문→결제창→승인→웹훅) | 완료 — 전 구간 | ❌ `.env.production`에 **키 항목 자체가 없음** |
| CSP(토스 iframe 허용) | 완료 — `next.config.ts:37-43` | — |
| Prisma 스키마(User/Account/Order) | 완료 | — |

---

# 1부 — 카카오 로그인

## 1-1. 코드가 어떻게 물려 있는지

```
LoginRequired.tsx (signIn("kakao"))
  → /api/auth/signin/kakao            ← src/app/api/auth/[...nextauth]/route.ts
  → kauth.kakao.com/oauth/authorize   (카카오 동의 화면)
  → /api/auth/callback/kakao          ← ★ 콘솔에 등록할 Redirect URI
  → PrismaAdapter가 users/accounts에 저장
  → JWT 세션 발급 (session.user.id = users.id)
  → POST /api/orders 가 이 id로 주문을 계정에 연결
```

`src/lib/auth.ts`에서 `Kakao`를 **인자 없이** 쓰고 있다(141행). 이건 Auth.js v5의 규약이다.
환경변수 이름이 `AUTH_KAKAO_ID` / `AUTH_KAKAO_SECRET`이면 자동으로 주입된다.
**이름을 바꾸면 안 된다.**

## 1-2. 카카오 개발자센터 설정

[developers.kakao.com](https://developers.kakao.com) → 내 애플리케이션 → 애플리케이션 추가

> 콘솔 UI의 메뉴 이름은 종종 바뀐다. 아래는 작성 시점 기준이며,
> 못 찾겠으면 "카카오 로그인", "보안", "동의항목" 키워드로 검색하면 된다.

### ① 앱 키 확인

- **내 애플리케이션 → 앱 키 → REST API 키** → 이게 `AUTH_KAKAO_ID`다
- ⚠️ JavaScript 키나 네이티브 앱 키가 아니다. 서버 사이드 OAuth라 REST API 키를 쓴다

### ② 플랫폼 등록

- 앱 설정 → 플랫폼 → **Web 플랫폼 등록**
- 사이트 도메인: `https://sullyuwha.com`, `http://localhost:5001`
- 이걸 빼먹으면 Redirect URI 등록 칸이 아예 활성화되지 않는다

### ③ 카카오 로그인 활성화 + Redirect URI

- 제품 설정 → 카카오 로그인 → **활성화 설정 ON**
- Redirect URI에 아래 두 개 등록 (경로가 **정확히** 일치해야 한다)

```
https://sullyuwha.com/api/auth/callback/kakao
http://localhost:5001/api/auth/callback/kakao
```

로컬 포트가 5001인 이유는 `package.json`의 `next dev -p 5001` 때문이다.

### ④ Client Secret 발급

- 제품 설정 → 카카오 로그인 → **보안** → Client Secret 코드 생성
- **활성화 상태를 반드시 "사용함"으로** 변경 → 이 값이 `AUTH_KAKAO_SECRET`

생성만 하고 활성화를 안 하면 토큰 요청이 실패한다.
Auth.js의 카카오 프로바이더는 `client_secret_post` 방식으로 시크릿을 항상 보내기 때문이다.

### ⑤ 동의항목

제품 설정 → 카카오 로그인 → 동의항목

- **닉네임**(`profile_nickname`) — 필수 동의
- **프로필 사진**(`profile_image`) — 선택 동의
- **카카오계정(이메일)**(`account_email`) — 선택 동의

Auth.js 카카오 프로바이더는 scope를 코드에서 지정하지 않고 **콘솔의 동의항목 설정을 그대로 따른다**
(`@auth/core/providers/kakao.js`의 authorization URL이 `?scope`로 비어 있다).
즉 동의항목을 켜는 것만으로 scope가 결정된다.

## 1-3. 카카오의 가장 큰 함정 — 이메일

**이메일 동의항목은 "비즈니스 앱"으로 전환해야 사용할 수 있다.**
개인 개발자 앱 상태에서는 이메일 항목이 회색으로 잠겨 있다.

- 전환 경로: 앱 설정 → 비즈니스 → 비즈니스 앱 전환 (사업자등록번호 필요)
- 전환 전에는 `profile.kakao_account.email`이 `undefined`로 오고, `users.email`이 `null`로 저장된다

코드상 `email String? @unique`(`prisma/schema.prisma`)라 **동작 자체는 정상이다.**
Postgres는 NULL 중복을 허용하므로 이메일 없는 사용자가 여러 명 생겨도 문제없다. 다만:

- 체크아웃 폼의 이메일 칸이 자동으로 채워지지 않는다 (`CheckoutForm`의 `defaultEmail`이 빈 값)
- 영수증 발송 대상을 고객이 직접 입력해야 한다

사업자등록번호가 아직 없다면 **이메일 없이 먼저 오픈해도 무방하다.**
주문 조회는 세션 기반이라 이메일에 의존하지 않는다.

---

# 2부 — 네이버 로그인

## 2-1. 네이버 개발자센터 설정

[developers.naver.com](https://developers.naver.com) → Application → 애플리케이션 등록

### ① 기본 정보

- 애플리케이션 이름: `설유화` (사용자 동의 화면에 그대로 노출된다)
- 사용 API: **네이버 로그인** 선택

### ② 제공 정보 선택 — 여기서 체크한 항목만 넘어온다

- **회원이름** 또는 **별명** — Auth.js는 `response.nickname`을 `name`으로 매핑하므로
  **별명을 체크해야** 이름이 채워진다
- **이메일 주소**
- **프로필 사진**

`@auth/core/providers/naver.js`의 매핑:

```js
id:    profile.response.id
name:  profile.response.nickname   // ← 회원이름(name)이 아니라 별명(nickname)
email: profile.response.email
image: profile.response.profile_image
```

**회원이름만 체크하고 별명을 빼면 `name`이 `undefined`가 된다.** 실수하기 쉬운 부분이다.

### ③ 로그인 오픈 API 서비스 환경

- 환경 추가 → **PC웹**
- 서비스 URL: `https://sullyuwha.com`
  — ⚠️ **도메인 루트만** 받는다. 경로를 붙이면 거부된다
- 네이버 로그인 Callback URL:

```
https://sullyuwha.com/api/auth/callback/naver
```

로컬 개발용으로 PC웹 환경을 하나 더 추가한다:
서비스 URL `http://localhost:5001`, Callback `http://localhost:5001/api/auth/callback/naver`

### ④ Client ID / Secret

발급된 값을 각각 `AUTH_NAVER_ID`, `AUTH_NAVER_SECRET`에 넣는다.

## 2-2. 네이버의 가장 큰 함정 — 검수

네이버는 **개발 상태에서 앱 관리자로 등록된 네이버 계정만 로그인이 된다.**
다른 사람이 로그인을 시도하면 실패한다.

- 실서비스 오픈 전에 **애플리케이션 → 검수 상태 → 검수 요청**을 해야 한다
- 검수에는 서비스 화면 캡처, 개인정보 처리방침 URL 등이 필요하다 (보통 1~3영업일)
- 개발/테스트 단계에서는 **멤버 관리에 테스터 네이버 아이디를 추가**하면 된다

카카오는 이런 제약이 없어서(비즈 앱 전환은 이메일에만 해당)
**네이버 검수가 오픈 일정의 크리티컬 패스가 되기 쉽다.** 미리 신청해 둘 것.

---

# 3부 — 소셜 로그인 공통 설정 & 알려진 문제

## 3-1. 필수 환경변수

```bash
# 생성: openssl rand -base64 32
AUTH_SECRET=<32바이트 랜덤>

# 자체 호스팅(Lightsail)이라 반드시 명시.
# 없으면 콜백 URL이 요청의 Host 헤더에서 유도된다(위조 위험).
AUTH_URL=https://sullyuwha.com

AUTH_KAKAO_ID=<REST API 키>
AUTH_KAKAO_SECRET=<Client Secret>
AUTH_NAVER_ID=<Client ID>
AUTH_NAVER_SECRET=<Client Secret>

# 소셜 로그인 사용자를 users/accounts에 저장하려면 DB가 필요하다
DATABASE_URL=postgresql://...
```

`src/lib/auth.ts:112-115`를 보면 **`DATABASE_URL`이 없으면 PrismaAdapter가 아예 붙지 않는다.**
그러면 카카오 로그인은 성공해도 `users` 행이 안 생기고,
`POST /api/orders`의 `resolveUserId()`가 DB에서 사용자를 못 찾아 401을 반환한다.
즉 **로그인은 되는데 결제가 안 되는** 상태가 된다. DB 연결이 선행 조건이다.

## 3-2. 지금 구조에서 걸릴 문제 두 가지

### ① 소셜 로그인 실패 시 관리자 로그인 화면으로 떨어진다

`src/lib/auth.ts:170`:

```ts
pages: { signIn: "/sull-admin/login" },
```

Auth.js는 OAuth 에러가 나면 이 `signIn` 페이지로 리다이렉트한다.
그런데 이 경로는 `sull-admin/login/page.tsx` — **관리자 이메일/비밀번호 폼**이다.
일반 고객이 카카오 로그인에 실패하면 정체불명의 관리자 로그인 화면을 보게 된다.

→ 고객용 로그인/에러 페이지를 따로 두고 `pages.error`를 지정하는 편이 낫다.

### ② 같은 이메일로 카카오→네이버 순서로 로그인하면 막힌다

Auth.js는 기본적으로 **이미 존재하는 이메일에 다른 프로바이더 계정을 자동 연결하지 않는다.**
카카오로 가입한 사용자가 같은 이메일의 네이버로 로그인하면 `OAuthAccountNotLinked` 에러가 나고,
위 ①의 관리자 로그인 화면으로 떨어진다. 사용자 입장에서는 원인을 알 수 없다.

선택지는 두 가지다:

- **(권장) 에러 페이지에서 "이미 카카오로 가입된 이메일입니다. 카카오로 로그인해 주세요"라고 안내**
  — 계정 탈취 위험이 없다
- `allowDangerousEmailAccountLinking: true`로 자동 연결
  — 이름 그대로 위험하다. 이메일 소유를 검증하지 않는 프로바이더가 섞이면 계정 탈취 경로가 된다.
  카카오/네이버는 이메일을 검증하는 편이지만, 기본값을 뒤집는 결정이라 의식적으로 선택해야 한다

## 3-3. 로컬에서 테스트하는 순서

```bash
bun run db:up          # postgres 기동
bun run db:migrate     # 스키마 반영
# .env.local 에 AUTH_SECRET, AUTH_KAKAO_*, AUTH_NAVER_*, DATABASE_URL 채우기
bun run dev            # http://localhost:5001
```

`http://localhost:5001/checkout/<상품id>`에서 로그인 버튼이 보이면 정상이다.
로그인 후 `bun run db:studio`로 `users`, `accounts` 테이블에 행이 생겼는지 확인한다.

---

# 4부 — 토스페이먼츠 결제

## 4-1. 결제 흐름 (구현된 그대로)

```
[1] 주문서 생성 — POST /api/orders
    CheckoutForm이 productId + 수량 + 배송정보만 전송 (금액은 안 보냄)
    → PlaceOrder가 DB 상품가 × 수량으로 금액을 계산해 Order(PENDING) 생성
    → orderNumber, orderName, amount 반환

[2] 결제창 — widgets.requestPayment()
    successUrl: /checkout/success, failUrl: /checkout/fail
    → 카드사·은행 인증 화면 (토스 도메인)

[3] 승인 — /checkout/success 서버 컴포넌트
    ★ 여기서 confirm API를 호출해야 실제로 돈이 빠진다.
      리다이렉트만으로는 결제가 끝난 게 아니다.
    → ConfirmPayment가 저장된 금액과 대조 후 승인 → Order를 PAID로

[4] 웹훅 — POST /api/payments/webhook (가상계좌 입금용)
    → SyncPaymentStatus가 토스 API로 상태를 재조회해 반영
```

**이 구조의 핵심은 금액을 클라이언트에서 받지 않는다는 점이다.**
결제창이 돌려준 `amount`는 대조에만 쓰고(`ConfirmPayment.ts:64`),
실제 승인 요청에는 DB에 저장된 금액을 보낸다(`ConfirmPayment.ts:83`).
브라우저에서 금액을 조작해도 승인이 통과하지 않는다.

### 관련 파일

| 파일 | 역할 |
|---|---|
| `src/presentation/components/checkout/CheckoutForm.tsx` | 결제위젯 렌더 + 주문서 요청 + 결제창 호출 |
| `src/app/api/orders/route.ts` | 주문서 생성 API (로그인 필수, 금액 미수신) |
| `src/application/use-cases/PlaceOrder.ts` | 금액 계산 · 입력 검증 |
| `src/app/checkout/success/page.tsx` | 승인 트리거 |
| `src/application/use-cases/ConfirmPayment.ts` | 승인 · 멱등 처리 · 금액 대조 |
| `src/infrastructure/payments/TossPaymentsClient.ts` | 토스 코어 API (서버 전용) |
| `src/app/api/payments/webhook/route.ts` | 가상계좌 입금 반영 |

## 4-2. 키 발급

[developers.tosspayments.com](https://developers.tosspayments.com) → 로그인 → **내 개발정보**

| 키 | 접두사 | 환경변수 | 노출 |
|---|---|---|---|
| 클라이언트 키 | `test_ck_` / `live_ck_` | `NEXT_PUBLIC_TOSS_CLIENT_KEY` | 브라우저 노출이 정상 |
| 시크릿 키 | `test_sk_` / `live_sk_` | `TOSS_SECRET_KEY` | ⚠️ 절대 노출 금지 |

- **테스트 키는 가입 즉시** 발급된다. 실제 돈이 오가지 않는다
- **라이브 키는 상점 심사·계약 후** 발급된다 (사업자등록증, 통장 사본 등 — 보통 며칠)
- 시크릿 키가 유출되면 **임의 금액의 승인과 환불이 가능하다.**
  `NEXT_PUBLIC_`을 붙이는 순간 클라이언트 번들에 박혀 되돌릴 수 없다

## 4-3. 환경변수 추가

**현재 `.env.production`에 토스 키 항목이 아예 없다.** 아래를 추가해야 한다:

```bash
# 토스페이먼츠
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_...
TOSS_SECRET_KEY=test_sk_...

# 결제는 실제 DB 가격이 필요하다. 정적 데이터는 price=0이라 결제 버튼이 안 나온다
DATA_SOURCE=database
DATABASE_URL=postgresql://...
```

`DATA_SOURCE=database`가 왜 필요한지는 `src/composition/container.ts:26`에 있다.
기본값인 정적 데이터 모드에서는 상품 가격이 전부 0이고, `isPayableKrw(0)`이 false라
체크아웃 페이지에 결제 폼 대신 "구매 문의" CTA가 뜬다.

## 4-4. ⚠️ 배포 시 반드시 걸리는 문제 — Docker 빌드

**`NEXT_PUBLIC_` 변수는 런타임이 아니라 빌드 타임에 번들에 인라인된다.**
그런데 현재 `Dockerfile`에는 이를 받는 `ARG`가 없고, `.dockerignore`가 `.env.*`를
빌드 컨텍스트에서 제외한다:

```
# .dockerignore
.env
.env.*
!.env.example
```

즉 `bun run build`가 컨테이너 안에서 돌 때 `NEXT_PUBLIC_TOSS_CLIENT_KEY`가
**비어 있는 채로 번들링된다.** 결과적으로 프로덕션 체크아웃 화면에 이 문구가 뜬다:

> 결제 모듈이 설정되지 않았습니다. NEXT_PUBLIC_TOSS_CLIENT_KEY를 확인해 주세요.

런타임에 `--env-file`로 아무리 넣어도 해결되지 않는다. 이미 번들에 박힌 뒤이기 때문이다.

**→ `Dockerfile`에 build arg를 추가해 해결했다.** 이제 아래처럼 값을 넘기면 된다.
(넘기지 않으면 기본값이 빈 문자열이라 예전과 같은 증상이 그대로 재현되므로,
빌드 명령에서 빠뜨리지 않는 것이 중요하다)

빌드 명령:

```bash
docker build \
  --build-arg NEXT_PUBLIC_TOSS_CLIENT_KEY=live_ck_... \
  --build-arg NEXT_PUBLIC_ASSET_BASE_URL=https://assets.sullyuwha.com \
  -t sullyuwha .
```

시크릿 키는 **절대 build arg로 넣지 말 것** — 이미지 레이어 히스토리에 남는다.
런타임 주입이 맞다:

```bash
docker run --env-file /path/to/.env.production -p 5001:5001 sullyuwha
```

`NEXT_PUBLIC_ASSET_BASE_URL`도 같은 문제를 겪는다.
이미지가 프로덕션에서 안 나오고 있다면 원인이 이것이다.

## 4-5. 웹훅 등록 (가상계좌를 쓴다면 필수)

결제위젯 기본 설정에는 **가상계좌가 포함된다.**
가상계좌는 발급 시점에 아직 입금 전이라 주문이 `WAITING_FOR_DEPOSIT`에 머문다.
실제 입금은 며칠 뒤일 수 있고 그때 고객은 사이트에 없다.
**웹훅이 없으면 입금된 주문이 영영 대기 상태로 남는다.**

개발자센터 → **웹훅** → 등록

- 이벤트: `PAYMENT_STATUS_CHANGED`
- URL: `https://sullyuwha.com/api/payments/webhook`

이 엔드포인트는 **페이로드를 신뢰하지 않는다**(`webhook/route.ts:17-19`).
공개 URL이라 누구나 그럴듯한 JSON을 POST할 수 있으므로, 주문번호만 취하고
상태는 토스 API로 다시 조회한다. 그래서 별도 서명 검증 없이도
위조 페이로드가 주문 상태를 바꿀 수 없다.

가상계좌를 아예 받지 않기로 하면 웹훅 없이도 된다.
그 경우 개발자센터의 결제위젯 설정에서 가상계좌를 뺀다.

**로컬에서 웹훅 테스트**는 공인 URL이 필요하다:

```bash
ngrok http 5001
# 발급된 https://xxxx.ngrok-free.app/api/payments/webhook 을 임시 등록
```

## 4-6. 테스트 방법

테스트 키로 결제하면 실제 청구가 발생하지 않는다.

**카드 결제** — 결제창에서 아무 카드사나 선택하면 테스트 인증 화면이 뜬다.
카드번호는 개발자센터 문서의 테스트 카드번호를 쓰거나, 테스트 모드에서는 임의 값으로도 통과한다.

**꼭 확인해야 할 시나리오:**

| 시나리오 | 방법 | 기대 결과 |
|---|---|---|
| 정상 승인 | 카드 결제 완료 | 주문 `PAID`, 영수증 링크 노출 |
| **성공 페이지 새로고침** | `/checkout/success`에서 F5 | 중복 승인 없이 동일 결과 (멱등 처리) |
| 결제 취소 | 결제창에서 닫기 | `/checkout/fail`로 이동, 주문은 `PENDING` |
| 가상계좌 | 결제수단에서 가상계좌 선택 | `WAITING_FOR_DEPOSIT` → 웹훅 후 `PAID` |
| 금액 위변조 | success URL의 `amount`를 임의 변경 | 승인 거부, `AMOUNT_MISMATCH` |

마지막 항목은 꼭 직접 해볼 것. 이 방어가 결제 연동에서 가장 중요한 부분이다.

## 4-7. 라이브 전환 체크리스트

1. 토스 상점 심사·계약 완료 → 라이브 키 발급
2. `NEXT_PUBLIC_TOSS_CLIENT_KEY`를 `live_ck_...`로 교체 후 **재빌드**
   (런타임 교체로는 안 된다 — 4-4 참고)
3. `TOSS_SECRET_KEY`를 `live_sk_...`로 교체 후 재시작
4. 웹훅 URL을 프로덕션 도메인으로 등록
5. 실제 카드로 소액 결제 1건 → 관리자 화면에서 취소까지 확인
6. 클라이언트 키와 시크릿 키의 **환경이 섞이지 않았는지** 확인
   (test_ck + live_sk 조합은 승인 단계에서 실패한다)

---

# 최종 체크리스트

## 소셜 로그인

- [ ] 카카오: REST API 키 확보, Web 플랫폼 등록, Redirect URI 2개,
      Client Secret **활성화**, 동의항목(닉네임/프로필사진)
- [ ] 카카오: 이메일이 필요하면 비즈니스 앱 전환 (사업자등록번호)
- [ ] 네이버: Client ID/Secret, PC웹 환경 2개(운영/로컬), 제공정보에 **별명** 포함
- [ ] 네이버: **검수 요청** (미리 — 일정의 크리티컬 패스)
- [ ] `AUTH_SECRET`, `AUTH_URL`, `DATABASE_URL` 설정
- [ ] 고객용 로그인 에러 페이지 분리 (현재 관리자 로그인으로 떨어짐)

## 결제

- [ ] `.env.production`에 `NEXT_PUBLIC_TOSS_CLIENT_KEY`, `TOSS_SECRET_KEY` **항목 추가**
- [ ] `DATA_SOURCE=database` 설정 + 상품 가격 입력
- [x] ~~`Dockerfile`에 `NEXT_PUBLIC_*` build arg 추가~~ (적용됨)
- [ ] **빌드 시 `--build-arg`로 값 전달** ← 빠뜨리면 프로덕션에서 결제 UI가 안 뜬다
- [ ] 웹훅 `PAYMENT_STATUS_CHANGED` 등록
- [ ] 금액 위변조 / 새로고침 시나리오 테스트

---

Dockerfile의 build arg는 적용해 두었다. 남은 것은 **빌드 명령에서 실제로 값을
넘기는 것**이다 — 빠뜨리면 기본값인 빈 문자열이 번들에 굳어, "설정을 다 했는데
왜 안 되지"로 나타나 원인 찾기가 까다롭다.
