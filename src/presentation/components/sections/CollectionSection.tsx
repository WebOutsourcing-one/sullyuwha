import type { Product } from "@/domain/entities/Product";
import type { Category } from "@/domain/entities/Category";
import { Container } from "../ui/Container";
import { ProductCard } from "../ui/ProductCard";
import { R2Image } from "../ui/R2Image";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";
import { IconArrow } from "../ui/Icons";

interface CollectionSectionProps {
  products: readonly Product[];
  categories: readonly Category[];
}

/** COLLECTION — 카테고리 그리드 + BEST COLLECTION. */
export function CollectionSection({
  products,
  categories,
}: CollectionSectionProps) {
  const best = products.slice(0, 3);

  return (
    <section
      id="collection"
      className="u-section bg-ivory"
      aria-labelledby="collection-title"
    >
      <Container>
        <SectionHeading
          eyebrow="COLLECTION"
          title="예복 컬렉션"
          titleId="collection-title"
          subcopy="설유화의 컬렉션을 소개합니다."
        />

        {/* 카테고리 그리드 */}
        <ul className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
          {categories.map((c, i) => (
            <li key={c.id}>
              <Reveal delay={(i % 4) * 80}>
                <a
                  href={c.href}
                  className="group relative block overflow-hidden"
                  aria-label={`${c.title} 보기`}
                >
                  <div className="relative aspect-[3/4] bg-sand">
                    <R2Image
                      image={c.image}
                      sizes="(max-width: 1024px) 45vw, 22vw"
                      className="transition-transform duration-[600ms] ease-silk group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/55 via-charcoal/5 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-1 p-5 text-center text-ivory">
                      <span className="text-[0.62rem] uppercase tracking-[0.24em] text-ivory/85">
                        {c.labelEn}
                      </span>
                      <span className="font-serif text-lg font-light">
                        {c.title}
                      </span>
                    </div>
                  </div>
                </a>
              </Reveal>
            </li>
          ))}
        </ul>

        {/* BEST COLLECTION */}
        <div className="mt-24">
          <div className="flex flex-col items-center gap-3">
            <span className="h-px w-6 bg-gold" aria-hidden />
            <span className="u-label">Best Collection</span>
          </div>

          <ul className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {best.map((p, i) => (
              <li key={p.id}>
                <Reveal delay={(i % 3) * 90}>
                  <ProductCard product={p} />
                </Reveal>
              </li>
            ))}
          </ul>

          <div className="mt-16 flex justify-center">
            <a
              href="#collection"
              className="group inline-flex items-center gap-3 rounded-sm border border-charcoal/25 px-8 py-3.5 text-xs uppercase tracking-[0.16em] text-charcoal transition-colors duration-300 ease-silk hover:bg-charcoal hover:text-ivory"
            >
              전체 컬렉션 보기
              <IconArrow className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
