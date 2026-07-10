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
      className="relative overflow-hidden bg-meok text-hanji"
      aria-label="설유화 소개"
    >
      {/* 창살 격자 배경 */}
      <div
        className="u-lattice pointer-events-none absolute inset-0 opacity-[0.05]"
        aria-hidden
      />

      <Container>
        <div className="grid items-center gap-12 py-20 md:py-24 lg:grid-cols-2 lg:gap-16 lg:py-28">
          {/* 텍스트 */}
          <Reveal className="order-2 lg:order-1">
            <div className="flex flex-col items-start gap-6">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-hwangto" aria-hidden />
                <span className="text-sm tracking-wide text-hwangto">
                  {hero.eyebrow}
                </span>
              </div>

              <h1 className="whitespace-pre-line text-hanji text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.15]">
                {hero.slogan}
              </h1>

              <p className="text-hanji/75 text-[clamp(1rem,1.1vw,1.125rem)]">
                {hero.subcopy}
              </p>

              <div className="mt-2 flex flex-wrap gap-3">
                <a
                  href={hero.primaryCta.href}
                  className="rounded-sm bg-hanji px-7 py-3.5 text-sm font-medium text-meok transition-colors duration-300 ease-hanok hover:bg-dancheong-red hover:text-hanji"
                >
                  {hero.primaryCta.label}
                </a>
                <a
                  href={hero.secondaryCta.href}
                  className="rounded-sm border border-hanji/40 px-7 py-3.5 text-sm text-hanji transition-colors duration-300 ease-hanok hover:border-hanji hover:bg-hanji/10"
                >
                  {hero.secondaryCta.label}
                </a>
              </div>
            </div>
          </Reveal>

          {/* 이미지 (문틀 프레임) */}
          <Reveal className="order-1 lg:order-2" delay={120}>
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm border border-hanji/15">
                <R2Image
                  image={hero.image}
                  priority
                  sizes="(max-width: 1024px) 90vw, 45vw"
                />
              </div>
              {/* 낙관 포인트 */}
              <span
                className="u-seal absolute -bottom-4 -left-4 h-14 w-14 text-2xl shadow-lg"
                aria-hidden
              >
                秀
              </span>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
