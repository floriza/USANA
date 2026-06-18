"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface Violation {
  phrase: string;
  category: string;
  severity: string;
  context: string;
}

interface ComplianceResult {
  isBlocked: boolean;
  hasCritical: boolean;
  hasWarning: boolean;
  violations: Violation[];
}

export function ComplianceChecker() {
  const [content, setContent] = useState("");
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function checkContent() {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      setResult(data.data);
    } finally {
      setLoading(false);
    }
  }

  const SEVERITY_COLORS: Record<string, string> = {
    BLOCKED: "bg-red-100 text-red-700 border-red-200",
    CRITICAL: "bg-orange-100 text-orange-700 border-orange-200",
    WARNING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  };

  return (
    <div className="space-y-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Paste product description, blog post, testimonial, or marketing content here to check for compliance violations..."
        rows={5}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
      <button
        onClick={checkContent}
        disabled={loading || !content.trim()}
        className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-70"
      >
        {loading ? "Checking..." : "Check Compliance"}
      </button>

      {result && (
        <div className="space-y-3">
          {/* Summary */}
          <div
            className={`flex items-center gap-3 p-4 rounded-xl border ${
              result.isBlocked
                ? "bg-red-50 border-red-200"
                : result.hasCritical
                  ? "bg-orange-50 border-orange-200"
                  : result.hasWarning
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-green-50 border-green-200"
            }`}
          >
            {result.isBlocked ? (
              <XCircle className="w-5 h-5 text-red-600 shrink-0" />
            ) : result.violations.length > 0 ? (
              <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            )}
            <div>
              <p
                className={`font-semibold text-sm ${
                  result.isBlocked
                    ? "text-red-700"
                    : result.violations.length > 0
                      ? "text-yellow-700"
                      : "text-green-700"
                }`}
              >
                {result.isBlocked
                  ? "⛔ Content BLOCKED — Cannot be published"
                  : result.violations.length > 0
                    ? `⚠️ ${result.violations.length} compliance issue(s) found`
                    : "✅ Content passes compliance check"}
              </p>
            </div>
          </div>

          {/* Violations */}
          {result.violations.map((v, i) => (
            <div
              key={i}
              className={`border rounded-xl p-4 text-sm ${SEVERITY_COLORS[v.severity] || ""}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold">"{v.phrase}"</span>
                <span className="text-xs font-bold uppercase">{v.severity}</span>
              </div>
              <p className="text-xs opacity-80">Category: {v.category}</p>
              <p className="text-xs mt-1 opacity-70 italic">
                Context: {v.context}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
