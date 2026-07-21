import Image from "next/image";
import type { HeroContent } from "@/domain/entities/HeroContent";
import { Container } from "../ui/Container";
import { Reveal } from "../ui/Reveal";

interface HeroSectionProps {
  hero: HeroContent;
}

/**
 * 히어로 — 밝은 베이지 위에 설유화 꽃가지가 여백의 미를 살리며 스며든다.
 * 꽃가지 이미지는 mix-blend-multiply로 흰 배경이 아이보리에 녹아, 가지와 꽃만
 * 여백 위에 떠 있는 듯 보인다. 텍스트는 왼쪽 여백에서 조용히 시선을 이끈다.
 */
export function HeroSection({ hero }: HeroSectionProps) {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-ivory"
      aria-label="설유화 소개"
    >
      {/* 설유화 꽃가지 — 여백에 스며드는 장식 (장식용이므로 alt 비움) */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[46%] sm:h-[52%] lg:inset-0 lg:h-full">
          <Image
            src="/seolyuhwa-branch.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[52%_40%] mix-blend-multiply lg:object-[center_42%]"
          />
        </div>
        {/* 하단 아이보리 페이드 — 가지 끝을 여백에 스며들게 하고 콘텐츠를 감싼다 */}
        <div className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-ivory via-ivory/70 to-transparent" />
        {/* 좌측 아이보리 페이드 — 왼쪽 여백의 문구 가독성 */}
        <div className="absolute inset-0 bg-gradient-to-r from-ivory via-ivory/25 to-transparent lg:via-ivory/10" />
      </div>

      <Container>
        <div className="relative flex min-h-[90vh] flex-col justify-end pb-24 lg:min-h-[92vh] lg:justify-center lg:pb-0">
          <Reveal>
            <div className="max-w-xl">
              <span className="u-label">{hero.eyebrow}</span>

              <h1 className="mt-6 whitespace-pre-line font-serif text-[clamp(2.6rem,6.5vw,5rem)] font-light leading-[1.16] tracking-[-0.01em] text-charcoal">
                {hero.slogan}
              </h1>

              <p className="mt-7 max-w-md text-[clamp(0.95rem,1.05vw,1.0625rem)] leading-relaxed text-taupe">
                {hero.subcopy}
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href={hero.primaryCta.href}
                  className="inline-flex items-center rounded-sm bg-charcoal px-8 py-3.5 text-xs uppercase tracking-[0.12em] text-ivory transition-colors duration-300 ease-silk hover:bg-gold"
                >
                  {hero.primaryCta.label}
                </a>
                <a
                  href={hero.secondaryCta.href}
                  className="inline-flex items-center rounded-sm border border-charcoal/25 px-8 py-3.5 text-xs uppercase tracking-[0.12em] text-charcoal transition-colors duration-300 ease-silk hover:border-charcoal hover:bg-charcoal hover:text-ivory"
                >
                  {hero.secondaryCta.label}
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
