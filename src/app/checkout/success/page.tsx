import type { Metadata } from "next";
import Link from "next/link";
import { container } from "@/composition/container";
import { ORDER_STATUS_LABEL } from "@/domain/entities/Order";
import { formatKrw } from "@/domain/value-objects/Money";
import { Container } from "@/presentation/components/ui/Container";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// 승인은 매 요청 실행돼야 한다. 캐시되면 결제가 반영되지 않는다.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "결제 완료 | 설유화",
  robots: { index: false, follow: false },
};

function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

/**
 * 토스가 결제창을 통과한 뒤 리다이렉트하는 곳.
 *
 * 여기서 승인을 호출한다 — 이 호출이 성공해야 실제로 결제가 완결된다.
 * 리다이렉트만으로는 결제가 끝난 것이 아니라는 점이 중요하다.
 *
 * 새로고침으로 승인이 다시 호출될 수 있으므로 유스케이스가 멱등하게 처리한다.
 */
export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const orderNumber = one(params.orderId);
  const paymentKey = one(params.paymentKey);
  const amount = Number(one(params.amount));

  // amount는 0보다 커야 한다. 빈 값이면 Number("")가 0이 되어 그대로 통과하고,
  // 금액 불일치로 판정되어 멀쩡한 주문이 실패로 기록된다.
  if (!orderNumber || !paymentKey || !Number.isSafeInteger(amount) || amount <= 0) {
    return (
      <Result
        tone="fail"
        title="결제 정보를 확인할 수 없습니다"
        message="필요한 결제 정보가 전달되지 않았습니다. 결제가 진행되었다면 고객센터로 문의해 주세요."
      />
    );
  }

  let result: Awaited<ReturnType<typeof container.confirmPayment.execute>>;
  try {
    result = await container.confirmPayment.execute({
      orderNumber,
      paymentKey,
      amount,
    });
  } catch (error) {
    // DB 장애 등으로 승인 처리가 끝까지 가지 못한 경우. 결제됐을 수도 있으므로
    // "실패"라고 단정하지 않는다.
    console.error("[checkout] 승인 처리 중 예외", orderNumber, error);
    return (
      <Result
        tone="pending"
        title="결제 결과를 확인하고 있습니다"
        message="처리에 시간이 걸리고 있습니다. 결제가 완료되었을 수 있으니 중복 결제를 피하시고, 잠시 후 문의해 주세요."
        orderNumber={orderNumber}
      />
    );
  }

  if (!result.ok) {
    // 승인 여부를 알 수 없는 경우(타임아웃·네트워크·토스 장애)에는 실패로 안내하면 안 된다.
    // 이미 결제된 건을 실패로 알리면 고객이 다시 결제해 중복 결제가 난다.
    if (result.failure.kind === "INDETERMINATE") {
      return (
        <Result
          tone="pending"
          title="결제 결과를 확인하고 있습니다"
          message="결제사 응답이 지연되고 있습니다. 결제가 완료되었을 수 있으니 다시 결제하지 마시고, 잠시 후 주문 상태를 확인하거나 문의해 주세요."
          orderNumber={orderNumber}
        />
      );
    }

    const message =
      result.failure.kind === "GATEWAY_ERROR"
        ? result.failure.message
        : result.failure.kind === "AMOUNT_MISMATCH"
          ? "결제 금액이 주문 금액과 일치하지 않아 승인을 중단했습니다."
          : "결제를 승인하지 못했습니다.";

    return (
      <Result
        tone="fail"
        title="결제를 완료하지 못했습니다"
        message={message}
        orderNumber={orderNumber}
      />
    );
  }

  const { order } = result;
  const waiting = order.status === "WAITING_FOR_DEPOSIT";

  return (
    <Result
      tone="success"
      title={waiting ? "입금을 기다리고 있습니다" : "결제가 완료되었습니다"}
      message={
        waiting
          ? "발급된 가상계좌로 입금이 확인되면 주문이 확정됩니다."
          : "주문해 주셔서 감사합니다. 준비가 되는 대로 연락드리겠습니다."
      }
      orderNumber={order.orderNumber}
      rows={[
        { label: "주문 상품", value: order.orderName },
        { label: "결제 금액", value: formatKrw(order.amount) },
        { label: "결제 수단", value: order.payment.method ?? "-" },
        { label: "주문 상태", value: ORDER_STATUS_LABEL[order.status] },
      ]}
      receiptUrl={order.payment.receiptUrl}
    />
  );
}

function Result({
  tone,
  title,
  message,
  orderNumber,
  rows,
  receiptUrl,
}: {
  /** pending = 승인 여부 불명. 실패로 단정하지 않는 상태다. */
  tone: "success" | "fail" | "pending";
  title: string;
  message: string;
  orderNumber?: string;
  rows?: { label: string; value: string }[];
  receiptUrl?: string;
}) {
  return (
    <Container className="flex flex-col items-center py-24 text-center md:py-32">
      <span
        aria-hidden
        className={`block h-px w-12 ${tone === "fail" ? "bg-taupe" : "bg-gold"}`}
      />
      <h1 className="mt-8 text-[clamp(1.75rem,3.5vw,2.5rem)] font-light">{title}</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-taupe">{message}</p>

      {orderNumber && (
        <p className="mt-6 font-mono text-xs text-taupe/80">주문번호 {orderNumber}</p>
      )}

      {rows && rows.length > 0 && (
        <dl className="mt-10 w-full max-w-md divide-y divide-line border-y border-line text-left">
          {rows.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-4 py-3.5">
              <dt className="text-xs uppercase tracking-[0.1em] text-gold">{row.label}</dt>
              <dd className="text-sm text-charcoal">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link
          href="/#collection"
          className="rounded-sm bg-charcoal px-8 py-3.5 text-xs uppercase tracking-[0.12em] text-ivory transition-colors duration-[320ms] ease-silk hover:bg-gold"
        >
          컬렉션 보기
        </Link>
        {receiptUrl && (
          <a
            href={receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm border border-charcoal px-8 py-3.5 text-xs uppercase tracking-[0.12em] text-charcoal transition-colors duration-[320ms] ease-silk hover:bg-charcoal hover:text-ivory"
          >
            영수증
          </a>
        )}
      </div>
    </Container>
  );
}
