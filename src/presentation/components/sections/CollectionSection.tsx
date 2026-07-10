import type { HanbokProduct } from "@/domain/entities/HanbokProduct";
import { Container } from "../ui/Container";
import { R2Image } from "../ui/R2Image";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

interface CollectionSectionProps {
  products: readonly HanbokProduct[];
}

export function CollectionSection({ products }: CollectionSectionProps) {
  return (
    <section
      id="collection"
      className="u-section bg-hanji-deep"
      aria-labelledby="collection-title"
    >
      <Container>
        <SectionHeading
          eyebrow="衣 · 컬렉션"
          title="오늘을 입는 우리 옷"
          titleId="collection-title"
        />

        <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, i) => (
            <li key={product.id}>
              <Reveal delay={(i % 3) * 90}>
                <article className="group flex h-full flex-col overflow-hidden rounded-sm border border-line bg-hanji transition-transform duration-300 ease-hanok hover:-translate-y-1">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <R2Image
                      image={product.image}
                      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                      className="transition-transform duration-500 ease-hanok group-hover:scale-[1.04]"
                    />
                    <span className="absolute left-3 top-3 rounded-sm bg-meok/85 px-2.5 py-1 text-xs text-hanji">
                      {product.category}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-xl text-meok">{product.name}</h3>
                      {product.hanja && (
                        <span className="text-sm text-hwangto">
                          {product.hanja}
                        </span>
                      )}
                    </div>

                    <p className="flex-1 text-sm leading-relaxed text-meok-soft">
                      {product.description}
                    </p>

                    <ul className="flex flex-wrap gap-2 pt-1">
                      {product.tags.map((tag) => (
                        <li
                          key={tag}
                          className="rounded-sm border border-line px-2.5 py-1 text-xs text-meok-soft"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
