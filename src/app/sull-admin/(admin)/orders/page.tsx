"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABEL,
  type Order,
  type OrderStatus,
} from "@/domain/entities/Order";

/** 상태별 배지 색. 결제 완료만 초록으로 눈에 띄게 둔다. */
const STATUS_STYLE: Record<OrderStatus, string> = {
  PENDING: "bg-neutral-100 text-neutral-600",
  WAITING_FOR_DEPOSIT: "bg-amber-50 text-amber-700",
  PAID: "bg-green-50 text-green-700",
  FAILED: "bg-red-50 text-red-600",
  CANCELED: "bg-neutral-100 text-neutral-400",
};

function formatDateTime(value: string | Date): string {
  return new Date(value).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<OrderStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  // setState는 전부 프라미스 콜백 안에서만 부른다 — 이펙트 본문에서 동기적으로
  // 호출하면 연쇄 렌더가 난다(react-hooks/set-state-in-effect).
  // AbortController는 필터를 빠르게 바꿨을 때 이전 응답이 나중에 도착해
  // 목록을 덮어쓰는 경쟁도 함께 막는다.
  useEffect(() => {
    const controller = new AbortController();
    const query = status === "ALL" ? "" : `?status=${status}`;

    fetch(`/api/admin/orders${query}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error("주문 목록을 불러오지 못했습니다.");
        return res.json();
      })
      .then((data) => {
        setOrders(data.orders ?? []);
        setTotal(data.total ?? 0);
        setError(null);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
        setLoading(false);
      });

    return () => controller.abort();
  }, [status, reloadToken]);

  const refresh = () => {
    setLoading(true);
    setReloadToken((t) => t + 1);
  };

  const changeStatus = (next: OrderStatus | "ALL") => {
    setLoading(true);
    setStatus(next);
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-light">주문 내역</h1>
          <p className="mt-1 text-sm text-neutral-400">총 {total}건</p>
        </div>
        <button
          type="button"
          onClick={refresh}
          className="rounded-lg border border-neutral-200 px-4 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-50"
        >
          새로고침
        </button>
      </div>

      <div className="mb-5 flex flex-wrap gap-1.5">
        <FilterChip active={status === "ALL"} onClick={() => changeStatus("ALL")}>
          전체
        </FilterChip>
        {ORDER_STATUSES.map((s) => (
          <FilterChip key={s} active={status === s} onClick={() => changeStatus(s)}>
            {ORDER_STATUS_LABEL[s]}
          </FilterChip>
        ))}
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50">
              <th className="px-4 py-3 font-medium text-neutral-500">주문번호</th>
              <th className="px-4 py-3 font-medium text-neutral-500">상품</th>
              <th className="px-4 py-3 font-medium text-neutral-500">주문자</th>
              <th className="px-4 py-3 font-medium text-neutral-500">금액</th>
              <th className="px-4 py-3 font-medium text-neutral-500">상태</th>
              <th className="px-4 py-3 font-medium text-neutral-500">주문일시</th>
              <th className="w-20 px-4 py-3 font-medium text-neutral-500"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-neutral-100 transition-colors hover:bg-neutral-50"
              >
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-neutral-500">
                    {order.orderNumber}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="text-neutral-900">{order.line.productName}</div>
                  {order.line.quantity > 1 && (
                    <div className="mt-0.5 text-xs text-neutral-400">
                      수량 {order.line.quantity}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="text-neutral-900">{order.customer.name}</div>
                  <div className="mt-0.5 text-xs text-neutral-400">
                    {order.customer.phone}
                  </div>
                </td>
                <td className="px-4 py-3 text-neutral-900">
                  {order.amount.toLocaleString("ko-KR")}원
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${STATUS_STYLE[order.status]}`}
                  >
                    {ORDER_STATUS_LABEL[order.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-neutral-500">
                  {formatDateTime(order.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/sull-admin/orders/${order.id}`}
                    className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 transition-colors hover:bg-neutral-100"
                  >
                    상세
                  </Link>
                </td>
              </tr>
            ))}

            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-neutral-400">
                  주문이 없습니다.
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-neutral-400">
                  불러오는 중...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-xs transition-colors ${
        active
          ? "bg-neutral-900 text-white"
          : "border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
      }`}
    >
      {children}
    </button>
  );
}
