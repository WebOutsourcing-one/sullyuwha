import type { BespokeContent } from "@/domain/entities/BespokeContent";
import { R2Image } from "../ui/R2Image";
import { Reveal } from "../ui/Reveal";
import { IconArrow } from "../ui/Icons";

interface BespokeSectionProps {
  bespoke: BespokeContent;
}

/**
 * BESPOKE — 당신만을 위한 단 하나의 예복.
 *
 * 높이를 `h-screen`으로 잡지 않는 이유 —
 * 전면 이미지가 `object-cover`라 컨테이너 비율대로 잘리는데, `h-screen`은 컨테이너
 * 비율을 **뷰포트 비율 그대로** 만든다. 세로 폰(약 0.46)과 데스크톱(약 1.78)에서
 * 4배 가까이 차이가 나 같은 사진이 전혀 다르게 잘렸고, 모바일에서 주소창이
 * 접혔다 펴지는 것만으로도 잘리는 위치가 흔들렸다.
 *
 * 브레이크포인트별 고정 비율로 바꿔 뷰포트 높이 의존을 완전히 없앴다.
 * 이제 창 높이를 바꾸거나 기기를 회전해도 잘리는 위치가 그대로다.
 *
 * 데스크톱을 16:9로 잡고 max-height를 두지 않는다 — 상한을 걸면 폭이 넓은 화면에서
 * 비율이 다시 벌어져(2.0 이상) 편차를 줄인 의미가 사라진다. 16:9는 1920px 폭에서
 * 1080px 높이라 기존 `h-screen`과 실질적으로 같은 크기다.
 *
 * `min-h`는 텍스트 오버레이가 `absolute`라 섹션 높이를 밀어내지 못하기 때문에 둔다.
 * 이 값이 없으면 좁은 화면에서 제목·문단이 섹션 밖으로 넘쳐 `overflow-hidden`에 잘린다.
 */
export function BespokeSection({ bespoke }: BespokeSectionProps) {
  return (
    <section
      id="bespoke"
      className="relative aspect-[4/5] min-h-[34rem] w-full overflow-hidden bg-champagne sm:aspect-[4/3] lg:aspect-[16/9]"
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
