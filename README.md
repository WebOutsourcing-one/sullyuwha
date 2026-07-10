# 수려화 (sullyuwha)

전통 한복 브랜드 **수려화(秀麗花)** 홍보 페이지.
백엔드 없이 **프론트(Next.js) + 파일서버(Cloudflare R2)** 만으로 동작하며,
**클린 아키텍처**로 계층을 분리했다. 한옥 컨셉 디자인은 [`design.md`](./design.md) 참고.

## 스택

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** (`@theme` 디자인 토큰)
- **Cloudflare R2** 공개 버킷 + 커스텀 도메인 (이미지/에셋 서빙)
- 한글 조판: `word-break: keep-all` 전역 적용, 반응형(모바일 퍼스트), 다국어 미지원

## 시작하기

```bash
bun install
bun run dev        # http://localhost:3000
```

R2를 아직 연결하지 않아도 **한지 톤 플레이스홀더**로 전체 레이아웃이 렌더링된다.

## Cloudflare R2 연동

1. R2 버킷을 만들고 **공개 접근(Public Development URL 또는 커스텀 도메인)** 을 켠다.
2. `.env.local` 에 베이스 URL을 넣는다(끝 슬래시 없이):

   ```bash
   NEXT_PUBLIC_ASSET_BASE_URL=https://assets.sullyuwha.com
   ```

3. 버킷에 아래 **키 구조(확장자 `.jpg`)** 로 이미지를 업로드한다:

   ```
   hero/main.jpg
   story/atelier.jpg
   collection/{dangui,hwarot,cheollik,jeogori,dopo,norigae}.jpg
   craft/{select,cut,sew,finish}.jpg
   gallery/01.jpg … gallery/08.jpg
   contact/map.jpg
   ```

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
│  ├─ entities/             #   HeroContent, BrandStory, HanbokProduct, CraftStep, GalleryItem, ContactInfo
│  ├─ value-objects/        #   AssetKey, Image
│  └─ repositories/         #   ProductRepository, GalleryRepository, BrandContentRepository (계약)
├─ application/             # 유스케이스 (도메인에만 의존)
│  └─ use-cases/            #   GetHeroContent, GetHanbokCollection, GetCraftProcess, …
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

### 콘텐츠 · 디자인 수정 지점

- **문구/제품/갤러리 등 콘텐츠**: `src/infrastructure/data/*.data.ts`
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
