"use client";

import Link from "next/link";
import {
  Pill, Apple, Scale, Heart, Sparkles, Flower2, ShoppingBag,
} from "lucide-react";

const CATEGORY_META: Record<string, { icon: React.ElementType; accent: string; bg: string }> = {
  supplements:          { icon: Pill,      accent: "#2D6A4F", bg: "#ECFDF5" },
  nutritionals:         { icon: Apple,     accent: "#40916C", bg: "#F0FDF4" },
  "shakes-and-weight-management": { icon: Scale, accent: "#D4A373", bg: "#FFF7ED" },
  "healthy-living":     { icon: Heart,     accent: "#52B788", bg: "#ECFDF5" },
  "personal-care":      { icon: Flower2,   accent: "#E9C46A", bg: "#FEFCE8" },
  "skin-care":          { icon: Sparkles,  accent: "#1B4332", bg: "#F0FDF4" },
};

interface Category {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

export function CategoryCards({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {categories.map((cat, i) => {
        const meta = CATEGORY_META[cat.slug] ?? {
          icon: ShoppingBag,
          accent: "#2D6A4F",
          bg: "#ECFDF5",
        };
        const Icon = meta.icon;
        return (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className="group flex flex-col items-center p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            style={{
              background: "#fff",
              borderColor: "#EAE7DF",
              boxShadow: "0 1px 6px rgba(28,43,32,0.04)",
            }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"
              style={{ background: meta.bg }}
            >
              <Icon className="w-6 h-6" style={{ color: meta.accent }} />
            </div>
            <span
              className="text-sm font-semibold text-center leading-tight"
              style={{ color: "var(--foreground)" }}
            >
              {cat.name}
            </span>
            <span className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              {cat.productCount} items
            </span>
          </Link>
        );
      })}
    </div>
  );
}
