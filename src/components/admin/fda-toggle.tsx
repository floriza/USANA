"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, ShieldX } from "lucide-react";

interface FdaToggleProps {
  productId: string;
  productName: string;
  initialValue: boolean;
}

export function FdaToggle({ productId, productName, initialValue }: FdaToggleProps) {
  const [evaluated, setEvaluated] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const next = !evaluated;
    try {
      const res = await fetch("/api/v1/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId, isFdaEvaluated: next }),
      });
      if (!res.ok) throw new Error();
      setEvaluated(next);
      toast.success(
        next
          ? `"${productName}" marked as FDA evaluated — disclaimer hidden`
          : `"${productName}" disclaimer restored`
      );
    } catch {
      toast.error("Failed to update FDA status");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={evaluated ? "FDA Evaluated — click to remove" : "Not FDA Evaluated — click to mark"}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-200 disabled:opacity-50"
      style={
        evaluated
          ? { background: "#ECFDF5", borderColor: "#6EE7B7", color: "#065F46" }
          : { background: "#FFF7ED", borderColor: "#FCD34D", color: "#92400E" }
      }
    >
      {evaluated ? (
        <ShieldCheck className="w-3.5 h-3.5" />
      ) : (
        <ShieldX className="w-3.5 h-3.5" />
      )}
      {loading ? "…" : evaluated ? "FDA Evaluated" : "No FDA Eval"}
    </button>
  );
}
