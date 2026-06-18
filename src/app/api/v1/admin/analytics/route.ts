import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/auth/permissions";
import prisma from "@/lib/db";
import type { UserRole } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !hasPermission(session.user.role as UserRole, "analytics:read")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const period = searchParams.get("period") || "30d";

    const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
    const dateFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      totalRevenue,
      totalOrders,
      totalCustomers,
      newCustomers,
      topProducts,
      revenueByDay,
      ordersByStatus,
      lowStockCount,
    ] = await Promise.all([
      // Total revenue
      prisma.order
        .aggregate({
          where: {
            status: {
              in: [
                "PAID",
                "PROCESSING",
                "PACKED",
                "SHIPPED",
                "DELIVERED",
              ],
            },
            createdAt: { gte: dateFrom },
          },
          _sum: { total: true },
          _count: true,
        }),

      // Total orders
      prisma.order.count({ where: { createdAt: { gte: dateFrom } } }),

      // Total customers
      prisma.user.count({ where: { role: "CUSTOMER", deletedAt: null } }),

      // New customers in period
      prisma.user.count({
        where: { role: "CUSTOMER", createdAt: { gte: dateFrom } },
      }),

      // Top products
      prisma.orderItem.groupBy({
        by: ["productId", "productName"],
        where: {
          order: {
            createdAt: { gte: dateFrom },
            status: {
              in: ["PAID", "PROCESSING", "PACKED", "SHIPPED", "DELIVERED"],
            },
          },
        },
        _sum: { quantity: true, totalPrice: true },
        orderBy: { _sum: { totalPrice: "desc" } },
        take: 10,
      }),

      // Revenue by day
      prisma.$queryRaw<Array<{ date: string; revenue: number; orders: number }>>`
        SELECT
          DATE("createdAt")::text as date,
          SUM(total)::float as revenue,
          COUNT(*)::int as orders
        FROM "Order"
        WHERE "createdAt" >= ${dateFrom}
          AND status IN ('PAID','PROCESSING','PACKED','SHIPPED','DELIVERED')
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,

      // Orders by status
      prisma.order.groupBy({
        by: ["status"],
        _count: true,
      }),

      // Low stock products
      prisma.product.count({
        where: {
          deletedAt: null,
          status: "ACTIVE",
          stockQuantity: { lte: prisma.product.fields.lowStockThreshold },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        revenue: {
          total: totalRevenue._sum.total || 0,
          orderCount: totalRevenue._count,
          avgOrderValue:
            totalRevenue._count > 0
              ? parseFloat((totalRevenue._sum.total || 0).toString()) /
                totalRevenue._count
              : 0,
        },
        totalOrders,
        customers: {
          total: totalCustomers,
          new: newCustomers,
        },
        topProducts,
        revenueByDay,
        ordersByStatus,
        lowStockCount,
        period,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
