"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Best Rated" },
];

const CATEGORIES = [
  { value: "supplements", label: "Supplements" },
  { value: "nutritionals", label: "Nutritionals" },
  { value: "shakes-and-weight-management", label: "Weight Management" },
  { value: "healthy-living", label: "Healthy Living" },
  { value: "personal-care", label: "Personal Care" },
  { value: "skin-care", label: "Skin Care" },
];

export function ProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="space-y-6">
      {/* Sort */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Sort By</h3>
        <div className="space-y-1.5">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() =>
                setParam(
                  "sortBy",
                  searchParams.get("sortBy") === opt.value ? null : opt.value
                )
              }
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                searchParams.get("sortBy") === opt.value
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Category</h3>
        <div className="space-y-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() =>
                setParam(
                  "category",
                  searchParams.get("category") === cat.value
                    ? null
                    : cat.value
                )
              }
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                searchParams.get("category") === cat.value
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 text-sm">
          Price Range
        </h3>
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="number"
              placeholder="Min"
              defaultValue={searchParams.get("minPrice") || ""}
              onBlur={(e) => setParam("minPrice", e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <input
              type="number"
              placeholder="Max"
              defaultValue={searchParams.get("maxPrice") || ""}
              onBlur={(e) => setParam("maxPrice", e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 text-sm">
          Availability
        </h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={searchParams.get("inStock") === "true"}
            onChange={(e) =>
              setParam("inStock", e.target.checked ? "true" : null)
            }
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">In Stock Only</span>
        </label>
      </div>

      {/* Clear filters */}
      {searchParams.size > 0 && (
        <button
          onClick={() => router.push(pathname)}
          className="w-full py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
