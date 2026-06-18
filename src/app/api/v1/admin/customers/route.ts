import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/auth/permissions";
import prisma from "@/lib/db";
import { paginate, buildPaginationMeta } from "@/lib/utils";
import type { UserRole } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role as UserRole, "customers:read")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);
    const search = searchParams.get("search") || undefined;
    const { skip, take } = paginate(page, limit);

    const where = {
      role: "CUSTOMER" as const,
      deletedAt: null as null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          createdAt: true,
          lastLoginAt: true,
          _count: { select: { orders: true } },
          rewardPoints: { select: { balance: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: { customers, meta: buildPaginationMeta(total, page, limit) } });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
