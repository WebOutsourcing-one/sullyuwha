import type { GalleryItem } from "@/domain/entities/GalleryItem";
import { Container } from "../ui/Container";
import { R2Image } from "../ui/R2Image";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

interface GallerySectionProps {
  items: readonly GalleryItem[];
}

export function GallerySection({ items }: GallerySectionProps) {
  return (
    <section
      id="gallery"
      className="u-section bg-hanji"
      aria-labelledby="gallery-title"
    >
      <Container>
        <SectionHeading
          eyebrow="景 · 갤러리"
          title="옷이 머무는 자리"
          titleId="gallery-title"
        />

        {/* CSS 컬럼 메이슨리 — 이미지 비율에 따라 높이가 흐른다 */}
        <div className="mt-12 columns-2 gap-4 md:columns-3 lg:columns-4">
          {items.map((item, i) => (
            <Reveal
              key={item.id}
              className="mb-4 break-inside-avoid"
              delay={(i % 4) * 70}
            >
              <figure className="group relative overflow-hidden rounded-sm border border-line">
                <div
                  className="relative w-full"
                  style={{ aspectRatio: item.image.aspectRatio ?? 1 }}
                >
                  <R2Image
                    image={item.image}
                    sizes="(max-width: 768px) 45vw, (max-width: 1024px) 30vw, 22vw"
                    className="transition-transform duration-500 ease-hanok group-hover:scale-[1.05]"
                  />
                </div>
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-meok/75 to-transparent p-3 text-sm text-hanji opacity-0 transition-opacity duration-300 group-hover:opacity-100">
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
