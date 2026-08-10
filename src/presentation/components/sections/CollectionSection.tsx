import Link from "next/link";
import type { Product } from "@/domain/entities/Product";
import { bestByCategory, latestByCategory, thumbnailOf } from "@/domain/entities/Product";
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
  // 카드에 걸 컷은 그 분류의 최신 상품에서 가져온다 — 카테고리용 이미지를
  // 따로 올리고 관리하지 않아도 컬렉션이 항상 최근 작업을 비춘다.
  // 상품이 아직 없는 분류만 미리 넣어둔 카테고리 이미지로 남는다.
  const latest = latestByCategory(products);

  // 지정 순서가 아니라 위 카드와 같은 순서로 늘어놓는다.
  const best = bestByCategory(
    products,
    categories.map((c) => c.title),
  );

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
          {categories.map((c, i) => {
            // 이 분류의 최신 상품. 없으면 미리 넣어둔 카테고리 이미지와 링크로 돌아간다
            // — 상품을 아직 안 올린 분류에서 카드가 빈 채로 남지 않게 한다.
            const newest = latest.get(c.title);
            const href = newest ? `/collection/${newest.id}` : c.href;

            return (
              <li key={c.id}>
                <Reveal delay={(i % 4) * 80}>
                  <Link
                    href={href}
                    className="group relative block overflow-hidden"
                    aria-label={
                      newest ? `${c.title} 최신 상품 ${newest.name} 보기` : `${c.title} 보기`
                    }
                  >
                    <div className="relative aspect-[3/4] bg-sand">
                      <R2Image
                        image={newest ? thumbnailOf(newest) : c.image}
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
                  </Link>
                </Reveal>
              </li>
            );
          })}
        </ul>

        {/* BEST COLLECTION — 관리자가 분류마다 하나씩 골라 둔 것만 나온다.
            하나도 지정하지 않았으면 제목만 덩그러니 남지 않도록 통째로 접는다. */}
        <div className="mt-24">
          {best.length > 0 && (
            <>
              <div className="flex flex-col items-center gap-3">
                <span className="h-px w-6 bg-gold" aria-hidden />
                <span className="u-label">Best Collection</span>
              </div>

              <ul
                className={`mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 ${
                  best.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
                }`}
              >
                {best.map((p, i) => (
                  <li key={p.id}>
                    <Reveal delay={(i % 4) * 90}>
                      <ProductCard
                        product={p}
                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 24vw"
                      />
                    </Reveal>
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="mt-16 flex justify-center">
            <Link
              href="/collection"
              className="group inline-flex items-center gap-3 rounded-sm border border-charcoal/25 px-8 py-3.5 text-xs uppercase tracking-[0.16em] text-charcoal transition-colors duration-300 ease-silk hover:bg-charcoal hover:text-ivory"
            >
              전체 컬렉션 보기
              <IconArrow className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
