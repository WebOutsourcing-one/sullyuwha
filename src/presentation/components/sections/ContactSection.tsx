import Image from "next/image";
import type { ContactInfo } from "@/domain/entities/ContactInfo";
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
      className="u-section bg-champagne"
      aria-labelledby="contact-title"
    >
      <Container>
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          {/* 정보 */}
          <Reveal className="order-2 lg:order-1">
            <div className="flex flex-col gap-8">
              <SectionHeading
                eyebrow="VISIT & CONTACT"
                title="문의 · 아틀리에"
                titleId="contact-title"
                align="left"
              />

              <p className="max-w-md leading-relaxed text-taupe">
                {contact.note}
              </p>

              <dl className="flex flex-col divide-y divide-line border-y border-line">
                <ContactRow label="아틀리에" value={contact.showroomName} />
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
                    className="rounded-sm border border-charcoal/25 px-5 py-2.5 text-xs uppercase tracking-[0.12em] text-charcoal transition-colors duration-300 ease-silk hover:bg-charcoal hover:text-ivory"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </Reveal>

          {/* 명함 */}
          <Reveal delay={100} className="order-1 lg:order-2">
            <div className="flex w-full items-center justify-center lg:h-full">
              <div className="relative aspect-[3/7] w-full max-w-[18rem] overflow-hidden rounded-sm bg-ivory ring-1 ring-black/5 shadow-[0_40px_90px_-50px_rgba(61,53,43,0.6)]">
                {/* 명함 배경 */}
                <Image
                  src="/name-card.png"
                  alt="설유화 명함"
                  fill
                  sizes="320px"
                  className="object-cover"
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
                  <span className="block h-px w-8 bg-gold" aria-hidden />
                  {/* 우→좌 2열: 「고귀함이 서려있는」 · 「기품있는 선」 */}
                  <div
                    className="flex items-start gap-2.5 font-serif text-base font-light leading-none tracking-[0.04em] text-charcoal/85"
                    aria-label="고귀함이 서려있는 기품있는 선"
                  >
                    <span
                      className="whitespace-nowrap [writing-mode:vertical-rl]"
                      aria-hidden
                    >
                      기품있는 선
                    </span>
                    <span
                      className="whitespace-nowrap [writing-mode:vertical-rl]"
                      aria-hidden
                    >
                      고귀함이 서려있는
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
      <dd className="text-charcoal/90">
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
