# 설유화 (sullyuwha)

전통의 아름다움 위에 현대의 감각을 더해 단 하나의 예복을 짓는
한복 예복·맞춤(비스포크) 브랜드 **설유화(Sullyuwha)** 홍보 페이지.
백엔드 없이 **프론트(Next.js) + 파일서버(Cloudflare R2)** 만으로 동작하며,
**클린 아키텍처**로 계층을 분리했다. 디자인 시스템(크림 톤 · 부조 모티프)은 [`design.md`](./design.md) 참고.

## 스택

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** (`@theme` 디자인 토큰)
- **Cloudflare R2** 공개 버킷 + 커스텀 도메인 (이미지/에셋 서빙)
- 한글 조판: `word-break: keep-all` 전역 적용, 반응형(모바일 퍼스트), 다국어 미지원

## 시작하기

DB 없이 화면만 볼 때는 이것으로 충분하다. 정적 데이터로 렌더된다.

```bash
bun install
bun run dev        # http://localhost:5001
```

관리자 화면에서 등록한 상품까지 보려면 DB를 붙인다.

```bash
# .env 를 만들고 (git에 올라가지 않는다)
#   POSTGRES_PORT=5432                 # 이미 쓰는 포트면 비어 있는 번호로
#   DATABASE_URL=postgresql://sullyuwha:sullyuwha_local@localhost:5432/sullyuwha
#
# .env.local 에는 로그인용 값을 넣는다
#   AUTH_SECRET=<openssl rand -base64 32>
#   AUTH_ADMIN_EMAIL=admin@sullyuwha.local
#   AUTH_ADMIN_PASSWORD=<원하는 비밀번호>

bun run db:up          # postgres + minio (docker)
bun run db:migrate     # 스키마 반영
bun run db:seed        # 브랜드 콘텐츠·샘플 상품
bun run dev            # http://localhost:5001  → /sull-admin 으로 로그인
```

`DATABASE_URL` 이 있으면 상품·콘텐츠를 DB에서 읽고, 없으면 정적 데이터를 쓴다.
`DATA_SOURCE=static` 으로 강제할 수도 있다.

`DATABASE_URL` 을 `.env.local` 이 아니라 `.env` 에 두는 이유 — prisma CLI는
`prisma.config.ts` 의 `dotenv/config` 를 거치는데 그건 `.env` 만 읽는다.
`.env` 는 Next와 docker compose도 함께 읽어서 세 곳이 같은 값을 본다.

R2/S3를 아직 연결하지 않아도 **브랜드 엠블럼 플레이스홀더**로 전체 레이아웃이 렌더링된다.

## Cloudflare R2 연동

1. R2 버킷을 만들고 **공개 접근(Public Development URL 또는 커스텀 도메인)** 을 켠다.
2. `.env.local` 에 베이스 URL을 넣는다(끝 슬래시 없이):

   ```bash
   NEXT_PUBLIC_ASSET_BASE_URL=https://assets.sullyuwha.com
   ```

3. 버킷에 아래 **키 구조(확장자 `.jpg`)** 로 이미지를 업로드한다:

   ```
   hero/main.jpg                                                        # 히어로 우측 한복 포트레이트
   about/portrait.jpg
   collection/{women,men,bespoke,accessories}.jpg                       # 카테고리 그리드
   collection/{dangui-subok,seuran-skirt,mokhwa-dangui,durumagi}.jpg    # BEST · 상세
   bespoke/atelier.jpg
   contact/atelier.jpg
   ```

   > 문의 명함 이미지는 R2가 아닌 로컬 `public/*` 에셋(설유화 꽃가지)을 사용한다.

   키는 각 데이터 파일(`src/infrastructure/data/*.data.ts`)의 `image("…")` 값과 일치해야 한다.

- `next.config.ts` 가 `NEXT_PUBLIC_ASSET_BASE_URL` 의 호스트를 `images.remotePatterns` 에
  자동 등록하므로 `next/image` 최적화가 그대로 적용된다.
- 확장자가 `.png` 등으로 다르면 `R2AssetResolver` 의 기본 확장자 또는 `resolve(key, "png")` 를 조정한다.

## 클린 아키텍처 구조

의존성 방향: **presentation → application → domain ← infrastructure**
도메인은 아무것에도 의존하지 않는다. 저장소 구현을 바꿔도(정적 → CMS/파일서버) 상위 계층은 불변.

```
src/
├─ domain/                  # 엔티티 · 값 객체 · 리포지토리 인터페이스 (의존성 0)
│  ├─ entities/             #   HeroContent, BrandStory, Product, SilkFeature, GalleryItem, ContactInfo
│  ├─ value-objects/        #   AssetKey, Image
│  └─ repositories/         #   ProductRepository, GalleryRepository, BrandContentRepository (계약)
├─ application/             # 유스케이스 (도메인에만 의존)
│  └─ use-cases/            #   GetHeroContent, GetCollection, GetSilkFeatures, GetGallery, …
├─ infrastructure/          # 구현체 (도메인 계약 구현)
│  ├─ config/               #   env 로드
│  ├─ assets/               #   R2AssetResolver (AssetKey → 공개 URL)
│  ├─ data/                 #   정적 콘텐츠 데이터 (수정 지점)
│  └─ repositories/         #   Static*Repository
├─ composition/             # 조립 루트(DI) — container.ts, assets.ts
├─ presentation/            # UI (Next와 무관한 React 컴포넌트)
│  └─ components/{ui,layout,sections}
└─ app/                     # Next.js App Router (layout, page, globals.css)
```

### 페이지 섹션

Hero → 브랜드 특징(4가치) → About → 컬렉션(카테고리 + BEST) → 맞춤(Bespoke) → 제작 과정(Process) → 문의 → 푸터.

### 콘텐츠 · 디자인 수정 지점

- **문구/상품/룩북 등 콘텐츠**: `src/infrastructure/data/*.data.ts`
- **색·서체·여백 토큰**: `src/app/globals.css` 의 `@theme` 블록 (근거: `design.md`)
- **섹션 레이아웃**: `src/presentation/components/sections/*`
- **저장소 교체**(정적 → API/CMS): `src/infrastructure/repositories/*` 구현 후 `src/composition/container.ts` 배선만 변경

## 스크립트

```bash
bun run dev      # 개발 서버
bun run build    # 프로덕션 빌드
bun run start    # 빌드 결과 실행
bun run lint     # ESLint
```
