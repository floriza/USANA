import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { orderRepository } from "@/repositories/order.repository";
import { hasPermission } from "@/lib/auth/permissions";
import type { OrderStatus, UserRole } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !hasPermission(session.user.role as UserRole, "orders:read:all")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;

    const result = await orderRepository.findAll({
      status: (searchParams.get("status") as OrderStatus) || undefined,
      search: searchParams.get("search") || undefined,
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 20),
      dateFrom: searchParams.get("dateFrom")
        ? new Date(searchParams.get("dateFrom")!)
        : undefined,
      dateTo: searchParams.get("dateTo")
        ? new Date(searchParams.get("dateTo")!)
        : undefined,
    });

    return NextResponse.json({ success: true, data: result });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
