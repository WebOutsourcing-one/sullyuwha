import { Container } from "../ui/Container";

const NAV_LINKS = [
  { label: "브랜드", href: "#story" },
  { label: "컬렉션", href: "#collection" },
  { label: "실크", href: "#silk" },
  { label: "룩북", href: "#lookbook" },
  { label: "문의", href: "#contact" },
] as const;

export function SiteFooter() {
  return (
    <footer className="bg-charcoal text-ivory/80">
      <Container>
        <div className="flex flex-col gap-10 py-16 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-baseline gap-2.5">
              <span className="font-serif text-2xl font-light text-ivory">
                설유화
              </span>
              <span className="text-[0.65rem] uppercase tracking-[0.22em] text-gold">
                Seolyuhwa
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ivory/60">
              실크를 일상으로 들이는 기성복 브랜드. 매일 두르는 고요한 광택을
              제안합니다.
            </p>
          </div>

          <nav className="flex flex-col gap-3" aria-label="푸터 메뉴">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-ivory/60 transition-colors duration-200 hover:text-gold"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-2 border-t border-ivory/15 py-6 text-xs text-ivory/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {2026} 설유화 (Seolyuhwa). All rights reserved.</p>
          <p>서울특별시 성동구 성수이로 12, 2층</p>
        </div>
      </Container>
    </footer>
  );
}
