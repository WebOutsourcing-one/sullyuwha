import Link from "next/link";
import type { Product } from "@/domain/entities/Product";
import { Container } from "../ui/Container";
import { ProductCard } from "../ui/ProductCard";
import { ProductGallery } from "../ui/ProductGallery";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

interface ProductDetailProps {
  product: Product;
  /** 하단 추천 — 현재 품목을 제외한 다른 컬렉션 */
  related: readonly Product[];
  /** 목록 순서상 이전/다음 품목(끝이면 null) */
  prev: Product | null;
  next: Product | null;
}

export function ProductDetail({
  product,
  related,
  prev,
  next,
}: ProductDetailProps) {
  // 대표 컷 + 추가 갤러리(사진·GIF)를 하나의 미디어 목록으로 합친다.
  const media = [product.image, ...(product.gallery ?? [])];

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
      <Container className="grid gap-10 pb-20 pt-6 md:pb-28 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <ProductGallery images={media} priority />
        </Reveal>

        <div className="flex flex-col gap-7 self-start lg:sticky lg:top-28">
          <header className="flex flex-col gap-4">
            <span className="u-label">{product.category}</span>
            <h1
              id="product-title"
              className="text-[clamp(2rem,4.5vw,3.25rem)] font-light"
            >
              {product.name}
            </h1>
            <span className="text-sm text-taupe">{product.material}</span>
          </header>

          <span className="block h-px w-10 bg-gold" aria-hidden />

          <p className="text-[clamp(1rem,1.1vw,1.125rem)] leading-relaxed text-charcoal/85">
            {product.description}
          </p>

          {product.story && (
            <p className="leading-relaxed text-taupe">{product.story}</p>
          )}

          {product.specs && product.specs.length > 0 && (
            <dl className="mt-1 flex flex-col divide-y divide-line border-y border-line">
              {product.specs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex items-baseline gap-4 py-3"
                >
                  <dt className="w-24 shrink-0 text-xs uppercase tracking-[0.1em] text-gold">
                    {spec.label}
                  </dt>
                  <dd className="text-sm text-charcoal">{spec.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {product.care && product.care.length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="text-xs uppercase tracking-[0.1em] text-gold">
                관리
              </span>
              <ul className="flex flex-col gap-1.5">
                {product.care.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2.5 text-sm leading-relaxed text-taupe"
                  >
                    <span aria-hidden className="mt-2 h-px w-2.5 shrink-0 bg-gold/60" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.tags.length > 0 && (
            <ul className="flex flex-wrap gap-2 pt-1">
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

          <div className="mt-2 flex flex-wrap gap-3">
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
          </div>
        </div>
      </Container>

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
