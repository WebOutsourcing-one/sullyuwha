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
      className="u-section bg-giwa text-hanji"
      aria-labelledby="contact-title"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* 정보 */}
          <Reveal>
            <div className="flex flex-col gap-8">
              <SectionHeading
                eyebrow="訪 · 문의 · 오시는 길"
                title="결에 맞는 옷을 함께"
                titleId="contact-title"
                invert
              />

              <p className="text-hanji/75 leading-relaxed">
                {contact.reservationNote}
              </p>

              <dl className="flex flex-col divide-y divide-hanji/15 border-y border-hanji/15">
                <ContactRow label="공방" value={contact.studioName} />
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
                    className="rounded-sm border border-hanji/30 px-4 py-2 text-sm text-hanji transition-colors duration-200 ease-hanok hover:bg-hanji hover:text-meok"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </Reveal>

          {/* 약도 */}
          <Reveal delay={100}>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm border border-hanji/15 lg:aspect-auto lg:h-full lg:min-h-[26rem]">
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
    <div className="flex items-baseline gap-4 py-3">
      <dt className="w-20 shrink-0 text-sm text-hwangto">{label}</dt>
      <dd className="text-hanji/90">
        {href ? (
          <a
            href={href}
            className="transition-colors duration-200 hover:text-hwangto"
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
