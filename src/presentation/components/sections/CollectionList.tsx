import Link from "next/link";
import type { Product } from "@/domain/entities/Product";
import { Container } from "../ui/Container";
import { ProductCard } from "../ui/ProductCard";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

interface CollectionListProps {
  /** 전체 품목 — 최신순(`getCollection()`의 계약)으로 그대로 늘어놓는다. */
  products: readonly Product[];
}

/** 그리드 열 수 — Reveal의 계단식 지연과 맞춘다(줄이 바뀌면 지연도 처음으로 돌아간다). */
const COLUMNS = 3;

/**
 * 전체 컬렉션 목록 페이지.
 *
 * 홈의 CollectionSection이 분류 카드와 베스트만 추려 보여주는 반면 여기는 전부 내건다.
 * 분류별로 나누지 않고 최신순 한 줄기로 두는 이유 — 품목이 아직 적어서 나누면
 * 한두 개짜리 그룹이 여러 개 생기고, 그러면 새로 올린 작업이 어디 있는지 오히려 찾기 어렵다.
 */
export function CollectionList({ products }: CollectionListProps) {
  return (
    <>
      <Container>
        <nav
          className="flex items-center gap-2 pt-10 text-xs text-taupe md:pt-14"
          aria-label="위치"
        >
          <Link href="/" className="transition-colors hover:text-charcoal">
            홈
          </Link>
          <span aria-hidden className="text-line">
            /
          </span>
          <span className="text-charcoal/70">컬렉션</span>
        </nav>
      </Container>

      <section className="u-section pt-8" aria-labelledby="collection-all-title">
        <Container>
          <SectionHeading
            eyebrow="COLLECTION"
            title="전체 컬렉션"
            titleId="collection-all-title"
            subcopy="설유화가 지은 예복을 한자리에서 만나보세요."
          />

          {products.length > 0 ? (
            <ul className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product, i) => (
                <li key={product.id}>
                  <Reveal delay={(i % COLUMNS) * 90}>
                    {/* 첫 줄은 화면에 바로 걸리는 자리라 미리 받는다 — 나머지는 스크롤에 맡긴다. */}
                    <ProductCard product={product} priority={i < COLUMNS} />
                  </Reveal>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-16 text-center text-sm leading-relaxed text-taupe">
              준비 중인 컬렉션입니다.
              <br />
              맞춤 예복은 언제든 문의해 주세요.
            </p>
          )}
        </Container>
      </section>
    </>
  );
}
