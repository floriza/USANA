import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductsGrid } from "@/components/product/products-grid";
import { ProductFilters } from "@/components/product/product-filters";
import { FilterDrawerTrigger } from "@/components/product/filter-drawer";

export const metadata: Metadata = {
  title: "All Products",
  description:
    "Browse all USANA health supplements, nutritionals, weight management and personal care products.",
};

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    sortBy?: string;
    page?: string;
    featured?: string;
    newArrival?: string;
    bestseller?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;

  return (
    <div className="container mx-auto px-4 max-w-7xl py-8 pt-28">
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#2D6A4F" }}>
          Products
        </p>
        <h1
          className="text-3xl md:text-4xl font-bold"
          style={{ fontFamily: "var(--font-playfair,serif)", color: "var(--foreground)" }}
        >
          {params.search
            ? `Results for "${params.search}"`
            : params.category
              ? `${params.category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}`
              : "All Products"}
        </h1>
        <p className="text-sm mt-1.5" style={{ color: "var(--muted)" }}>
          Premium USANA health supplements and wellness products
        </p>
      </div>

      {/* Mobile filter trigger */}
      <div className="lg:hidden mb-4">
        <FilterDrawerTrigger />
      </div>

      <div className="flex gap-6">
        <aside className="hidden lg:block w-64 shrink-0">
          <ProductFilters />
        </aside>

        <main className="flex-1 min-w-0">
          <Suspense
            fallback={
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl skeleton-shimmer h-72"
                  />
                ))}
              </div>
            }
          >
            <ProductsGrid params={params} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
