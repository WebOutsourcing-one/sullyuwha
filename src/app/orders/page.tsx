import type { Metadata } from "next";
import Link from "next/link";
import { container } from "@/composition/container";
import { auth } from "@/lib/auth";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/domain/entities/Order";
import { formatKrw } from "@/domain/value-objects/Money";
import { Container } from "@/presentation/components/ui/Container";
import { LoginRequired } from "@/presentation/components/checkout/LoginRequired";

// 본인의 주문만 보여주는 화면이라 캐시하면 안 된다.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "주문 내역 | 설유화",
  robots: { index: false, follow: false },
};

/** 상태 강조 색. 결제 완료만 금색으로, 취소·실패는 흐리게. */
const STATUS_TONE: Record<OrderStatus, string> = {
  PENDING: "text-taupe",
  WAITING_FOR_DEPOSIT: "text-gold",
  PAID: "text-gold",
  FAILED: "text-taupe/60",
  CANCELED: "text-taupe/60",
};

function formatDate(value: Date): string {
  return new Date(value).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function MyOrdersPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <Container className="py-20 md:py-28">
        <h1 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-light">주문 내역</h1>
        <div className="mt-10 max-w-xl">
          <LoginRequired callbackUrl="/orders" />
        </div>
      </Container>
    );
  }

  const { orders } = await container.getMyOrders.execute(userId);

  return (
    <Container className="py-20 md:py-28">
      <h1 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-light">주문 내역</h1>
      <p className="mt-3 text-sm text-taupe">
        {orders.length > 0
          ? `총 ${orders.length}건의 주문이 있습니다.`
          : "아직 주문하신 내역이 없습니다."}
      </p>

      {orders.length === 0 ? (
        <Link
          href="/#collection"
          className="mt-10 inline-block rounded-sm border border-charcoal px-8 py-3.5 text-xs uppercase tracking-[0.12em] text-charcoal transition-colors duration-[320ms] ease-silk hover:bg-charcoal hover:text-ivory"
        >
          컬렉션 둘러보기
        </Link>
      ) : (
        <ul className="mt-10 flex flex-col divide-y divide-line border-y border-line">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/orders/${order.orderNumber}`}
                className="group flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-[0.7rem] text-taupe/70">
                    {order.orderNumber}
                  </span>
                  <span className="font-serif text-lg font-light text-charcoal">
                    {order.orderName}
                  </span>
                  <span className="text-xs text-taupe">
                    {formatDate(order.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-start gap-1 sm:items-end">
                    <span
                      className={`text-xs uppercase tracking-[0.14em] ${STATUS_TONE[order.status]}`}
                    >
                      {ORDER_STATUS_LABEL[order.status]}
                    </span>
                    <span className="text-sm text-charcoal">
                      {formatKrw(order.amount)}
                    </span>
                  </div>
                  <span
                    aria-hidden
                    className="text-taupe transition-transform duration-300 ease-silk group-hover:translate-x-1"
                  >
                    →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
