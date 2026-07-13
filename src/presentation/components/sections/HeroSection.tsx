import type { HeroContent } from "@/domain/entities/HeroContent";
import { Container } from "../ui/Container";
import { R2Image } from "../ui/R2Image";
import { Reveal } from "../ui/Reveal";

interface HeroSectionProps {
  hero: HeroContent;
}

export function HeroSection({ hero }: HeroSectionProps) {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-charcoal text-ivory"
      aria-label="설유화 소개"
    >
      <Container>
        <div className="grid items-center gap-12 py-24 md:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:py-36">
          {/* 텍스트 */}
          <Reveal className="order-2 lg:order-1">
            <div className="flex flex-col items-start gap-7">
              <span className="u-label">{hero.eyebrow}</span>

              <h1 className="whitespace-pre-line font-serif text-[clamp(2.75rem,7vw,5.5rem)] font-light leading-[1.08] text-ivory">
                {hero.slogan}
              </h1>

              <p className="max-w-md text-[clamp(0.95rem,1.05vw,1.0625rem)] leading-relaxed text-ivory/70">
                {hero.subcopy}
              </p>

              <div className="mt-3 flex flex-wrap gap-3">
                <a
                  href={hero.primaryCta.href}
                  className="inline-flex items-center rounded-sm bg-ivory px-8 py-3.5 text-xs uppercase tracking-[0.12em] text-charcoal transition-colors duration-300 ease-silk hover:bg-gold hover:text-ivory"
                >
                  {hero.primaryCta.label}
                </a>
                <a
                  href={hero.secondaryCta.href}
                  className="inline-flex items-center rounded-sm border border-ivory/35 px-8 py-3.5 text-xs uppercase tracking-[0.12em] text-ivory transition-colors duration-300 ease-silk hover:border-ivory hover:bg-ivory hover:text-charcoal"
                >
                  {hero.secondaryCta.label}
                </a>
              </div>
            </div>
          </Reveal>

          {/* 대표 룩 이미지 */}
          <Reveal className="order-1 lg:order-2" delay={120}>
            <div className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden lg:max-w-none">
              <R2Image
                image={hero.image}
                priority
                sizes="(max-width: 1024px) 90vw, 48vw"
              />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
