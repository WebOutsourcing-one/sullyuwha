import type { ContactInfo } from "@/domain/entities/ContactInfo";
import { Container } from "../ui/Container";
import { R2Image } from "../ui/R2Image";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

interface ContactSectionProps {
  contact: ContactInfo;
}

export function ContactSection({ contact }: ContactSectionProps) {
  return (
    <section
      id="contact"
      className="u-section bg-charcoal text-ivory"
      aria-labelledby="contact-title"
    >
      <Container>
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

          {/* 약도 */}
          <Reveal delay={100}>
            <div className="relative aspect-[4/3] w-full overflow-hidden lg:aspect-auto lg:h-full lg:min-h-[28rem]">
              {contact.mapImage ? (
                <R2Image
                  image={contact.mapImage}
                  sizes="(max-width: 1024px) 90vw, 45vw"
                />
              ) : null}
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
