import type { Product } from "@/domain/entities/Product";
import { BranchMotif } from "../ui/BranchMotif";
import { Container } from "../ui/Container";
import { ProductCard } from "../ui/ProductCard";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

interface CollectionSectionProps {
  products: readonly Product[];
}

export function CollectionSection({ products }: CollectionSectionProps) {
  return (
    <section
      id="collection"
      className="relative overflow-hidden u-section bg-mist"
      aria-labelledby="collection-title"
    >
      <BranchMotif
        className="bottom-[-6%] left-[-8%] h-[64%] w-[52%]"
        position="bottom left"
        opacity={0.09}
        flip
      />
      <Container className="relative z-10">
        <SectionHeading
          eyebrow="COLLECTION"
          title="매일의 실크"
          titleId="collection-title"
          subcopy="블라우스부터 라운지웨어까지, 부담 없이 입는 실크 라인업."
        />

        <ul className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, i) => (
            <li key={product.id}>
              <Reveal delay={(i % 3) * 90}>
                <ProductCard product={product} />
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
