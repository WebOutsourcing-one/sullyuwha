import Link from "next/link";
import type { BrandStory } from "@/domain/entities/BrandStory";
import { Container } from "../ui/Container";
import { AboutImageCarousel } from "../ui/AboutImageCarousel";
import { Reveal } from "../ui/Reveal";
import { IconArrow } from "../ui/Icons";

/** 5초 간격으로 돌아가는 ABOUT 컷. 순서는 파일명 번호 그대로다. */
const ABOUT_IMAGES = [
  { src: "/about_imgs/about-1.webp", alt: "설유화 예복을 입은 모습 1" },
  { src: "/about_imgs/about-2.webp", alt: "설유화 예복을 입은 모습 2" },
  { src: "/about_imgs/about-3.webp", alt: "설유화 예복을 입은 모습 3" },
  { src: "/about_imgs/about-4.webp", alt: "설유화 예복을 입은 모습 4" },
  { src: "/about_imgs/about-5.webp", alt: "설유화 예복을 입은 모습 5" },
] as const;

interface StorySectionProps {
  story: BrandStory;
}

/** ABOUT — 시간이 지나도 변하지 않는 가치. */
export function StorySection({ story }: StorySectionProps) {
  return (
    <section
      id="about"
      className="u-section bg-ivory"
      aria-labelledby="about-title"
    >
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
          {/* 이미지 */}
          <Reveal>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden bg-champagne lg:max-w-none">
              <AboutImageCarousel
                images={ABOUT_IMAGES}
                sizes="(max-width: 1024px) 90vw, 45vw"
              />
            </div>
          </Reveal>

          {/* 텍스트 */}
          <Reveal delay={100}>
            <div className="flex flex-col items-start gap-6">
              <div className="flex items-center gap-3">
                <span className="h-px w-6 bg-gold" aria-hidden />
                <span className="u-label">{story.eyebrow}</span>
              </div>

              <h2
                id="about-title"
                className="whitespace-pre-line font-serif text-[clamp(1.9rem,4vw,3.1rem)] font-light leading-[1.25] text-charcoal"
              >
                {story.title}
              </h2>

              <div className="flex flex-col gap-4 text-taupe">
                {story.paragraphs.map((p, i) => (
                  <p key={i} className="leading-[1.9]">
                    {p}
                  </p>
                ))}
              </div>

              <Link
                href="/#collection"
                className="group mt-3 inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-charcoal"
              >
                <span className="border-b border-charcoal/40 pb-1 transition-colors duration-300 group-hover:border-charcoal">
                  Brand Story
                </span>
                <IconArrow className="h-4 w-4 transition-transform duration-300 ease-silk group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
