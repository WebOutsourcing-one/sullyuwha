import type { BrandStory } from "@/domain/entities/BrandStory";
import { Container } from "../ui/Container";
import { R2Image } from "../ui/R2Image";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

interface StorySectionProps {
  story: BrandStory;
}

export function StorySection({ story }: StorySectionProps) {
  return (
    <section
      id="story"
      className="u-section bg-ivory"
      aria-labelledby="story-title"
    >
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
          {/* 이미지 */}
          <Reveal>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden lg:max-w-none">
              <R2Image
                image={story.image}
                sizes="(max-width: 1024px) 90vw, 45vw"
              />
            </div>
          </Reveal>

          {/* 텍스트 */}
          <Reveal delay={100}>
            <div className="flex flex-col gap-7">
              <SectionHeading
                eyebrow={story.eyebrow}
                title={story.title}
                titleId="story-title"
                align="left"
              />

              <div className="flex flex-col gap-4 text-taupe">
                {story.paragraphs.map((p, i) => (
                  <p key={i} className="leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>

              {/* 이름의 의미 */}
              <div className="mt-2 border-t border-line pt-7">
                <p className="font-serif text-2xl font-light text-charcoal">
                  {story.nameMeaning.reading}
                </p>
                <p className="mt-2 leading-relaxed text-taupe">
                  {story.nameMeaning.meaning}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
