"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Star, Plus } from "lucide-react";
import { formatCurrency, calculateDiscountPercent } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    thumbnail: string | null;
    price: number;
    salePrice: number | null;
    stockQuantity: number;
    averageRating: number;
    reviewCount: number;
    isBestseller?: boolean;
    isNewArrival?: boolean;
    isFeatured?: boolean;
    category?: { name: string; slug: string };
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const queryClient = useQueryClient();
  const price = product.price;
  const salePrice = product.salePrice;
  const discountPercent = salePrice ? calculateDiscountPercent(price, salePrice) : 0;

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v1/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add to cart");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to cart!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const wishlistMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v1/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success(data.added ? "Added to wishlist!" : "Removed from wishlist");
    },
    onError: () => {
      toast.error("Please login to save to wishlist");
    },
  });

  const outOfStock = product.stockQuantity === 0;

  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        border: "1px solid #EAE7DF",
        boxShadow: "0 1px 6px rgba(28,43,32,0.04)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 36px rgba(28,43,32,0.12)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "#D6D0C4";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 6px rgba(28,43,32,0.04)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "#EAE7DF";
      }}
    >
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden bg-[#F2EFE8]">
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-[#ECFDF5] flex items-center justify-center">
              <ShoppingCart className="w-7 h-7" style={{ color: "#2D6A4F" }} />
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {discountPercent > 0 && (
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: "#FEE2E2", color: "#7F1D1D" }}
            >
              -{discountPercent}%
            </span>
          )}
          {product.isNewArrival && (
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: "#D1FAE5", color: "#065F46" }}
            >
              New
            </span>
          )}
          {product.isBestseller && (
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: "#FEF3C7", color: "#78350F" }}
            >
              Bestseller
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            wishlistMutation.mutate();
          }}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
          style={{
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(8px)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            opacity: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = "#E63946"}
          onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = "var(--muted)"}
          aria-label="Add to wishlist"
          ref={(el) => {
            if (el) {
              el.closest(".group")?.addEventListener("mouseenter", () => { el.style.opacity = "1"; });
              el.closest(".group")?.addEventListener("mouseleave", () => { el.style.opacity = "0"; });
            }
          }}
        >
          <Heart className="w-4 h-4" />
        </button>

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(255,255,255,0.72)" }}>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: "var(--foreground)", color: "#fff" }}>
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4">
        {product.category && (
          <p className="text-xs font-semibold tracking-wide uppercase mb-1.5" style={{ color: "#2D6A4F" }}>
            {product.category.name}
          </p>
        )}

        <Link href={`/products/${product.slug}`}>
          <h3
            className="font-semibold text-sm line-clamp-2 mb-2 transition-colors duration-150 hover:text-[#2D6A4F]"
            style={{ color: "var(--foreground)", lineHeight: 1.4 }}
          >
            {product.name}
          </h3>
        </Link>

        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-3 h-3"
                  style={{
                    color: i < Math.round(product.averageRating) ? "#E9C46A" : "#D6D0C4",
                    fill: i < Math.round(product.averageRating) ? "#E9C46A" : "transparent",
                  }}
                />
              ))}
            </div>
            <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
              {product.averageRating.toFixed(1)}
            </span>
            <span className="text-xs" style={{ color: "var(--muted)" }}>
              ({product.reviewCount})
            </span>
          </div>
        )}

        <div className="flex items-center justify-between mt-auto">
          <div>
            {salePrice ? (
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold" style={{ color: "var(--foreground)", fontSize: "0.95rem" }}>
                  {formatCurrency(salePrice)}
                </span>
                <span className="text-xs line-through" style={{ color: "var(--muted)" }}>
                  {formatCurrency(price)}
                </span>
              </div>
            ) : (
              <span className="font-bold" style={{ color: "var(--foreground)", fontSize: "0.95rem" }}>
                {formatCurrency(price)}
              </span>
            )}
          </div>

          <button
            onClick={() => addToCartMutation.mutate()}
            disabled={outOfStock || addToCartMutation.isPending}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "#2D6A4F", color: "#fff" }}
            onMouseEnter={(e) => {
              if (!(e.currentTarget as HTMLButtonElement).disabled) {
                (e.currentTarget as HTMLButtonElement).style.background = "#1B4332";
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#2D6A4F";
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
            }}
            aria-label="Add to cart"
          >
            {addToCartMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
