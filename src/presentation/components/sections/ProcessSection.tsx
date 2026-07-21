import { Fragment } from "react";
import type { ProcessStep } from "@/domain/entities/ProcessStep";
import { Container } from "../ui/Container";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";
import { processIcons, IconArrow, type ProcessIconKey } from "../ui/Icons";

interface ProcessSectionProps {
  steps: readonly ProcessStep[];
}

/** PROCESS — 맞춤 제작 과정(5단계). */
export function ProcessSection({ steps }: ProcessSectionProps) {
  return (
    <section
      id="process"
      className="u-section bg-ivory"
      aria-labelledby="process-title"
    >
      <Container>
        <SectionHeading
          eyebrow="PROCESS"
          title="맞춤 제작 과정"
          titleId="process-title"
          subcopy="상담부터 완성까지, 하나의 예복이 지어지는 다섯 단계."
        />

        <ol className="mt-16 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:flex lg:items-start lg:justify-center lg:gap-3">
          {steps.map((s, i) => {
            const Icon =
              processIcons[s.icon as ProcessIconKey] ?? processIcons.consult;
            return (
              <Fragment key={s.id}>
                <li className="lg:w-[9.5rem]">
                  <Reveal
                    delay={(i % 3) * 70}
                    className="flex flex-col items-center gap-4 text-center"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-line bg-mist">
                      <Icon className="h-7 w-7 text-gold" aria-hidden />
                    </div>
                    <span className="text-[0.6rem] uppercase tracking-[0.2em] text-taupe">
                      Step {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-serif text-base font-light text-charcoal">
                      {s.title}
                    </span>
                  </Reveal>
                </li>
                {i < steps.length - 1 && (
                  <li aria-hidden className="hidden pt-6 lg:flex lg:items-center">
                    <IconArrow className="h-4 w-4 text-taupe/40" />
                  </li>
                )}
              </Fragment>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
