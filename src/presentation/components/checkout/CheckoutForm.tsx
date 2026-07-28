"use client";

import { useEffect, useRef, useState } from "react";
import {
  ANONYMOUS,
  loadTossPayments,
  type TossPaymentsWidgets,
} from "@tosspayments/tosspayments-sdk";
import { formatKrw } from "@/domain/value-objects/Money";
import { loadPublicEnv } from "@/infrastructure/config/env";

const MAX_QUANTITY = 10;

/**
 * 클라이언트 키는 빌드 타임에 인라인되는 상수라 모듈 스코프에서 한 번만 읽는다.
 * (컴포넌트 안에서 읽으면 이펙트가 동기적으로 setState를 호출하게 된다)
 */
const TOSS_CLIENT_KEY = loadPublicEnv().tossClientKey;

interface CheckoutFormProps {
  productId: string;
  unitPrice: number;
}

interface FormState {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingPostcode: string;
  shippingAddress: string;
  shippingDetail: string;
  shippingMemo: string;
}

const EMPTY_FORM: FormState = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  shippingPostcode: "",
  shippingAddress: "",
  shippingDetail: "",
  shippingMemo: "",
};

export function CheckoutForm({ productId, unitPrice }: CheckoutFormProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [quantity, setQuantity] = useState(1);
  const [widgets, setWidgets] = useState<TossPaymentsWidgets | null>(null);
  const [widgetError, setWidgetError] = useState<string | null>(
    TOSS_CLIENT_KEY
      ? null
      : "결제 모듈이 설정되지 않았습니다. NEXT_PUBLIC_TOSS_CLIENT_KEY를 확인해 주세요.",
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 위젯 렌더는 한 번만. StrictMode의 이중 마운트에서 중복 렌더를 막는다.
  const renderedRef = useRef(false);

  const amount = unitPrice * quantity;

  const set =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  useEffect(() => {
    if (!TOSS_CLIENT_KEY) return;
    if (renderedRef.current) return;
    renderedRef.current = true;

    let canceled = false;

    (async () => {
      try {
        const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
        // 비회원 주문이 기본이라 고객 식별키를 만들지 않는다.
        // 카드 저장·자동결제를 붙일 때 실제 키로 바꾸면 된다.
        const instance = tossPayments.widgets({ customerKey: ANONYMOUS });

        // 반드시 setAmount가 먼저다 — 금액 없이 결제수단을 렌더하면 위젯이 거부한다.
        await instance.setAmount({ currency: "KRW", value: unitPrice });
        if (canceled) return;

        await Promise.all([
          instance.renderPaymentMethods({
            selector: "#toss-payment-methods",
            variantKey: "DEFAULT",
          }),
          instance.renderAgreement({
            selector: "#toss-agreement",
            variantKey: "AGREEMENT",
          }),
        ]);
        if (canceled) return;

        setWidgets(instance);
      } catch (e) {
        console.error("[checkout] 결제위젯 초기화 실패", e);
        setWidgetError("결제 모듈을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      }
    })();

    return () => {
      canceled = true;
    };
  }, [unitPrice]);

  // 수량이 바뀌면 위젯 금액도 따라가야 한다.
  useEffect(() => {
    if (!widgets) return;
    widgets.setAmount({ currency: "KRW", value: amount }).catch((e) => {
      console.error("[checkout] 금액 변경 실패", e);
    });
  }, [widgets, amount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!widgets || submitting) return;

    setError(null);
    setSubmitting(true);

    try {
      // 1) 서버에 주문서를 만든다. 금액은 보내지 않는다 —
      //    서버가 DB 가격으로 계산한 값을 돌려주고, 그 값이 승인 기준이 된다.
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity, ...form }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "주문서를 만들지 못했습니다.");
        setSubmitting(false);
        return;
      }

      // 2) 화면에 띄운 금액과 서버가 계산한 금액이 다르면(가격이 방금 바뀐 경우)
      //    그대로 진행하지 않는다. 위젯 금액을 서버 값으로 맞추고 다시 확인받는다.
      if (data.amount !== amount) {
        await widgets.setAmount({ currency: "KRW", value: data.amount });
        setError(
          `상품 가격이 변경되었습니다. 결제 금액을 ${formatKrw(data.amount)}으로 갱신했습니다. 확인 후 다시 시도해 주세요.`,
        );
        setSubmitting(false);
        return;
      }

      // 수량 변경 직후 제출하면 위젯의 setAmount가 아직 끝나지 않았을 수 있다.
      // 서버가 확정한 금액으로 한 번 더 맞추고 나서 결제창을 연다.
      await widgets.setAmount({ currency: "KRW", value: data.amount });

      // 3) 결제창으로 넘어간다. 이 호출 이후에는 토스가 successUrl/failUrl로 리다이렉트한다.
      await widgets.requestPayment({
        orderId: data.orderNumber,
        orderName: data.orderName,
        successUrl: `${window.location.origin}/checkout/success`,
        failUrl: `${window.location.origin}/checkout/fail`,
        customerName: form.customerName,
        customerEmail: form.customerEmail || undefined,
        customerMobilePhone: form.customerPhone.replace(/[^0-9]/g, "") || undefined,
      });
    } catch (e) {
      // 사용자가 결제창을 닫은 경우도 여기로 온다.
      const message =
        e && typeof e === "object" && "message" in e
          ? String((e as { message: unknown }).message)
          : "결제를 진행하지 못했습니다.";
      setError(message);
      setSubmitting(false);
    }
  };

  if (widgetError) {
    return (
      <p className="rounded-sm border border-line bg-mist/60 px-5 py-4 text-sm text-taupe">
        {widgetError}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-10">
      <section className="flex flex-col gap-5">
        <h2 className="text-xs uppercase tracking-[0.18em] text-gold">주문자</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="이름" required>
            <input
              value={form.customerName}
              onChange={set("customerName")}
              required
              autoComplete="name"
              className={inputCls}
              placeholder="홍길동"
            />
          </Field>
          <Field label="연락처" required help="'-' 없이 숫자만">
            <input
              value={form.customerPhone}
              onChange={set("customerPhone")}
              required
              inputMode="numeric"
              autoComplete="tel"
              className={inputCls}
              placeholder="01012345678"
            />
          </Field>
        </div>
        <Field label="이메일" help="결제 영수증을 받으실 주소(선택)">
          <input
            type="email"
            value={form.customerEmail}
            onChange={set("customerEmail")}
            autoComplete="email"
            className={inputCls}
            placeholder="name@example.com"
          />
        </Field>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-xs uppercase tracking-[0.18em] text-gold">배송지</h2>
        <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
          <Field label="우편번호">
            <input
              value={form.shippingPostcode}
              onChange={set("shippingPostcode")}
              inputMode="numeric"
              autoComplete="postal-code"
              className={inputCls}
              placeholder="04524"
            />
          </Field>
          <Field label="주소" required>
            <input
              value={form.shippingAddress}
              onChange={set("shippingAddress")}
              required
              autoComplete="street-address"
              className={inputCls}
              placeholder="서울특별시 성동구 성수이로 12"
            />
          </Field>
        </div>
        <Field label="상세 주소">
          <input
            value={form.shippingDetail}
            onChange={set("shippingDetail")}
            className={inputCls}
            placeholder="2층"
          />
        </Field>
        <Field label="배송 메모">
          <textarea
            value={form.shippingMemo}
            onChange={set("shippingMemo")}
            rows={2}
            className={inputCls}
            placeholder="부재 시 연락 부탁드립니다"
          />
        </Field>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-xs uppercase tracking-[0.18em] text-gold">수량</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-line">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label="수량 줄이기"
              className="h-11 w-11 text-lg text-taupe transition-colors hover:text-charcoal disabled:opacity-30"
            >
              −
            </button>
            <span className="w-12 text-center text-sm text-charcoal" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))}
              disabled={quantity >= MAX_QUANTITY}
              aria-label="수량 늘리기"
              className="h-11 w-11 text-lg text-taupe transition-colors hover:text-charcoal disabled:opacity-30"
            >
              +
            </button>
          </div>
          <span className="text-sm text-taupe">
            {formatKrw(unitPrice)} × {quantity}
          </span>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xs uppercase tracking-[0.18em] text-gold">결제 수단</h2>
        {/* 토스 결제위젯이 이 두 노드 안에 iframe을 그린다. */}
        <div id="toss-payment-methods" />
        <div id="toss-agreement" />
      </section>

      <div className="flex flex-col gap-4 border-t border-line pt-8">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-taupe">총 결제 금액</span>
          <span className="font-serif text-2xl font-light text-charcoal">
            {formatKrw(amount)}
          </span>
        </div>

        {error && (
          <p role="alert" className="text-sm leading-relaxed text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!widgets || submitting}
          className="rounded-sm bg-charcoal px-8 py-4 text-xs uppercase tracking-[0.12em] text-ivory transition-colors duration-[320ms] ease-silk hover:bg-gold disabled:opacity-40"
        >
          {submitting ? "결제 진행 중…" : `${formatKrw(amount)} 결제하기`}
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full border border-line bg-ivory px-4 py-3 text-sm text-charcoal placeholder-taupe/50 transition-colors focus:border-gold focus:outline-none";

function Field({
  label,
  help,
  required,
  children,
}: {
  label: string;
  help?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-taupe">
        {label}
        {required && <span className="ml-1 text-gold">*</span>}
        {help && <span className="ml-2 text-taupe/70">— {help}</span>}
      </span>
      {children}
    </label>
  );
}
