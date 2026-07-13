import type { SilkFeature } from "@/domain/entities/SilkFeature";
import { Container } from "../ui/Container";
import { R2Image } from "../ui/R2Image";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

interface SilkSectionProps {
  features: readonly SilkFeature[];
}

export function SilkSection({ features }: SilkSectionProps) {
  return (
    <section
      id="silk"
      className="u-section bg-charcoal text-ivory"
      aria-labelledby="silk-title"
    >
      <Container>
        <SectionHeading
          eyebrow="THE SILK"
          title="소재로 증명하는 실크"
          titleId="silk-title"
          invert
          subcopy="광택과 통기성, 원사의 등급, 그리고 관리까지 — 좋은 실크의 조건을 갖춥니다."
        />

        <ul className="mt-16 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <li key={feature.id}>
              <Reveal delay={(i % 4) * 90}>
                <article className="flex h-full flex-col gap-5">
                  {feature.image && (
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <R2Image
                        image={feature.image}
                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 24vw"
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <span className="u-label">{feature.label}</span>
                    <h3 className="font-serif text-xl font-light text-ivory">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-ivory/65">
                      {feature.description}
                    </p>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
