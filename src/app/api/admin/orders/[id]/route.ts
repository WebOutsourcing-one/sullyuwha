import { NextRequest, NextResponse } from "next/server";
import { container } from "@/composition/container";
import { requireAdmin } from "@/lib/require-admin";
import { denyCrossOrigin } from "@/lib/same-origin";

type RouteParams = { params: Promise<{ id: string }> };

/** 주문 상세. */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const order = await container.getOrder.execute(id);
  if (!order) {
    return NextResponse.json({ error: "주문을 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json(order);
}

/**
 * 결제 취소(전액 환불).
 *
 * 되돌릴 수 없는 동작이라 관리자 세션을 반드시 확인한다.
 * `requireAdmin`이 없으면 주문 id만 아는 누구나 환불을 걸 수 있다.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  // 관리자 쿠키를 노린 교차 출처 호출을 먼저 끊는다.
  // request.json()은 Content-Type을 보지 않으므로 단순 폼 POST로도 호출될 수 있다.
  const crossOrigin = denyCrossOrigin(request);
  if (crossOrigin) return crossOrigin;

  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    /* 본문 없이 호출해도 기본 사유로 처리한다 */
  }

  const input = body as Record<string, unknown>;
  if (input.action !== "cancel") {
    return NextResponse.json({ error: "지원하지 않는 동작입니다." }, { status: 400 });
  }

  const reason = typeof input.reason === "string" ? input.reason : "";
  const result = await container.cancelPayment.execute(id, reason);

  if (!result.ok) {
    const { failure } = result;
    switch (failure.kind) {
      case "ORDER_NOT_FOUND":
        return NextResponse.json({ error: "주문을 찾을 수 없습니다." }, { status: 404 });
      case "NOT_CANCELABLE":
        return NextResponse.json({ error: failure.message }, { status: 409 });
      case "GATEWAY_ERROR":
        return NextResponse.json(
          { error: failure.message, code: failure.code },
          { status: 502 },
        );
    }
  }

  return NextResponse.json(result.order);
}
