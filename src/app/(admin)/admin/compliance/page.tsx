import type { Metadata } from "next";
import prisma from "@/lib/db";
import { ComplianceChecker } from "@/components/admin/compliance-checker";
import { AlertTriangle, ShieldCheck, Eye } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = { title: "Compliance | Admin" };

export default async function CompliancePage() {
  const [violations, pendingReviews, disclaimers] = await Promise.all([
    prisma.complianceCheck.count({ where: { isBlocked: true } }),
    prisma.review.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.complianceDisclaimer.findMany(),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Compliance Center
          </h1>
          <p className="text-gray-500 text-sm">
            USANA policy and FDA Philippines compliance management
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="font-bold text-red-700">{violations}</span>
          </div>
          <p className="text-sm text-red-600">Blocked Content Violations</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="w-5 h-5 text-yellow-700" />
            <span className="font-bold text-yellow-800">{pendingReviews}</span>
          </div>
          <p className="text-sm text-yellow-700">Reviews Pending Moderation</p>
          <Link
            href="/admin/compliance?tab=reviews"
            className="text-xs text-yellow-700 underline mt-1 block"
          >
            Moderate now
          </Link>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-5 h-5 text-green-600" />
            <span className="font-bold text-green-700">
              {disclaimers.length}
            </span>
          </div>
          <p className="text-sm text-green-600">Active Disclaimers</p>
        </div>
      </div>

      {/* USANA Compliance Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-800">
        <p className="font-semibold mb-1">
          Mandatory USANA Compliance Notices
        </p>
        <ul className="space-y-1 text-xs list-disc list-inside">
          <li>
            All product content must comply with USANA Health Sciences
            distributor policies
          </li>
          <li>
            No disease claims, drug claims, or guaranteed results are permitted
          </li>
          <li>
            FDA Philippines registration numbers must be displayed for all
            products
          </li>
          <li>
            Distributor disclosure must appear on all pages (&quot;Independent USANA
            Distributor&quot;)
          </li>
          <li>
            Health disclaimers must be visible on all product and promotional
            pages
          </li>
        </ul>
      </div>

      {/* Content checker */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="font-bold text-gray-900 mb-1">
          Content Compliance Checker
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Test content against USANA and FDA Philippines compliance rules
        </p>
        <ComplianceChecker />
      </div>

      {/* Pending Reviews */}
      <PendingReviews />
    </div>
  );
}

async function PendingReviews() {
  const reviews = await prisma.review.findMany({
    where: { status: "PENDING_REVIEW" },
    include: {
      user: { select: { name: true, email: true } },
      product: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "asc" },
    take: 10,
  });

  if (!reviews.length) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h2 className="font-bold text-gray-900 mb-4">
        Reviews Pending Moderation ({reviews.length})
      </h2>
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="border border-gray-100 rounded-xl p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {review.user.name || review.user.email} →{" "}
                  <span className="text-blue-600">{review.product.name}</span>
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {"★"
                    .repeat(review.rating)
                    .padEnd(5, "☆")
                    .split("")
                    .map((s, i) => (
                      <span
                        key={i}
                        className={
                          s === "★" ? "text-yellow-400" : "text-gray-200"
                        }
                      >
                        {s}
                      </span>
                    ))}
                </div>
                {review.title && (
                  <p className="text-sm font-medium mt-1">{review.title}</p>
                )}
                <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                  {review.body}
                </p>
                {review.complianceNote && (
                  <p className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded mt-2">
                    ⚠️ Compliance flag: {review.complianceNote}
                  </p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <form
                  action={`/api/v1/admin/reviews/${review.id}/approve`}
                  method="POST"
                >
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700"
                  >
                    Approve
                  </button>
                </form>
                <form
                  action={`/api/v1/admin/reviews/${review.id}/reject`}
                  method="POST"
                >
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-100"
                  >
                    Reject
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
