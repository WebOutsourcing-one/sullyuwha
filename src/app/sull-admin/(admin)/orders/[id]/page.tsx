"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ORDER_STATUS_LABEL,
  type Order,
  type OrderStatus,
} from "@/domain/entities/Order";

const STATUS_STYLE: Record<OrderStatus, string> = {
  PENDING: "bg-neutral-100 text-neutral-600",
  WAITING_FOR_DEPOSIT: "bg-amber-50 text-amber-700",
  PAID: "bg-green-50 text-green-700",
  FAILED: "bg-red-50 text-red-600",
  CANCELED: "bg-neutral-100 text-neutral-400",
};

function formatDateTime(value: string | Date | undefined): string {
  if (!value) return "-";
  return new Date(value).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // setState는 프라미스 콜백 안에서만 부른다(react-hooks/set-state-in-effect).
  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/admin/orders/${params.id}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error("주문을 불러오지 못했습니다.");
        return res.json();
      })
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
        setLoading(false);
      });

    return () => controller.abort();
  }, [params.id]);

  const handleCancel = async () => {
    if (!order) return;
    const reason = prompt(
      `${order.amount.toLocaleString("ko-KR")}원을 전액 환불합니다.\n취소 사유를 입력하세요.`,
      "판매자 취소",
    );
    // prompt에서 취소를 누르면 null이다. 빈 문자열과 구분해야 한다.
    if (reason === null) return;

    setCanceling(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel", reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "취소에 실패했습니다.");
      setOrder(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "취소 중 오류가 발생했습니다.");
    } finally {
      setCanceling(false);
    }
  };

  if (loading) return <p className="text-neutral-500">불러오는 중...</p>;
  if (!order) return <p className="text-red-500">{error ?? "주문을 찾을 수 없습니다."}</p>;

  const cancelable = order.status === "PAID" || order.status === "WAITING_FOR_DEPOSIT";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <button
            type="button"
            onClick={() => router.push("/sull-admin/orders")}
            className="mb-2 text-sm text-neutral-400 transition-colors hover:text-neutral-600"
          >
            ← 주문 내역
          </button>
          <h1 className="font-serif text-2xl font-light">주문 상세</h1>
          <p className="mt-1 font-mono text-xs text-neutral-400">{order.orderNumber}</p>
        </div>
        <span className={`rounded px-3 py-1 text-xs ${STATUS_STYLE[order.status]}`}>
          {ORDER_STATUS_LABEL[order.status]}
        </span>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <Section title="주문 상품">
        <Row label="상품명" value={order.line.productName} />
        <Row
          label="상품 페이지"
          value={
            order.line.productId ? (
              <Link
                href={`/collection/${order.line.productId}`}
                className="text-neutral-600 underline"
              >
                {order.line.productId}
              </Link>
            ) : (
              // 상품이 삭제되면 FK가 null이 된다. 스냅샷 덕분에 이름·가격은 남는다.
              <span className="text-neutral-400">삭제된 상품</span>
            )
          }
        />
        <Row label="단가" value={`${order.line.unitPrice.toLocaleString("ko-KR")}원`} />
        <Row label="수량" value={`${order.line.quantity}개`} />
        <Row
          label="결제 금액"
          value={
            <strong className="text-neutral-900">
              {order.amount.toLocaleString("ko-KR")}원
            </strong>
          }
        />
      </Section>

      <Section title="주문자">
        <Row label="이름" value={order.customer.name} />
        <Row label="연락처" value={order.customer.phone} />
        <Row label="이메일" value={order.customer.email ?? "-"} />
        <Row
          label="계정"
          value={
            order.userId ? (
              <span className="font-mono text-xs">{order.userId}</span>
            ) : (
              <span className="text-neutral-400">비회원 주문</span>
            )
          }
        />
      </Section>

      <Section title="배송지">
        <Row label="우편번호" value={order.shipping.postcode ?? "-"} />
        <Row label="주소" value={order.shipping.address} />
        <Row label="상세 주소" value={order.shipping.detail ?? "-"} />
        <Row label="배송 메모" value={order.shipping.memo ?? "-"} />
      </Section>

      <Section title="결제">
        <Row label="결제 수단" value={order.payment.method ?? "-"} />
        <Row label="승인 일시" value={formatDateTime(order.payment.approvedAt)} />
        <Row
          label="결제 키"
          value={
            order.payment.paymentKey ? (
              <span className="font-mono text-xs">{order.payment.paymentKey}</span>
            ) : (
              "-"
            )
          }
        />
        <Row
          label="영수증"
          value={
            order.payment.receiptUrl ? (
              <a
                href={order.payment.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-600 underline"
              >
                영수증 보기
              </a>
            ) : (
              "-"
            )
          }
        />
        {order.payment.failCode && (
          <Row
            label="실패 사유"
            value={
              <span className="text-red-600">
                [{order.payment.failCode}] {order.payment.failMessage}
              </span>
            }
          />
        )}
        {order.payment.canceledAt && (
          <>
            <Row label="취소 일시" value={formatDateTime(order.payment.canceledAt)} />
            <Row label="취소 사유" value={order.payment.cancelReason ?? "-"} />
          </>
        )}
      </Section>

      <Section title="이력">
        <Row label="주문 일시" value={formatDateTime(order.createdAt)} />
        <Row label="최종 변경" value={formatDateTime(order.updatedAt)} />
      </Section>

      {cancelable && (
        <div className="mt-8 rounded-xl border border-red-100 bg-red-50/50 p-6">
          <h2 className="text-sm font-medium text-red-700">결제 취소</h2>
          <p className="mt-1.5 text-xs leading-relaxed text-red-600/80">
            토스페이먼츠로 전액 환불을 요청합니다. 되돌릴 수 없습니다.
          </p>
          <button
            type="button"
            onClick={handleCancel}
            disabled={canceling}
            className="mt-4 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {canceling ? "취소 처리 중..." : "전액 환불하기"}
          </button>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6 rounded-xl border border-neutral-200 bg-white p-6">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-400">
        {title}
      </h2>
      <dl className="divide-y divide-neutral-100">{children}</dl>
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-4 py-2.5">
      <dt className="w-28 shrink-0 text-xs text-neutral-400">{label}</dt>
      <dd className="text-sm text-neutral-700">{value}</dd>
    </div>
  );
}
