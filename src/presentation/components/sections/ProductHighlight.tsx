import type { ProductDetailBlock } from "@/domain/entities/Product";
import { R2Image } from "../ui/R2Image";
import { Reveal } from "../ui/Reveal";

interface ProductHighlightProps {
  block: ProductDetailBlock;
}

/**
 * 상세 페이지 상단의 상징 해설 블록 —
 * 대표 문양을 클로즈업으로 보여주고 그 의미를 풀어낸다.
 * (시안: 봉황문 자수 클로즈업 + "봉황, 고귀함과 영원의 상징")
 */
export function ProductHighlight({ block }: ProductHighlightProps) {
  return (
    <section
      className="flex flex-col gap-10"
      aria-labelledby="product-highlight-title"
    >
      {block.image && (
        <Reveal>
          <div className="relative aspect-[16/10] overflow-hidden bg-champagne">
            <R2Image
              image={block.image}
              sizes="(max-width: 672px) 92vw, 672px"
            />
          </div>
        </Reveal>
      )}

      <Reveal delay={90}>
        <div className="flex flex-col gap-5">
          <span className="block h-px w-10 bg-gold" aria-hidden />
          <h2
            id="product-highlight-title"
            className="text-[clamp(1.5rem,3vw,2.25rem)] font-light"
          >
            {block.title}
          </h2>
          <p className="text-[clamp(0.95rem,1.05vw,1.0625rem)] leading-[1.9] text-taupe">
            {block.body}
          </p>
        </div>
      </Reveal>
    </section>
  );
}
