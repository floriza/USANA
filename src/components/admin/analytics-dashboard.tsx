"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

export function AdminAnalyticsDashboard() {
  const [period, setPeriod] = useState("30d");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics", period],
    queryFn: async () => {
      const res = await fetch(`/api/v1/admin/analytics?period=${period}`);
      const json = await res.json();
      return json.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-2xl h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  const revenueData = data?.revenueByDay || [];

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex gap-2">
        {["7d", "30d", "90d"].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              period === p
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : "90 Days"}
          </button>
        ))}
      </div>

      {/* Revenue stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatCurrency(data?.revenue?.total || 0)}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {data?.totalOrders || 0}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Avg Order Value</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatCurrency(data?.revenue?.avgOrderValue || 0)}
          </p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-bold text-gray-900 mb-4">Revenue Over Time</h2>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1a56db" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#1a56db" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => v.slice(5)}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
              labelStyle={{ fontSize: 12 }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#1a56db"
              strokeWidth={2}
              fill="url(#revGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Top Products */}
      {data?.topProducts?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-gray-900 mb-4">Top Products</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={data.topProducts.slice(0, 7)}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`}
              />
              <YAxis
                type="category"
                dataKey="productName"
                width={130}
                tick={{ fontSize: 11 }}
                tickFormatter={(v: string) => v.slice(0, 18) + (v.length > 18 ? "…" : "")}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
              />
              <Bar
                dataKey="_sum.totalPrice"
                fill="#1a56db"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Customer Growth */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-gray-900 mb-3">Customer Overview</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Customers</span>
              <span className="font-semibold">
                {data?.customers?.total || 0}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">New ({period})</span>
              <span className="font-semibold text-green-600">
                +{data?.customers?.new || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-gray-900 mb-3">Orders by Status</h2>
          <div className="space-y-1.5">
            {data?.ordersByStatus?.map(
              (item: { status: string; _count: number }) => (
                <div key={item.status} className="flex justify-between text-sm">
                  <span className="text-gray-500">{item.status}</span>
                  <span className="font-semibold">{item._count}</span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
