import { NextRequest, NextResponse } from "next/server";
import { container } from "@/composition/container";
import { requireAdmin } from "@/lib/require-admin";
import { isOrderStatus } from "@/domain/entities/Order";

/** 관리자 주문 내역 목록. */
export async function GET(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const params = request.nextUrl.searchParams;
  const statusParam = params.get("status");
  const status = isOrderStatus(statusParam) ? statusParam : undefined;

  const limit = toPositiveInt(params.get("limit")) ?? 50;
  const offset = toPositiveInt(params.get("offset")) ?? 0;

  const { orders, total } = await container.listOrders.execute({
    status,
    limit,
    offset,
  });

  return NextResponse.json({ orders, total });
}

function toPositiveInt(value: string | null): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isSafeInteger(n) && n >= 0 ? n : undefined;
}
