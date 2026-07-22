import Image from "next/image";
import type { HeroContent } from "@/domain/entities/HeroContent";
import { Container } from "../ui/Container";
import { R2Image } from "../ui/R2Image";
import { Reveal } from "../ui/Reveal";
import { IconArrow } from "../ui/Icons";

interface HeroSectionProps {
  hero: HeroContent;
}

/**
 * 히어로 — 좌측 브랜드 슬로건, 우측 한복 예복 포트레이트.
 * 어른거리는 나뭇잎 그림자가 크림 배경에 은은히 겹친다.
 */
export function HeroSection({ hero }: HeroSectionProps) {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-ivory"
      aria-label="설유화 소개"
    >
      {/* 어른거리는 나뭇잎 그림자 (좌측, 아주 옅게) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[8%] -top-[10%] hidden h-[70%] w-[48%] opacity-[0.04] lg:block"
      >
        <Image
          src="/branch-ink.png"
          alt=""
          fill
          sizes="45vw"
          className="object-contain blur-[2px]"
          style={{ transform: "scaleY(-1) rotate(6deg)" }}
        />
      </div>

      {/* 한복 예복 포트레이트 */}
      <div className="absolute inset-x-0 top-0 h-[50%] bg-champagne sm:h-[54%] lg:inset-y-0 lg:left-auto lg:right-0 lg:h-full lg:w-[46%]">
        <R2Image
          image={hero.image}
          priority
          sizes="(max-width: 1024px) 100vw, 46vw"
          className="object-[center_22%]"
        />
        {/* 모바일: 하단 크림 페이드 */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ivory to-transparent lg:hidden"
        />
        {/* 데스크톱: 좌측 크림 페이드로 경계를 부드럽게 */}
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 hidden w-32 bg-gradient-to-r from-ivory to-transparent lg:block"
        />
      </div>

      <Container>
        <div className="relative flex min-h-[88vh] flex-col justify-end pb-16 lg:min-h-[90vh] lg:justify-center lg:pb-0">
          <Reveal>
            <div className="max-w-xl">
              <h1 className="whitespace-pre-line font-serif text-[clamp(2.5rem,6vw,4.7rem)] font-light leading-[1.22] tracking-[-0.01em] text-charcoal">
                {hero.slogan}
              </h1>

              <p className="mt-8 max-w-md whitespace-pre-line text-[clamp(0.95rem,1.05vw,1.0625rem)] leading-[2] text-taupe">
                {hero.subcopy}
              </p>

              <a
                href={hero.primaryCta.href}
                className="group mt-10 inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-charcoal"
              >
                <span className="border-b border-charcoal/40 pb-1 transition-colors duration-300 group-hover:border-charcoal">
                  {hero.primaryCta.label}
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
