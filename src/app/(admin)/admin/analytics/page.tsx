import type { Metadata } from "next";
import { AdminAnalyticsDashboard } from "@/components/admin/analytics-dashboard";

export const metadata: Metadata = { title: "Analytics | Admin" };

export default function AdminAnalyticsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm">
          Track revenue, orders, and business performance
        </p>
      </div>
      <AdminAnalyticsDashboard />
    </div>
  );
}
