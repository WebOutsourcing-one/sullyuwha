import type { BespokeContent } from "@/domain/entities/BespokeContent";
import { R2Image } from "../ui/R2Image";
import { Reveal } from "../ui/Reveal";
import { IconArrow } from "../ui/Icons";

interface BespokeSectionProps {
  bespoke: BespokeContent;
}

/** BESPOKE — 당신만을 위한 단 하나의 예복. */
export function BespokeSection({ bespoke }: BespokeSectionProps) {
  return (
    <section
      id="bespoke"
      className="relative h-screen min-h-[40rem] overflow-hidden bg-champagne"
      aria-labelledby="bespoke-title"
    >
      <R2Image
        image={bespoke.image}
        sizes="100vw"
        className="object-[center_30%]"
      />

      <div
        className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-charcoal/10 to-transparent"
        aria-hidden
      />

      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-5 p-8 pb-16 text-center text-ivory lg:pb-24">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="h-px w-6 bg-ivory/60" aria-hidden />
            <span className="u-label text-ivory/85">{bespoke.eyebrow}</span>
            <span className="h-px w-6 bg-ivory/60" aria-hidden />
          </div>
        </Reveal>

        <Reveal delay={100}>
          <h2
            id="bespoke-title"
            className="whitespace-pre-line font-serif text-[clamp(2rem,5vw,3.8rem)] font-light leading-[1.2]"
          >
            {bespoke.title}
          </h2>
        </Reveal>

        <Reveal delay={150}>
          <div className="flex flex-col items-center gap-3">
            {bespoke.paragraphs.map((p, i) => (
              <p
                key={i}
                className="max-w-md text-sm leading-[1.8] text-ivory/80 lg:text-base"
              >
                {p}
              </p>
            ))}
          </div>
        </Reveal>

        <Reveal delay={200}>
          <a
            href={bespoke.cta.href}
            className="group mt-2 inline-flex items-center gap-3 rounded-sm border border-ivory/40 px-8 py-3.5 text-xs uppercase tracking-[0.16em] text-ivory transition-colors duration-300 ease-silk hover:bg-ivory hover:text-charcoal"
          >
            {bespoke.cta.label}
            <IconArrow className="h-4 w-4 transition-transform duration-300 ease-silk group-hover:translate-x-1" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
