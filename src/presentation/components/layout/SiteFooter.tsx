import { Container } from "../ui/Container";
import { Emblem } from "../ui/Icons";

const NAV_LINKS = [
  { label: "BRAND", href: "#top" },
  { label: "COLLECTION", href: "#collection" },
  { label: "BESPOKE", href: "#bespoke" },
  { label: "STORY", href: "#about" },
  { label: "CONTACT", href: "#contact" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-mist text-taupe">
      <Container>
        <div className="flex flex-col gap-10 py-16 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <Emblem className="h-6 w-6 text-gold" aria-hidden />
              <span className="flex flex-col leading-none">
                <span className="font-serif text-xl font-light text-charcoal">
                  설유화
                </span>
                <span className="mt-1 text-[0.55rem] uppercase tracking-[0.32em] text-taupe">
                  Sullyuwha
                </span>
              </span>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-taupe">
              전통의 아름다움 위에 현대의 감각을 더해, 단 하나의 예복을 짓는
              한복 브랜드입니다.
            </p>
          </div>

          <nav className="flex flex-col gap-3" aria-label="푸터 메뉴">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs uppercase tracking-[0.16em] text-taupe transition-colors duration-200 hover:text-charcoal"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-2 border-t border-line py-6 text-xs text-taupe/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© {2026} 설유화 (Sullyuwha). All rights reserved.</p>
          <p>서울특별시 성동구 성수이로 12, 2층</p>
        </div>
      </Container>
    </footer>
  );
}
