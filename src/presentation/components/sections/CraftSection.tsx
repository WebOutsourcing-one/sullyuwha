import type { CraftStep } from "@/domain/entities/CraftStep";
import { Container } from "../ui/Container";
import { R2Image } from "../ui/R2Image";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

interface CraftSectionProps {
  steps: readonly CraftStep[];
}

export function CraftSection({ steps }: CraftSectionProps) {
  return (
    <section
      id="craft"
      className="u-section bg-meok text-hanji"
      aria-labelledby="craft-title"
    >
      <Container>
        <SectionHeading
          eyebrow="工 · 장인정신"
          title="한 벌이 완성되기까지"
          titleId="craft-title"
          invert
        />

        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.order}>
              <Reveal delay={(i % 4) * 90}>
                <article className="flex h-full flex-col gap-4">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-sm border border-hanji/15">
                    <R2Image
                      image={
                        step.image ?? {
                          asset: { value: "craft/placeholder" },
                          alt: step.title,
                        }
                      }
                      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 24vw"
                    />
                    <span
                      className="absolute left-3 top-3 font-display text-3xl font-bold text-hwangto"
                      aria-hidden
                    >
                      {String(step.order).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-sm text-hwangto">{step.subtitle}</span>
                    <h3 className="text-xl text-hanji">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-hanji/70">
                      {step.description}
                    </p>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
