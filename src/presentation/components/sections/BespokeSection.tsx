import type { BespokeContent } from "@/domain/entities/BespokeContent";
import { Container } from "../ui/Container";
import { R2Image } from "../ui/R2Image";
import { Reveal } from "../ui/Reveal";
import { IconArrow } from "../ui/Icons";

interface BespokeSectionProps {
  bespoke: BespokeContent;
}

/** BESPOKE — 당신만을 위한 단 하나의 예복. */
export function BespokeSection({ bespoke }: BespokeSectionProps) {
  return (
    <section
      id="bespoke"
      className="u-section bg-champagne"
      aria-labelledby="bespoke-title"
    >
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
          {/* 자수 이미지 */}
          <Reveal>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden bg-sand lg:max-w-none">
              <R2Image
                image={bespoke.image}
                sizes="(max-width: 1024px) 90vw, 45vw"
              />
            </div>
          </Reveal>

          {/* 텍스트 */}
          <Reveal delay={100}>
            <div className="flex flex-col items-start gap-6">
              <div className="flex items-center gap-3">
                <span className="h-px w-6 bg-gold" aria-hidden />
                <span className="u-label">{bespoke.eyebrow}</span>
              </div>

              <h2
                id="bespoke-title"
                className="whitespace-pre-line font-serif text-[clamp(1.9rem,4vw,3.1rem)] font-light leading-[1.25] text-charcoal"
              >
                {bespoke.title}
              </h2>

              <div className="flex flex-col gap-4 text-taupe">
                {bespoke.paragraphs.map((p, i) => (
                  <p key={i} className="max-w-md leading-[1.9]">
                    {p}
                  </p>
                ))}
              </div>

              <a
                href={bespoke.cta.href}
                className="group mt-3 inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-charcoal"
              >
                <span className="border-b border-charcoal/40 pb-1 transition-colors duration-300 group-hover:border-charcoal">
                  {bespoke.cta.label}
                </span>
                <IconArrow className="h-4 w-4 transition-transform duration-300 ease-silk group-hover:translate-x-1" />
              </a>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
