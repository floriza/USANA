"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Star } from "lucide-react";
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
  const rating = product.averageRating;

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

  const discountPercent = salePrice
    ? calculateDiscountPercent(price, salePrice)
    : 0;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-blue-100 transition-all duration-200">
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="block relative aspect-square bg-gray-50">
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl bg-blue-50">
            💊
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discountPercent > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              -{discountPercent}%
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              New
            </span>
          )}
          {product.isBestseller && (
            <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
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
          className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
        >
          <Heart className="w-4 h-4" />
        </button>

        {product.stockQuantity === 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="bg-gray-800 text-white text-xs font-medium px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4">
        {product.category && (
          <p className="text-xs text-blue-600 font-medium mb-1">
            {product.category.name}
          </p>
        )}

        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 hover:text-blue-600 transition-colors mb-2">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-medium text-gray-700">
              {rating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-400">
              ({product.reviewCount})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mt-2">
          <div>
            {salePrice ? (
              <>
                <span className="font-bold text-gray-900">
                  {formatCurrency(salePrice)}
                </span>
                <span className="text-xs text-gray-400 line-through ml-1.5">
                  {formatCurrency(price)}
                </span>
              </>
            ) : (
              <span className="font-bold text-gray-900">
                {formatCurrency(price)}
              </span>
            )}
          </div>

          <button
            onClick={() => addToCartMutation.mutate()}
            disabled={
              product.stockQuantity === 0 || addToCartMutation.isPending
            }
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
