import Image from "next/image";
import type { HeroContent } from "@/domain/entities/HeroContent";
import { Reveal } from "../ui/Reveal";
import { IconArrow } from "../ui/Icons";

interface HeroSectionProps {
  hero: HeroContent;
}

/**
 * 히어로 — 좌측 브랜드 슬로건, 설유화 브랜치 라인 아트가 배경에 흐른다.
 */
export function HeroSection({ hero }: HeroSectionProps) {
  return (
    <section
      id="top"
      className="flex min-h-screen flex-col overflow-hidden bg-ivory lg:flex-row"
      aria-label="설유화 소개"
    >
      {/* 이미지 — 모바일: 상단, 데스크톱: 우측 */}
      <div
        aria-hidden
        className="relative flex min-h-[50vh] w-full items-center justify-center lg:min-h-full lg:w-[70%] lg:order-last"
      >
        <Image
          src="/main.png"
          alt=""
          width={1254}
          height={1254}
          priority
          className="h-full w-full object-contain"
        />
      </div>

      {/* 텍스트 콘텐츠 */}
      <div className="flex w-full items-center px-6 py-12 lg:w-[30%] lg:px-12 lg:py-0">
        <Reveal>
          <div className="max-w-xl">
            <h1 className="whitespace-pre font-serif text-[clamp(2.5rem,6vw,4.7rem)] font-light leading-[1.22] tracking-[-0.01em] text-charcoal">
              {hero.slogan}
            </h1>

            <div
              aria-hidden
              className="my-6 h-px w-12 bg-charcoal/20"
            />

            <p className="max-w-md whitespace-pre-line text-[clamp(1rem,1.2vw,1.2rem)] leading-[2] text-taupe">
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
    </section>
  );
}
