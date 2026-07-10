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
      className="u-section bg-hanji"
      aria-labelledby="story-title"
    >
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* 이미지 */}
          <Reveal>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-sm border border-line">
              <R2Image
                image={story.image}
                sizes="(max-width: 1024px) 90vw, 45vw"
              />
            </div>
          </Reveal>

          {/* 텍스트 */}
          <Reveal delay={100}>
            <div className="flex flex-col gap-6">
              <SectionHeading
                eyebrow={story.eyebrow}
                title={story.title}
                titleId="story-title"
              />

              <div className="flex flex-col gap-4 text-meok-soft">
                {story.paragraphs.map((p, i) => (
                  <p key={i} className="leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>

              {/* 이름의 의미 */}
              <div className="mt-2 flex items-start gap-5 border-t border-line pt-6">
                <span className="font-display text-4xl font-bold text-dancheong-red">
                  {story.nameMeaning.hanja}
                </span>
                <div>
                  <p className="font-display text-lg text-meok">
                    {story.nameMeaning.reading}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-meok-soft">
                    {story.nameMeaning.meaning}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
