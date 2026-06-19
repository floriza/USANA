"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, Star, Award } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "100% Authentic" },
  { icon: Truck, label: "Nationwide Delivery" },
  { icon: Star, label: "Earn Rewards" },
  { icon: Award, label: "Science-Based" },
];

export function HeroSection() {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      ref={ref}
      className="relative min-h-[92vh] flex items-center overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 45%, #40916C 100%)",
        paddingTop: "7rem",
      }}
    >
      {/* Organic blob decorations */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        {/* Large warm circle */}
        <div
          className="absolute rounded-full"
          style={{
            width: "70vw",
            height: "70vw",
            maxWidth: "900px",
            maxHeight: "900px",
            top: "-20%",
            right: "-15%",
            background: "radial-gradient(circle, rgba(82,183,136,0.25) 0%, transparent 70%)",
          }}
        />
        {/* Small accent blob bottom-left */}
        <div
          className="absolute rounded-full"
          style={{
            width: "40vw",
            height: "40vw",
            maxWidth: "500px",
            maxHeight: "500px",
            bottom: "-10%",
            left: "-8%",
            background: "radial-gradient(circle, rgba(212,163,115,0.18) 0%, transparent 70%)",
          }}
        />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Floating leaves */}
        <svg className="absolute top-1/4 left-[8%] opacity-10 animate-float" width="48" height="48" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#E9C46A", animationDelay: "0s" }}>
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 4-12 4 0-4 4-6 7-5 0-1-3-2-5-2C6 0 2 6 2 13c0 3.42 1.69 7 4.6 8l.44-.9L5 20 4 22l2.82 1.41L7 22l-.18.31A9 9 0 0 0 10 23c4.42 0 8-3.58 8-8 0-2.82-1.49-5.31-3.84-6.69" />
        </svg>
        <svg className="absolute bottom-1/3 right-[12%] opacity-8 animate-float" width="36" height="36" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#52B788", animationDelay: "1.5s" }}>
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 4-12 4 0-4 4-6 7-5 0-1-3-2-5-2C6 0 2 6 2 13c0 3.42 1.69 7 4.6 8l.44-.9L5 20 4 22l2.82 1.41L7 22l-.18.31A9 9 0 0 0 10 23c4.42 0 8-3.58 8-8 0-2.82-1.49-5.31-3.84-6.69" />
        </svg>
      </div>

      <div className="relative container mx-auto px-4 max-w-7xl py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — text */}
          <div>
            {/* Eyebrow label */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-7"
              style={{
                background: "rgba(233,196,106,0.18)",
                border: "1px solid rgba(233,196,106,0.35)",
                color: "#E9C46A",
                opacity: loaded ? 1 : 0,
                transform: loaded ? "translateY(0)" : "translateY(12px)",
                transition: "opacity 0.6s ease, transform 0.6s ease",
              }}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              Trusted by Filipino families nationwide
            </div>

            <h1
              className="text-5xl md:text-6xl lg:text-7xl text-white leading-[1.08] mb-6"
              style={{
                fontFamily: "var(--font-playfair,serif)",
                fontWeight: 700,
                opacity: loaded ? 1 : 0,
                transform: loaded ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s",
              }}
            >
              Your Wellness{" "}
              <span
                className="italic"
                style={{
                  background: "linear-gradient(90deg, #E9C46A, #D4A373)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Starts Here
              </span>
            </h1>

            <p
              className="text-lg mb-10 leading-relaxed max-w-md"
              style={{
                color: "rgba(255,255,255,0.72)",
                opacity: loaded ? 1 : 0,
                transform: loaded ? "translateY(0)" : "translateY(16px)",
                transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s",
              }}
            >
              Authentic USANA health supplements delivered to your door. Science-based
              nutrition for a healthier, more vibrant life.
            </p>

            <div
              className="flex flex-wrap gap-3"
              style={{
                opacity: loaded ? 1 : 0,
                transform: loaded ? "translateY(0)" : "translateY(12px)",
                transition: "opacity 0.7s ease 0.3s, transform 0.7s ease 0.3s",
              }}
            >
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-200"
                style={{
                  background: "#E9C46A",
                  color: "#1B4332",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "#D4A373";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 24px rgba(233,196,106,0.4)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "#E9C46A";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
                }}
              >
                Shop Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/products?bestseller=true"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1.5px solid rgba(255,255,255,0.3)",
                  color: "#fff",
                  backdropFilter: "blur(8px)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.2)";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.12)";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                }}
              >
                Best Sellers
              </Link>
            </div>

            {/* Trust row */}
            <div
              className="flex flex-wrap items-center gap-5 mt-12 pt-8"
              style={{
                borderTop: "1px solid rgba(255,255,255,0.12)",
                opacity: loaded ? 1 : 0,
                transition: "opacity 0.7s ease 0.5s",
              }}
            >
              {TRUST_ITEMS.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon className="w-4 h-4" style={{ color: "#52B788" }} />
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — visual panel */}
          <div
            className="hidden lg:flex justify-center items-center"
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateX(0) scale(1)" : "translateX(30px) scale(0.97)",
              transition: "opacity 0.8s ease 0.25s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.25s",
            }}
          >
            <div className="relative w-96 h-96">
              {/* Outer ring */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "rgba(82,183,136,0.08)",
                  border: "1px solid rgba(82,183,136,0.2)",
                  animation: "floatY 6s ease-in-out infinite",
                }}
              />
              {/* Inner ring */}
              <div
                className="absolute inset-6 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <div className="text-center px-8">
                  {/* Decorative icon cluster */}
                  <div className="flex justify-center gap-3 mb-5">
                    {["#52B788", "#E9C46A", "#D4A373"].map((color, i) => (
                      <div
                        key={i}
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{
                          background: `${color}22`,
                          border: `1.5px solid ${color}44`,
                          animation: `floatY ${4 + i * 0.5}s ease-in-out infinite`,
                          animationDelay: `${i * 0.3}s`,
                        }}
                      >
                        <div className="w-6 h-6 rounded-lg" style={{ background: color, opacity: 0.9 }} />
                      </div>
                    ))}
                  </div>
                  <div className="text-white font-bold text-xl mb-1" style={{ fontFamily: "var(--font-playfair,serif)" }}>
                    USANA Wellness
                  </div>
                  <div className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                    Science. Trust. Health.
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" style={{ color: "#E9C46A" }} />
                    ))}
                  </div>
                  <div className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                    Thousands of happy customers
                  </div>
                </div>
              </div>
              {/* Floating accent dots */}
              {[
                { top: "8%", left: "10%", size: 10, delay: "0s" },
                { top: "75%", left: "5%", size: 7, delay: "1s" },
                { top: "15%", right: "8%", size: 8, delay: "0.5s" },
                { bottom: "10%", right: "12%", size: 12, delay: "1.5s" },
              ].map((dot, i) => (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    ...dot,
                    width: dot.size,
                    height: dot.size,
                    background: "#E9C46A",
                    opacity: 0.5,
                    animation: `floatY ${3 + i * 0.4}s ease-in-out infinite`,
                    animationDelay: dot.delay,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade to page background */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent, #FAFAF7)",
        }}
      />
    </section>
  );
}
