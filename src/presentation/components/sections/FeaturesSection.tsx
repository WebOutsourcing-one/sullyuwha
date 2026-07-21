import type { SilkFeature } from "@/domain/entities/SilkFeature";
import { Container } from "../ui/Container";
import { Reveal } from "../ui/Reveal";
import { featureIcons, type FeatureIconKey } from "../ui/Icons";

interface FeaturesSectionProps {
  features: readonly SilkFeature[];
}

/** 브랜드 4대 가치 — 라인 엠블럼 아이콘 + 라틴 라벨 + 짧은 설명. */
export function FeaturesSection({ features }: FeaturesSectionProps) {
  return (
    <section
      className="border-y border-line/60 bg-mist"
      aria-label="설유화의 가치"
    >
      <Container>
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 py-16 md:grid-cols-4 md:py-20">
          {features.map((f, i) => {
            const Icon = featureIcons[f.id as FeatureIconKey] ?? featureIcons.tradition;
            return (
              <Reveal key={f.id} delay={(i % 4) * 80}>
                <div className="flex flex-col items-center gap-4 text-center">
                  <Icon className="h-9 w-9 text-gold" aria-hidden />
                  <span className="text-[0.7rem] uppercase tracking-[0.22em] text-charcoal">
                    {f.label}
                  </span>
                  <p className="max-w-[15rem] text-sm leading-relaxed text-taupe">
                    {f.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
