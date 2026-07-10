import { Container } from "../ui/Container";

const NAV_LINKS = [
  { label: "이야기", href: "#story" },
  { label: "컬렉션", href: "#collection" },
  { label: "장인정신", href: "#craft" },
  { label: "갤러리", href: "#gallery" },
  { label: "문의", href: "#contact" },
] as const;

export function SiteFooter() {
  return (
    <footer className="bg-giwa text-hanji/80">
      <Container>
        <div className="flex flex-col gap-10 py-14 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-2xl font-bold text-hanji">
                수려화
              </span>
              <span className="text-xs text-hwangto">秀麗花</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-hanji/70">
              전통의 결을 오늘의 삶에 맞춰 짓는 한복 공방. 한 벌의 옷이 오래
              곁에 남기를 바랍니다.
            </p>
          </div>

          <nav className="flex flex-col gap-3" aria-label="푸터 메뉴">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-hanji/70 transition-colors duration-200 hover:text-hwangto"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-2 border-t border-hanji/15 py-6 text-xs text-hanji/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {2026} 수려화 한복 공방. All rights reserved.</p>
          <p>서울특별시 종로구 북촌로 11길 24</p>
        </div>
      </Container>
    </footer>
  );
}
