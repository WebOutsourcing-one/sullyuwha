import Image from "next/image";
import type { HeroContent } from "@/domain/entities/HeroContent";
import { Container } from "../ui/Container";
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
      className="relative min-h-screen overflow-hidden"
      aria-label="설유화 소개"
    >
      {/* main_branch 배경 — 모바일 전용 (텍스트 아래 깔림) */}
      <div className="absolute inset-0 z-0 flex items-center justify-center lg:hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-ivory/30 to-ivory/80" />
        <Image
          src="/main_branch.png"
          alt=""
          width={600}
          height={400}
          sizes="80vw"
          className="h-auto w-full max-w-[clamp(14rem,80vw,28rem)] object-contain opacity-25"
        />
      </div>

      <Container className="relative z-10 flex min-h-screen flex-col items-center lg:flex-row">
        {/* 텍스트 */}
        <div className="flex w-full flex-1 items-center py-12 lg:py-0">
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

        {/* main_branch 이미지 — 데스크탑 전용 */}
        <div className="hidden flex-1 items-center justify-center py-12 lg:flex lg:py-0">
          <Image
            src="/main_branch.png"
            alt=""
            width={600}
            height={400}
            sizes="(max-width:1024px) 60vw, 30vw"
            className="h-auto w-full max-w-[clamp(14rem,40vw,28rem)] object-contain"
          />
        </div>
      </Container>
    </section>
  );
}
