"use client";

import { useState } from "react";
import { Mail, ArrowRight, Leaf } from "lucide-react";
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
      toast.error("Could not subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      className="relative overflow-hidden py-20"
      style={{ background: "#1B4332" }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute rounded-full"
          style={{
            width: "60vw",
            height: "60vw",
            maxWidth: "700px",
            maxHeight: "700px",
            top: "-30%",
            right: "-10%",
            background: "radial-gradient(circle, rgba(82,183,136,0.15) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: "40vw",
            height: "40vw",
            maxWidth: "450px",
            maxHeight: "450px",
            bottom: "-20%",
            left: "-5%",
            background: "radial-gradient(circle, rgba(212,163,115,0.12) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative container mx-auto px-4 max-w-2xl text-center">
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-6"
          style={{
            background: "rgba(82,183,136,0.15)",
            border: "1px solid rgba(82,183,136,0.25)",
            color: "#52B788",
          }}
        >
          <Leaf className="w-3.5 h-3.5" />
          Wellness Updates
        </div>

        <h2
          className="text-3xl md:text-4xl font-bold text-white mb-3"
          style={{ fontFamily: "var(--font-playfair,serif)" }}
        >
          Stay on Your Wellness Journey
        </h2>
        <p className="text-base mb-10 leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
          Exclusive health tips, product news, and special offers — delivered to your inbox.
          Unsubscribe anytime.
        </p>

        <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
          <div className="relative flex-1">
            <Mail
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "rgba(255,255,255,0.4)" }}
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#52B788]/40 transition-all"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.16)",
                color: "#fff",
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 disabled:opacity-60"
            style={{ background: "#E9C46A", color: "#1B4332" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#D4A373";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#E9C46A";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            }}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-[#1B4332]/30 border-t-[#1B4332] rounded-full animate-spin" />
            ) : (
              <>Subscribe <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>
        <p className="text-xs mt-4" style={{ color: "rgba(255,255,255,0.35)" }}>
          By subscribing you agree to receive marketing emails. Handled per our Privacy Policy.
        </p>
      </div>
    </section>
  );
}
