import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { container } from "@/composition/container";
import { auth } from "@/lib/auth";
import { ORDER_STATUS_LABEL } from "@/domain/entities/Order";
import { formatKrw } from "@/domain/value-objects/Money";
import { Container } from "@/presentation/components/ui/Container";
import { LoginRequired } from "@/presentation/components/checkout/LoginRequired";

interface PageProps {
  params: Promise<{ orderNumber: string }>;
}

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "주문 상세 | 설유화",
  robots: { index: false, follow: false },
};

function formatDateTime(value?: Date): string {
  if (!value) return "-";
  return new Date(value).toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function MyOrderDetailPage({ params }: PageProps) {
  const { orderNumber } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <Container className="py-20 md:py-28">
        <h1 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-light">주문 상세</h1>
        <div className="mt-10 max-w-xl">
          <LoginRequired callbackUrl={`/orders/${orderNumber}`} />
        </div>
      </Container>
    );
  }

  // 소유자가 아니면 null이 온다 — 없는 주문과 남의 주문을 구분해 보여주지 않는다.
  const order = await container.getMyOrder.execute(orderNumber, userId);
  if (!order) notFound();

  return (
    <Container className="py-20 md:py-28">
      <nav className="flex items-center gap-2 text-xs text-taupe" aria-label="위치">
        <Link href="/orders" className="transition-colors hover:text-charcoal">
          주문 내역
        </Link>
        <span aria-hidden className="text-line">
          /
        </span>
        <span className="text-charcoal/70">주문 상세</span>
      </nav>

      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-light">
          {order.orderName}
        </h1>
        <span className="text-xs uppercase tracking-[0.14em] text-gold">
          {ORDER_STATUS_LABEL[order.status]}
        </span>
      </div>
      <p className="mt-2 font-mono text-xs text-taupe/70">{order.orderNumber}</p>

      <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-16">
        <Section title="주문 상품">
          <Row label="상품" value={order.line.productName} />
          <Row label="단가" value={formatKrw(order.line.unitPrice)} />
          <Row label="수량" value={`${order.line.quantity}개`} />
          <Row label="결제 금액" value={formatKrw(order.amount)} emphasis />
          {order.line.productId && (
            <Row
              label="상품 페이지"
              value={
                <Link
                  href={`/collection/${order.line.productId}`}
                  className="border-b border-line pb-0.5 transition-colors hover:border-gold hover:text-charcoal"
                >
                  다시 보기
                </Link>
              }
            />
          )}
        </Section>

        <Section title="결제">
          <Row label="결제 수단" value={order.payment.method ?? "-"} />
          <Row label="주문 일시" value={formatDateTime(order.createdAt)} />
          <Row label="승인 일시" value={formatDateTime(order.payment.approvedAt)} />
          {order.payment.canceledAt && (
            <Row label="취소 일시" value={formatDateTime(order.payment.canceledAt)} />
          )}
          {order.payment.receiptUrl && (
            <Row
              label="영수증"
              value={
                <a
                  href={order.payment.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-b border-line pb-0.5 transition-colors hover:border-gold hover:text-charcoal"
                >
                  영수증 보기
                </a>
              }
            />
          )}
        </Section>

        <Section title="주문자">
          <Row label="이름" value={order.customer.name} />
          <Row label="연락처" value={order.customer.phone} />
          <Row label="이메일" value={order.customer.email ?? "-"} />
        </Section>

        <Section title="배송지">
          <Row label="우편번호" value={order.shipping.postcode ?? "-"} />
          <Row label="주소" value={order.shipping.address} />
          <Row label="상세 주소" value={order.shipping.detail ?? "-"} />
          <Row label="배송 메모" value={order.shipping.memo ?? "-"} />
        </Section>
      </div>

      <div className="mt-14 border-t border-line pt-8">
        <p className="text-sm leading-relaxed text-taupe">
          주문 변경이나 취소가 필요하시면 문의로 연락 주세요. 맞춤 제작 특성상
          제작이 시작된 이후에는 변경이 어려울 수 있습니다.
        </p>
        <Link
          href="/#contact"
          className="mt-5 inline-block rounded-sm border border-charcoal px-8 py-3.5 text-xs uppercase tracking-[0.12em] text-charcoal transition-colors duration-[320ms] ease-silk hover:bg-charcoal hover:text-ivory"
        >
          문의하기
        </Link>
      </div>
    </Container>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xs uppercase tracking-[0.18em] text-gold">{title}</h2>
      <dl className="mt-5 flex flex-col divide-y divide-line border-y border-line">
        {children}
      </dl>
    </section>
  );
}

function Row({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: React.ReactNode;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-4 py-3">
      <dt className="w-24 shrink-0 text-xs text-taupe">{label}</dt>
      <dd className={emphasis ? "text-base text-charcoal" : "text-sm text-charcoal/85"}>
        {value}
      </dd>
    </div>
  );
}
