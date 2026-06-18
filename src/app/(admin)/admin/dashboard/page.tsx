import type { Metadata } from "next";
import prisma from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import {
  ShoppingCart,
  DollarSign,
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = { title: "Dashboard | Admin" };

async function getDashboardStats() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [revenue, orders, customers, lowStock, recentOrders, pendingReviews] =
    await Promise.all([
      prisma.order.aggregate({
        where: {
          status: { in: ["PAID", "PROCESSING", "PACKED", "SHIPPED", "DELIVERED"] },
          createdAt: { gte: thirtyDaysAgo },
        },
        _sum: { total: true },
        _count: true,
      }),
      prisma.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.user.count({ where: { role: "CUSTOMER", deletedAt: null } }),
      prisma.product.count({
        where: {
          deletedAt: null,
          status: "ACTIVE",
          stockQuantity: { lte: 10 },
        },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          user: { select: { name: true, email: true } },
          payment: { select: { status: true } },
        },
      }),
      prisma.review.count({ where: { status: "PENDING_REVIEW" } }),
    ]);

  return { revenue, orders, customers, lowStock, recentOrders, pendingReviews };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  PAYMENT_PENDING: "bg-yellow-100 text-yellow-700",
  PAID: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function AdminDashboard() {
  const { revenue, orders, customers, lowStock, recentOrders, pendingReviews } =
    await getDashboardStats();

  const stats = [
    {
      label: "Revenue (30d)",
      value: formatCurrency(
        parseFloat((revenue._sum.total || 0).toString())
      ),
      icon: DollarSign,
      color: "bg-green-50 text-green-600",
      change: "+12%",
    },
    {
      label: "Orders (30d)",
      value: orders.toString(),
      icon: ShoppingCart,
      color: "bg-blue-50 text-blue-600",
      change: "+8%",
    },
    {
      label: "Total Customers",
      value: customers.toString(),
      icon: Users,
      color: "bg-purple-50 text-purple-600",
      change: "+5%",
    },
    {
      label: "Low Stock Items",
      value: lowStock.toString(),
      icon: Package,
      color: lowStock > 0 ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-600",
      change: lowStock > 0 ? "Needs attention" : "All good",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm">
            Welcome back! Here&apos;s what&apos;s happening today.
          </p>
        </div>
      </div>

      {/* Alert: Compliance & Low Stock */}
      {(lowStock > 0 || pendingReviews > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            {lowStock > 0 && (
              <p>
                ⚠️ <strong>{lowStock} products</strong> are running low on
                stock.{" "}
                <Link href="/admin/inventory" className="underline">
                  View inventory
                </Link>
              </p>
            )}
            {pendingReviews > 0 && (
              <p className="mt-1">
                📝 <strong>{pendingReviews} reviews</strong> pending moderation.{" "}
                <Link href="/admin/compliance" className="underline">
                  Review now
                </Link>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, color, change }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-gray-100 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                {change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-xs text-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {order.orderNumber}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.user.name || order.user.email}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      STATUS_COLORS[order.status] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {order.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatCurrency(parseFloat(order.total.toString()))}
                  </p>
                </div>
              </div>
            ))}
            {!recentOrders.length && (
              <p className="text-sm text-gray-500 text-center py-4">
                No orders yet
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Add Product", href: "/admin/products/new", emoji: "➕" },
              { label: "View Orders", href: "/admin/orders", emoji: "📦" },
              { label: "Inventory", href: "/admin/inventory", emoji: "📊" },
              { label: "Compliance", href: "/admin/compliance", emoji: "🛡️" },
              { label: "Analytics", href: "/admin/analytics", emoji: "📈" },
              { label: "Coupons", href: "/admin/coupons", emoji: "🎟️" },
            ].map(({ label, href, emoji }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors"
              >
                <span className="text-lg">{emoji}</span>
                <span className="text-sm font-medium text-gray-700">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
