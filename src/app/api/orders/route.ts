import { NextRequest, NextResponse } from "next/server";
import { container } from "@/composition/container";
import { auth } from "@/lib/auth";
import { getPrisma } from "@/infrastructure/db/prisma";
import { denyCrossOrigin } from "@/lib/same-origin";
import { enforceRateLimit } from "@/lib/rate-limit";

/** 본문이 아무리 커도 주문서 하나에 필요한 양은 이 정도면 충분하다. */
const MAX_BODY_BYTES = 8 * 1024;

/**
 * 결제 전 주문서를 만든다. **로그인이 필요하다.**
 *
 * 금액은 받지 않는다 — 상품 id와 수량만 받고 서버가 DB 가격으로 계산한다.
 * 응답의 amount는 결제위젯에 넘길 값이자, 승인 단계에서 대조할 기준값이다.
 */
export async function POST(request: NextRequest) {
  const crossOrigin = denyCrossOrigin(request);
  if (crossOrigin) return crossOrigin;

  const limited = enforceRateLimit(request, {
    name: "orders",
    perIp: 10,
    global: 120,
    windowMs: 60_000,
  });
  if (limited) return limited;

  // 로그인 필수. 주문은 반드시 계정에 붙어야 이후 본인이 조회할 수 있다.
  const userId = await resolveUserId();
  if (!userId) {
    return NextResponse.json(
      { error: "로그인이 필요합니다.", code: "UNAUTHENTICATED" },
      { status: 401 },
    );
  }

  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "요청이 너무 큽니다." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const productId = typeof input.productId === "string" ? input.productId : "";
  if (!productId) {
    return NextResponse.json({ error: "상품을 지정해 주세요." }, { status: 400 });
  }

  let result: Awaited<ReturnType<typeof container.placeOrder.execute>>;
  try {
    result = await container.placeOrder.execute({
      productId,
      quantity: toQuantity(input.quantity),
      customer: {
        name: str(input.customerName),
        phone: str(input.customerPhone),
        email: str(input.customerEmail) || undefined,
      },
      shipping: {
        postcode: str(input.shippingPostcode) || undefined,
        address: str(input.shippingAddress),
        detail: str(input.shippingDetail) || undefined,
        memo: str(input.shippingMemo) || undefined,
      },
      userId,
    });
  } catch (error) {
    // DB 장애 등. 원문에는 스키마·접속 정보가 섞여 있으므로 그대로 내보내지 않는다.
    console.error("[orders] 주문 생성 실패", error);
    return NextResponse.json(
      { error: "주문을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }

  if (!result.ok) {
    const { failure } = result;
    switch (failure.kind) {
      case "PRODUCT_NOT_FOUND":
        return NextResponse.json({ error: "상품을 찾을 수 없습니다." }, { status: 404 });
      case "NOT_PURCHASABLE":
        return NextResponse.json({ error: failure.message }, { status: 409 });
      case "INVALID_INPUT":
        return NextResponse.json({ error: failure.message }, { status: 400 });
    }
  }

  const { order } = result;
  // 결제위젯에 필요한 값만 내려보낸다. 주문자·배송지는 되돌려줄 이유가 없다.
  return NextResponse.json(
    {
      orderNumber: order.orderNumber,
      orderName: order.orderName,
      amount: order.amount,
    },
    { status: 201 },
  );
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** 문자열로 온 수량도 받아준다. 해석할 수 없으면 1로 둔다(유스케이스가 다시 검증한다). */
function toQuantity(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const n = Number(value.trim());
    if (Number.isFinite(n)) return n;
  }
  return 1;
}

/**
 * 로그인한 사용자 id. 세션이 없거나 DB에 없는 계정이면 null.
 *
 * DB에 실재하는지 한 번 확인하는 이유 — 세션은 JWT라 DB가 초기화되거나
 * 사용자가 삭제돼도 한동안 살아 있다. 없는 id를 그대로 쓰면 주문 생성이
 * 외래키 위반으로 500이 된다. 여기서 걸러 401로 안내한다.
 */
async function resolveUserId(): Promise<string | null> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;

  try {
    const user = await getPrisma().user.findUnique({
      where: { id },
      select: { id: true },
    });
    return user?.id ?? null;
  } catch (error) {
    console.error("[orders] 사용자 확인 실패", error);
    return null;
  }
}
