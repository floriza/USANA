"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        toast.success("Subscribed! Check your email for confirmation.");
        setEmail("");
      } else {
        throw new Error("Failed");
      }
    } catch {
      toast.error("Failed to subscribe. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-blue-700 py-12">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Stay Updated on Health Tips & Offers
        </h2>
        <p className="text-blue-100 text-sm mb-6">
          Get exclusive deals and wellness tips delivered to your inbox. Unsubscribe anytime.
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="flex-1 px-4 py-2.5 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-colors text-sm disabled:opacity-70"
          >
            {loading ? "..." : "Subscribe"}
          </button>
        </form>
        <p className="text-blue-200 text-xs mt-3">
          By subscribing you agree to receive marketing emails. Your data is handled per our Privacy Policy.
        </p>
      </div>
    </section>
  );
}
