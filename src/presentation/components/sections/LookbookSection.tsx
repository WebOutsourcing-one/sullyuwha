import type { GalleryItem } from "@/domain/entities/GalleryItem";
import { Container } from "../ui/Container";
import { R2Image } from "../ui/R2Image";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

interface LookbookSectionProps {
  items: readonly GalleryItem[];
}

export function LookbookSection({ items }: LookbookSectionProps) {
  return (
    <section
      id="lookbook"
      className="u-section bg-ivory"
      aria-labelledby="lookbook-title"
    >
      <Container>
        <SectionHeading
          eyebrow="LOOKBOOK"
          title="실크가 머무는 순간"
          titleId="lookbook-title"
        />

        {/* CSS 컬럼 메이슨리 — 이미지 비율에 따라 높이가 흐른다 */}
        <div className="mt-16 columns-2 gap-4 md:columns-3 lg:columns-4">
          {items.map((item, i) => (
            <Reveal
              key={item.id}
              className="mb-4 break-inside-avoid"
              delay={(i % 4) * 70}
            >
              <figure className="group relative overflow-hidden">
                <div
                  className="relative w-full overflow-hidden"
                  style={{ aspectRatio: item.image.aspectRatio ?? 1 }}
                >
                  <R2Image
                    image={item.image}
                    sizes="(max-width: 768px) 45vw, (max-width: 1024px) 30vw, 22vw"
                    className="transition-transform duration-[600ms] ease-silk group-hover:scale-[1.04]"
                  />
                </div>
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/70 to-transparent p-4 text-xs uppercase tracking-[0.14em] text-ivory opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {item.caption}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
