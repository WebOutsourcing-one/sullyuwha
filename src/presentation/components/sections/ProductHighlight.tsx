import type { Image } from "@/domain/value-objects/Image";
import { formatKrw, isPayableKrw } from "@/domain/value-objects/Money";
import { IconInstagram } from "../ui/Icons";
import { R2Image } from "../ui/R2Image";
import { Reveal } from "../ui/Reveal";

interface ProductHighlightProps {
  /** 대표 문양 클로즈업(있으면 노출) */
  image?: Image;
  price: number;
  instagramUrl?: string;
}

/**
 * 상세 페이지 상단의 대표 문양 클로즈업 + 가격 · 인스타그램 링크.
 * 예전에는 이 자리에 상징 해설 텍스트(제목+본문)가 있었으나,
 * 문의 유도 대신 가격을 바로 보여주고 인스타그램으로 연결하는 쪽으로 바꿨다.
 */
export function ProductHighlight({
  image,
  price,
  instagramUrl,
}: ProductHighlightProps) {
  return (
    <section className="flex flex-col gap-10">
      {image && (
        <Reveal>
          <div className="relative aspect-[16/10] overflow-hidden bg-champagne">
            <R2Image image={image} sizes="(max-width: 672px) 92vw, 672px" />
          </div>
        </Reveal>
      )}

      <Reveal delay={90}>
        <div className="flex flex-col gap-5">
          <span className="block h-px w-10 bg-gold" aria-hidden />
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-charcoal">
              {isPayableKrw(price) ? formatKrw(price) : "가격 문의"}
            </span>
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="설유화 인스타그램"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-charcoal/25 text-charcoal transition-colors duration-300 ease-silk hover:bg-charcoal hover:text-ivory"
              >
                <IconInstagram className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
