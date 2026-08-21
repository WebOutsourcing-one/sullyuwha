import Link from "next/link";
import type { Product } from "@/domain/entities/Product";

import { Container } from "../ui/Container";
import { ProductCard } from "../ui/ProductCard";
import { ProductGallery } from "../ui/ProductGallery";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";
import { ProductFeatures } from "./ProductFeatures";
import { ProductHighlight } from "./ProductHighlight";
import { ProductInfo } from "./ProductInfo";

interface ProductDetailProps {
  product: Product;
  /** 하단 추천 — 현재 품목을 제외한 다른 컬렉션 */
  related: readonly Product[];
  /** 목록 순서상 이전/다음 품목(끝이면 null) */
  prev: Product | null;
  next: Product | null;
  /** 가격 옆 인스타그램 링크 버튼용 */
  instagramUrl?: string;
}

/**
 * 품목 상세 페이지.
 *
 * 위쪽은 갤러리와 품목 소개(+ 가격·인스타그램), 아래쪽은 디자이너 시안 구조의
 * 에디토리얼 — 대표 문양 클로즈업 → 디테일 → 제품 정보.
 * 시안 콘텐츠(`product.detail`)가 없는 품목은 위쪽 영역만 나가고 아래는 생략된다.
 *
 * 구매 CTA(장바구니·결제 버튼)는 두지 않는다 — 결제를 열지 않은 단계라 인스타그램
 * DM 문의로 받는다. 결제를 여는 시점에 `/checkout/[id]` 링크를 되살리면 된다.
 * (결제 코드 자체는 그대로 살아 있다: /checkout, /api/orders, 승인·웹훅)
 */
export function ProductDetail({
  product,
  related,
  prev,
  next,
  instagramUrl,
}: ProductDetailProps) {
  // 대표 컷 + 추가 갤러리(사진·GIF)를 하나의 미디어 목록으로 합친다.
  const media = [product.image, ...(product.gallery ?? [])];

  const detail = product.detail;
  // 상징 해설 블록이 있으면 story는 그 본문과 겹치므로 위쪽에서 다시 쓰지 않는다.
  const showStory = Boolean(product.story) && !detail?.highlight;

  return (
    <article aria-labelledby="product-title">
      {/* 브레드크럼 */}
      <Container>
        <nav
          className="flex items-center gap-2 pt-10 text-xs text-taupe md:pt-14"
          aria-label="위치"
        >
          <Link href="/" className="transition-colors hover:text-charcoal">
            홈
          </Link>
          <span aria-hidden className="text-line">
            /
          </span>
          <Link
            href="/collection"
            className="transition-colors hover:text-charcoal"
          >
            컬렉션
          </Link>
          <span aria-hidden className="text-line">
            /
          </span>
          <span className="text-charcoal/70">{product.category}</span>
        </nav>
      </Container>

      {/* 본문 — 이미지 + 정보 */}
      <Container className="grid gap-10 pb-16 pt-6 md:pb-20 lg:grid-cols-2 lg:gap-16">
        <Reveal className="relative">
          {detail?.tagline && (
            <div className="absolute left-4 top-6 z-10 flex flex-col items-center gap-3">
              <span className="font-serif text-sm tracking-[0.35em] text-charcoal [writing-mode:vertical-rl]">
                설유화
              </span>
              <span className="h-px w-5 bg-gold/70" aria-hidden />
              <span className="text-xs leading-loose tracking-[0.18em] text-taupe [writing-mode:vertical-rl]">
                {detail.tagline}
              </span>
            </div>
          )}
          <ProductGallery images={media} priority />
        </Reveal>

        <div className="flex flex-col gap-5 self-start lg:sticky lg:top-28">
          <header className="flex flex-col gap-1">
            <span className="u-label">{product.category}</span>
            <h1
              id="product-title"
              className="text-[clamp(1.875rem,4.5vw,3.125rem)] font-light"
            >
              {product.name}
            </h1>
            {detail?.subtitle && (
              <p className="font-serif text-[clamp(1.05rem,1.8vw,1.4rem)] font-light tracking-[0.12em] text-taupe">
                {detail.subtitle}
              </p>
            )}
          </header>

          {/* 마름모 구분 장식 */}
          <div className="-my-3 flex items-center gap-3" aria-hidden>
            <span className="h-px w-10 bg-gold" />
            <span className="h-1.5 w-1.5 rotate-45 border border-gold" />
            <span className="h-px flex-1 bg-line" />
          </div>

          {/* 시안의 도입부가 있으면 그것을, 없으면 카드용 소개를 쓴다. */}
          <p className="whitespace-pre-line text-[clamp(1rem,1.1vw,1.125rem)] leading-[1.9] text-charcoal/85">
            {detail?.intro ?? product.description}
          </p>

          {showStory && (
            <p className="leading-relaxed text-taupe">{product.story}</p>
          )}

          {/* 대표 문양 클로즈업 + 가격 · 인스타그램 */}
          <ProductHighlight
            image={detail?.highlight?.image}
            price={product.price}
            instagramUrl={instagramUrl}
          />
        </div>
      </Container>

      {/* 디테일 — 자수·소재·안감 */}
      {detail?.features && detail.features.length > 0 && (
        <ProductFeatures blocks={detail.features} />
      )}

      {/* 제품 정보 + 모델 컷 */}
      <ProductInfo
        specs={product.specs}
        care={product.care}
        notes={detail?.notes}
        modelShots={detail?.modelShots}
      />

      {/* 이전 / 다음 */}
      {(prev || next) && (
        <Container>
          <nav
            className="flex items-stretch justify-between gap-4 border-t border-line py-8"
            aria-label="다른 품목 이동"
          >
            {prev ? (
              <Link
                href={`/collection/${prev.id}`}
                className="group flex flex-col gap-1 text-left"
              >
                <span className="text-[0.7rem] uppercase tracking-[0.18em] text-gold">
                  이전
                </span>
                <span className="text-sm text-taupe transition-colors group-hover:text-charcoal">
                  ← {prev.name}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/collection/${next.id}`}
                className="group flex flex-col gap-1 text-right"
              >
                <span className="text-[0.7rem] uppercase tracking-[0.18em] text-gold">
                  다음
                </span>
                <span className="text-sm text-taupe transition-colors group-hover:text-charcoal">
                  {next.name} →
                </span>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </Container>
      )}

      {/* 다른 제품 */}
      {related.length > 0 && (
        <section
          className="u-section bg-mist"
          aria-labelledby="related-title"
        >
          <Container>
            <SectionHeading
              eyebrow="MORE"
              title="다른 제품"
              titleId="related-title"
            />
            <ul className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {related.slice(0, 3).map((item, i) => (
                <li key={item.id}>
                  <Reveal delay={(i % 3) * 90}>
                    <ProductCard product={item} />
                  </Reveal>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
    </article>
  );
}
