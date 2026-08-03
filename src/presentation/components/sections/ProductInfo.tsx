import type { ProductSpec } from "@/domain/entities/Product";
import type { Image } from "@/domain/value-objects/Image";
import { Container } from "../ui/Container";
import { R2Image } from "../ui/R2Image";
import { Reveal } from "../ui/Reveal";

interface ProductInfoProps {
  specs?: readonly ProductSpec[];
  care?: readonly string[];
  /** 하단 유의사항(색상 편차·치수 오차 등) */
  notes?: readonly string[];
  /** 오른쪽에 나란히 놓이는 착용 컷 */
  modelShots?: readonly Image[];
}

/**
 * 상세 페이지 하단 — 좌측 제품 정보 표(+관리·유의사항), 우측 모델 컷.
 * 표와 모델 컷 중 하나만 있어도 남는 쪽이 폭을 채우도록 열 수를 조정한다.
 */
export function ProductInfo({
  specs,
  care,
  notes,
  modelShots,
}: ProductInfoProps) {
  const hasTable =
    (specs?.length ?? 0) > 0 || (care?.length ?? 0) > 0 || (notes?.length ?? 0) > 0;
  const hasShots = (modelShots?.length ?? 0) > 0;

  if (!hasTable && !hasShots) return null;

  return (
    <section
      className="border-t border-line py-16 md:py-24"
      aria-labelledby="product-info-title"
    >
      <Container>
        <div
          className={`grid gap-10 lg:gap-14 ${
            hasTable && hasShots
              ? "lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"
              : "grid-cols-1"
          }`}
        >
          {hasTable && (
            <Reveal>
              <div className="flex h-full flex-col gap-8 bg-mist px-7 py-8 md:px-9 md:py-10">
                <h2
                  id="product-info-title"
                  className="text-[clamp(1.15rem,2vw,1.5rem)] font-light"
                >
                  제품 정보
                </h2>

                {specs && specs.length > 0 && (
                  <dl className="flex flex-col gap-3.5">
                    {specs.map((spec) => (
                      <div key={spec.label} className="flex gap-5">
                        <dt className="w-16 shrink-0 text-sm text-taupe">
                          {spec.label}
                        </dt>
                        <dd className="text-sm leading-relaxed text-charcoal">
                          {spec.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}

                {care && care.length > 0 && (
                  <div className="flex flex-col gap-3 border-t border-line pt-6">
                    <span className="text-xs uppercase tracking-[0.1em] text-gold">
                      관리
                    </span>
                    <ul className="flex flex-col gap-1.5">
                      {care.map((item) => (
                        <li
                          key={item}
                          className="flex gap-2.5 text-sm leading-relaxed text-taupe"
                        >
                          <span
                            aria-hidden
                            className="mt-2.5 h-px w-2.5 shrink-0 bg-gold/60"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {notes && notes.length > 0 && (
                  <ul className="mt-auto flex flex-col gap-1 pt-4 text-xs leading-relaxed text-taupe/80">
                    {notes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                )}
              </div>
            </Reveal>
          )}

          {hasShots && (
            <div className="flex flex-col gap-5">
              <h2 className="text-[clamp(1.15rem,2vw,1.5rem)] font-light">
                모델 컷
              </h2>
              <ul className="grid grid-cols-3 gap-3 md:gap-4">
                {modelShots!.map((shot, i) => (
                  <li key={shot.asset.value}>
                    <Reveal delay={(i % 3) * 90}>
                      <div className="relative aspect-[3/4] overflow-hidden bg-champagne">
                        <R2Image
                          image={shot}
                          sizes="(max-width: 1024px) 30vw, 18vw"
                        />
                      </div>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
