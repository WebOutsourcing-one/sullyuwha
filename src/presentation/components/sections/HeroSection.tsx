import Image from "next/image";
import type { HeroContent } from "@/domain/entities/HeroContent";
import type { SilkFeature } from "@/domain/entities/SilkFeature";
import { Container } from "../ui/Container";
import { Reveal } from "../ui/Reveal";
import { IconArrow, featureIcons, type FeatureIconKey } from "../ui/Icons";

interface HeroSectionProps {
  hero: HeroContent;
  features: readonly SilkFeature[];
}

/**
 * 첫 화면 높이 — sticky 헤더(모바일 64px / md 80px)를 뺀 값.
 *
 * 모바일에서 히어로가 하단 가치 스트립까지 스크롤 없이 한 화면에 들어와야 하므로
 * 헤더 높이를 빼둔다. 주소창이 접히고 펴질 때 높이가 출렁이지 않도록 vh가 아닌 svh를 쓴다.
 * lg 이상은 데스크탑 기존 레이아웃 그대로 전체 높이를 쓴다.
 */
const FIRST_SCREEN =
  "min-h-[calc(100svh-4rem)] md:min-h-[calc(100svh-5rem)] lg:min-h-screen";

/**
 * 히어로 — 좌측 브랜드 슬로건, 설유화 브랜치 라인 아트가 배경에 흐른다.
 *
 * 모바일에서는 브랜드 4대 가치를 아이콘+라벨로만 압축해 하단에 얹어,
 * 스크롤 없이 첫 화면에서 브랜드 요약이 끝나게 한다.
 * 같은 내용이 두 번 나오지 않도록 FeaturesSection은 lg 미만에서 숨긴다.
 */
export function HeroSection({ hero, features }: HeroSectionProps) {
  return (
    <section
      id="top"
      className={`relative overflow-hidden ${FIRST_SCREEN}`}
      aria-label="설유화 소개"
    >
      <Container className={`relative z-10 flex flex-col ${FIRST_SCREEN}`}>
        {/* 위쪽 — 슬로건 + (데스크탑) 브랜치 이미지. */}
        <div className="relative flex flex-1 flex-col items-center lg:flex-row">
          {/* main_branch 배경 — 모바일 전용. 우측 아래 모서리에 딱 붙인다.
              - 위쪽 영역 안에만 깔아 두므로 아래 경계가 곧 가치 스트립의 윗선이다.
                items-end면 그 선에 정확히 맞고 별도 여백 계산이 필요 없다.
              - 우측은 Container의 거터(--gutter)만큼 밖으로 빼 화면 끝까지 닿게 한다.
              - max-h-full로 높이가 잘리면 object-contain이 상자 안에서 이미지를 가운데로
                모아 우측·하단에 빈틈이 생긴다. object-right-bottom으로 모서리에 붙인다. */}
          <div className="absolute inset-y-0 left-0 right-[calc(var(--gutter)*-1)] z-0 flex items-end justify-end lg:hidden">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-ivory/30 to-ivory/80" />
            <Image
              src="/main_branch.webp"
              alt=""
              width={600}
              height={400}
              sizes="80vw"
              className="h-auto max-h-full w-full max-w-[clamp(14rem,80vw,28rem)] object-contain object-right-bottom opacity-70"
            />
          </div>

          {/* 텍스트 — 배경이 absolute z-0이므로 명시적으로 위로 올린다.
              모바일은 위쪽 여백만 깎아 블록을 끌어올린다(아래는 그대로 두어 가치 스트립과 간격 유지).
              items-center로 가운데 정렬이라 위 여백을 깎은 만큼의 절반만 실제로 올라간다. */}
          <div className="relative z-10 flex w-full flex-1 items-center pt-8 pb-12 lg:py-0">
            <Reveal>
              <div className="max-w-xl">
                {/* 하한만 30px로 낮춘다. 6vw가 이기는 500px 이상(=데스크탑 포함)은 그대로다. */}
                <h1 className="whitespace-pre font-serif text-[clamp(1.875rem,6vw,4.7rem)] font-light leading-[1.22] tracking-[-0.01em] text-charcoal">
                  {hero.slogan}
                </h1>

                <div aria-hidden className="my-6 h-px w-12 bg-charcoal/20" />

                {/* lg 미만에서는 clamp가 늘 하한(16px)에 걸리므로, 2px 줄인 값을 그대로 못박는다. */}
                <p className="max-w-md whitespace-pre-line text-[0.875rem] leading-[2] text-taupe lg:text-[clamp(1rem,1.2vw,1.2rem)]">
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
              src="/main_branch.webp"
              alt=""
              width={600}
              height={400}
              sizes="(max-width:1024px) 60vw, 30vw"
              className="h-auto w-full max-w-[clamp(14rem,40vw,28rem)] object-contain"
            />
          </div>
        </div>

        {/* 아래쪽 — 브랜드 4대 가치 요약(아이콘 + 라벨). 모바일 전용. */}
        <Reveal className="pb-8 lg:hidden" delay={160}>
          {/* 윗줄 대신 항목 사이를 세로선으로 나눈다.
              divide-x는 바깥 양끝을 뺀 사이에만 선을 넣고, 그리드 항목은 기본으로
              행 높이만큼 늘어나므로 라벨이 두 줄로 접히는 칸이 있어도 선 높이가 고르다. */}
          <ul
            className="grid grid-cols-4 gap-x-1.5 divide-x divide-line/60 pt-6"
            aria-label="설유화의 가치"
          >
            {features.map((f) => {
              const Icon =
                featureIcons[f.id as FeatureIconKey] ?? featureIcons.tradition;
              return (
                <li
                  key={f.id}
                  className="flex flex-col items-center gap-2.5 text-center"
                >
                  <Icon className="h-7 w-7 text-gold" aria-hidden />
                  {/* 가장 긴 CRAFTSMANSHIP(13자)이 칸 안에 한 줄로 들어가는 상한.
                      단어 중간에서 끊기는 걸 막으려고 크기·자간을 여기까지 줄였다. */}
                  <span className="text-[0.5rem] uppercase leading-[1.5] tracking-[0.06em] text-charcoal">
                    {f.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
