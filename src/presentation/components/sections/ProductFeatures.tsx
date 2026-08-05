import type { ProductDetailBlock } from "@/domain/entities/Product";
import { Container } from "../ui/Container";
import { R2Image } from "../ui/R2Image";
import { Reveal } from "../ui/Reveal";

interface ProductFeaturesProps {
  /** `null`은 관리자가 비워둔 자리다. 자리를 유지하려고 빈 칸으로 렌더한다. */
  blocks: readonly (ProductDetailBlock | null)[];
}

/**
 * 상세 페이지 중단의 디테일 블록 —
 * 자수·소재·안감처럼 가까이서 봐야 보이는 요소를 한 줄에 나눠 보여준다.
 * (시안: 정교한 수복문 자수 · 부금 봉황문 자수 · 명주 안감)
 */
export function ProductFeatures({ blocks }: ProductFeaturesProps) {
  return (
    <section
      className="border-t border-line bg-mist py-16 md:py-24"
      aria-labelledby="product-features-title"
    >
      <Container>
        <h2 id="product-features-title" className="sr-only">
          제품 디테일
        </h2>
        <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {blocks.map((block, i) =>
            // 비워둔 자리. 그리드 칸만 차지하고 아무것도 그리지 않는다 —
            // 뒤 블록이 앞으로 당겨지지 않게 하는 것이 목적이다.
            block === null ? (
              <li key={`empty-${i}`} aria-hidden />
            ) : (
              // 소제목이 비어 있을 수 있어(이미지만 채운 블록) 인덱스를 키로 쓴다.
              <li key={i}>
                <Reveal delay={(i % 3) * 90}>
                  <article className="flex flex-col gap-5">
                    {block.image && (
                      <div className="relative aspect-[4/3] overflow-hidden bg-champagne">
                        <R2Image
                          image={block.image}
                          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
                        />
                      </div>
                    )}
                    {(block.title || block.body) && (
                      <div className="flex flex-col gap-3">
                        {block.title && (
                          <h3 className="text-[clamp(1.15rem,2vw,1.5rem)] font-light">
                            {block.title}
                          </h3>
                        )}
                        {block.body && (
                          <p className="text-[0.95rem] leading-[1.9] text-taupe">
                            {block.body}
                          </p>
                        )}
                      </div>
                    )}
                  </article>
                </Reveal>
              </li>
            ),
          )}
        </ul>
      </Container>
    </section>
  );
}
