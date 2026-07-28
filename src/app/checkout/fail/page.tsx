import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/presentation/components/ui/Container";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: "결제 실패 | 설유화",
  robots: { index: false, follow: false },
};

function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

/**
 * 결제창에서 실패하거나 사용자가 취소했을 때 토스가 보내는 곳.
 *
 * 이 시점에는 승인이 일어나지 않았으므로 결제된 금액은 없다.
 * 주문서는 PENDING으로 남아 있다가 그대로 방치된다 —
 * 사용자가 다시 시도하면 새 주문서가 만들어진다.
 */
export default async function CheckoutFailPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const code = one(params.code);
  const message = one(params.message);
  const orderNumber = one(params.orderId);

  return (
    <Container className="flex flex-col items-center py-24 text-center md:py-32">
      <span aria-hidden className="block h-px w-12 bg-taupe" />
      <h1 className="mt-8 text-[clamp(1.75rem,3.5vw,2.5rem)] font-light">
        결제가 완료되지 않았습니다
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-taupe">
        {message || "결제가 중단되었습니다. 다시 시도해 주세요."}
      </p>

      {(code || orderNumber) && (
        <p className="mt-6 font-mono text-xs text-taupe/70">
          {orderNumber && <>주문번호 {orderNumber}</>}
          {orderNumber && code && " · "}
          {code && <>오류 {code}</>}
        </p>
      )}

      <p className="mt-6 text-xs text-taupe/80">결제된 금액은 없습니다.</p>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link
          href="/#collection"
          className="rounded-sm bg-charcoal px-8 py-3.5 text-xs uppercase tracking-[0.12em] text-ivory transition-colors duration-[320ms] ease-silk hover:bg-gold"
        >
          컬렉션으로 돌아가기
        </Link>
        <Link
          href="/#contact"
          className="rounded-sm border border-charcoal px-8 py-3.5 text-xs uppercase tracking-[0.12em] text-charcoal transition-colors duration-[320ms] ease-silk hover:bg-charcoal hover:text-ivory"
        >
          문의하기
        </Link>
      </div>
    </Container>
  );
}
