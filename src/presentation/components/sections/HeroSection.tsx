import Image from "next/image";
import type { HeroContent } from "@/domain/entities/HeroContent";
import { Container } from "../ui/Container";
import { Reveal } from "../ui/Reveal";
import { IconArrow } from "../ui/Icons";

interface HeroSectionProps {
  hero: HeroContent;
}

/** 부조(엠보스)를 흉내내는 다중 그림자 — 흰 가지가 크림 위로 도드라진다. */
const RELIEF =
  "drop-shadow(1.5px 2.5px 1.5px rgba(61,53,43,0.5)) drop-shadow(-1.5px -1.5px 1px rgba(255,255,255,1)) drop-shadow(0.5px 0.5px 0.5px rgba(61,53,43,0.28))";

/**
 * 히어로 — 크림 배경 위에 설유화 꽃가지가 흰 부조처럼 도드라지고,
 * 어른거리는 나뭇잎 그림자가 은은히 겹친다. 좌측에 브랜드 슬로건.
 */
export function HeroSection({ hero }: HeroSectionProps) {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-ivory"
      aria-label="설유화 소개"
    >
      {/* 어른거리는 나뭇잎 그림자 */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[8%] -top-[12%] h-[72%] w-[58%] opacity-[0.05]"
      >
        <Image
          src="/branch-ink.png"
          alt=""
          fill
          sizes="50vw"
          className="object-contain blur-[2px]"
          style={{ transform: "scaleY(-1) rotate(6deg)" }}
        />
      </div>

      {/* 설유화 꽃가지 — 흰 부조 릴리프 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[44%] sm:h-[50%] lg:inset-0 lg:left-[26%] lg:h-full"
      >
        <Image
          src="/branch-relief.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-contain object-[60%_42%] lg:object-[center_40%]"
          style={{ filter: RELIEF }}
        />
      </div>

      {/* 좌측·하단 크림 페이드 (가지를 덮지 않도록 빠르게 투명) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ivory from-5% via-ivory/10 via-40% to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-ivory to-transparent"
      />

      <Container>
        <div className="relative flex min-h-[86vh] flex-col justify-end pb-24 lg:min-h-[90vh] lg:justify-center lg:pb-0">
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
