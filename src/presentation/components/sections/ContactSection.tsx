import Image from "next/image";
import type { ContactInfo } from "@/domain/entities/ContactInfo";
import { BranchMotif } from "../ui/BranchMotif";
import { Container } from "../ui/Container";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

interface ContactSectionProps {
  contact: ContactInfo;
}

export function ContactSection({ contact }: ContactSectionProps) {
  return (
    <section
      id="contact"
      className="relative overflow-hidden u-section bg-charcoal text-ivory"
      aria-labelledby="contact-title"
    >
      <BranchMotif
        variant="ivory"
        className="bottom-[-6%] left-[-7%] h-[56%] w-[50%]"
        position="bottom left"
        opacity={0.1}
        flip
      />
      <Container className="relative z-10">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          {/* 정보 */}
          <Reveal>
            <div className="flex flex-col gap-8">
              <SectionHeading
                eyebrow="VISIT & CONTACT"
                title="문의 · 스토어"
                titleId="contact-title"
                align="left"
                invert
              />

              <p className="max-w-md leading-relaxed text-ivory/70">
                {contact.note}
              </p>

              <dl className="flex flex-col divide-y divide-ivory/15 border-y border-ivory/15">
                <ContactRow label="쇼룸" value={contact.showroomName} />
                <ContactRow label="주소" value={contact.address} />
                <ContactRow
                  label="전화"
                  value={contact.phone}
                  href={`tel:${contact.phone.replace(/[^0-9+]/g, "")}`}
                />
                <ContactRow
                  label="이메일"
                  value={contact.email}
                  href={`mailto:${contact.email}`}
                />
                {contact.hours.map((h) => (
                  <ContactRow key={h.label} label={h.label} value={h.value} />
                ))}
              </dl>

              <div className="flex gap-3">
                {contact.socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-sm border border-ivory/30 px-5 py-2.5 text-xs uppercase tracking-[0.12em] text-ivory transition-colors duration-300 ease-silk hover:bg-ivory hover:text-charcoal"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </Reveal>

          {/* 명함 — 반전한 설유화 꽃가지 + 좌측 상단부터 세로 타이포 */}
          <Reveal delay={100}>
            <div className="flex w-full items-center justify-center lg:h-full">
              <div className="relative aspect-[3/7] w-full max-w-[18rem] overflow-hidden rounded-sm bg-ivory ring-1 ring-black/5 shadow-[0_40px_90px_-50px_rgba(0,0,0,0.8)]">
                {/* 반전한 꽃가지 (컬러, 흰 배경은 카드에 녹임) */}
                <Image
                  src="/branch-photo-vertical.jpg"
                  alt="설유화 꽃가지"
                  fill
                  sizes="320px"
                  className="scale-x-[-1] object-cover object-[42%_60%] mix-blend-multiply"
                />

                {/* 좌측 상단 타이포 가독성용 아이보리 스크림 */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-ivory via-ivory/55 to-transparent"
                  aria-hidden
                />

                {/* 좌측 상단부터 세로쓰기 (writing-mode: vertical-rl) */}
                <div className="absolute inset-0 flex flex-col items-start gap-6 p-8">
                  <p className="font-serif text-[2rem] font-light leading-none tracking-[0.1em] text-charcoal [writing-mode:vertical-rl]">
                    설유화
                  </p>
                  <span className="block h-6 w-px bg-gold" aria-hidden />
                  {/* 우→좌 2열: 고귀함이 · 기품있는 선 */}
                  <div
                    className="flex items-start gap-2 font-serif text-base font-light leading-none tracking-[0.04em] text-charcoal/85"
                    aria-label="고귀함이 기품있는 선"
                  >
                    <span className="whitespace-nowrap [writing-mode:vertical-rl]" aria-hidden>
                      기품있는 선
                    </span>
                    <span className="whitespace-nowrap [writing-mode:vertical-rl]" aria-hidden>
                      고귀함이
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

function ContactRow({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-baseline gap-4 py-3.5">
      <dt className="w-24 shrink-0 text-xs uppercase tracking-[0.1em] text-gold">
        {label}
      </dt>
      <dd className="text-ivory/90">
        {href ? (
          <a
            href={href}
            className="transition-colors duration-200 hover:text-gold"
          >
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
