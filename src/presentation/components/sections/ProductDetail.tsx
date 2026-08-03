import Link from "next/link";
import type { Product } from "@/domain/entities/Product";
import { formatKrw, isPayableKrw } from "@/domain/value-objects/Money";
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
}

/**
 * 품목 상세 페이지.
 *
 * 위쪽은 구매를 위한 영역(갤러리 + 가격 + CTA), 아래쪽은 디자이너 시안
 * (`public/detail_page.png`) 구조의 에디토리얼 — 상징 해설 → 디테일 → 제품 정보.
 * 시안 콘텐츠(`product.detail`)가 없는 품목은 위쪽 영역만 나가고 아래는 생략된다.
 */
export function ProductDetail({
  product,
  related,
  prev,
  next,
}: ProductDetailProps) {
  // 대표 컷 + 추가 갤러리(사진·GIF)를 하나의 미디어 목록으로 합친다.
  const media = [product.image, ...(product.gallery ?? [])];

  // 가격이 0이면 아직 판매가가 정해지지 않은 품목이다 — 결제로 보내지 않고 문의로 돌린다.
  const purchasable = isPayableKrw(product.price);

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
            href="/#collection"
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
        <Reveal className="flex gap-5 md:gap-7">
          {detail?.tagline && (
            <div className="hidden shrink-0 flex-col items-center gap-4 pt-1 md:flex">
              <span className="font-serif text-sm tracking-[0.35em] text-charcoal [writing-mode:vertical-rl]">
                설유화
              </span>
              <span className="h-px w-5 bg-gold/70" aria-hidden />
              <span className="text-xs leading-loose tracking-[0.18em] text-taupe [writing-mode:vertical-rl]">
                {detail.tagline}
              </span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <ProductGallery images={media} priority />
          </div>
        </Reveal>

        <div className="flex flex-col gap-7 self-start lg:sticky lg:top-28">
          <header className="flex flex-col gap-3">
            <span className="u-label">{product.category}</span>
            <h1
              id="product-title"
              className="text-[clamp(2rem,4.5vw,3.25rem)] font-light"
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
          <div className="flex items-center gap-3" aria-hidden>
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

          <div className="flex flex-col gap-2 border-y border-line py-6">
            <span className="text-sm text-taupe">{product.material}</span>
            <span className="font-serif text-2xl font-light text-charcoal">
              {purchasable ? formatKrw(product.price) : "가격 문의"}
            </span>
          </div>

          {product.tags.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-sm border border-line px-3 py-1 text-xs text-taupe"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-1 flex flex-wrap gap-3">
            {purchasable ? (
              <>
                <Link
                  href={`/checkout/${product.id}`}
                  className="rounded-sm bg-charcoal px-8 py-3.5 text-xs uppercase tracking-[0.12em] text-ivory transition-colors duration-[320ms] ease-silk hover:bg-gold"
                >
                  구매하기
                </Link>
                <Link
                  href="/#contact"
                  className="rounded-sm border border-charcoal px-8 py-3.5 text-xs uppercase tracking-[0.12em] text-charcoal transition-colors duration-[320ms] ease-silk hover:bg-charcoal hover:text-ivory"
                >
                  맞춤 문의
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/#contact"
                  className="rounded-sm bg-charcoal px-8 py-3.5 text-xs uppercase tracking-[0.12em] text-ivory transition-colors duration-[320ms] ease-silk hover:bg-gold"
                >
                  구매 · 입점 문의
                </Link>
                <Link
                  href="/#collection"
                  className="rounded-sm border border-charcoal px-8 py-3.5 text-xs uppercase tracking-[0.12em] text-charcoal transition-colors duration-[320ms] ease-silk hover:bg-charcoal hover:text-ivory"
                >
                  컬렉션 전체 보기
                </Link>
              </>
            )}
          </div>
        </div>
      </Container>

      {/* 상징 해설 — 대표 문양 클로즈업 */}
      {detail?.highlight && <ProductHighlight block={detail.highlight} />}

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
