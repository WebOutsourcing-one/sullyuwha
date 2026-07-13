import Link from "next/link";
import { Container } from "@/presentation/components/ui/Container";

export default function ProductNotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-6 py-24 text-center">
      <span className="u-label">NOT FOUND</span>
      <h1 className="text-[clamp(1.9rem,4vw,3rem)] font-light">
        찾으시는 제품이 없습니다
      </h1>
      <p className="text-taupe">
        주소가 바뀌었거나 더 이상 제공하지 않는 품목일 수 있습니다.
      </p>
      <Link
        href="/#collection"
        className="mt-2 rounded-sm border border-charcoal px-8 py-3.5 text-xs uppercase tracking-[0.12em] text-charcoal transition-colors duration-[320ms] ease-silk hover:bg-charcoal hover:text-ivory"
      >
        컬렉션으로 돌아가기
      </Link>
    </Container>
  );
}
