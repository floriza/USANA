"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShoppingCart, Heart, Minus, Plus } from "lucide-react";

interface AddToCartSectionProps {
  product: {
    id: string;
    stockQuantity: number;
    slug: string;
  };
}

export function AddToCartSection({ product }: AddToCartSectionProps) {
  const [quantity, setQuantity] = useState(1);
  const queryClient = useQueryClient();

  const addToCart = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v1/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add to cart");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success(`${quantity} item(s) added to cart!`);
    },
    onError: (error) => toast.error(error.message),
  });

  const addToWishlist = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v1/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      if (!res.ok) throw new Error("Login required");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success(data.added ? "Added to wishlist!" : "Removed from wishlist");
    },
    onError: () => toast.error("Please login to save to wishlist"),
  });

  if (product.stockQuantity === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-4 text-center">
        <p className="text-gray-600 font-medium">Out of Stock</p>
        <p className="text-sm text-gray-500 mt-1">
          Join our waitlist to be notified when available
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Quantity */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Quantity:</span>
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-2.5 hover:bg-gray-50 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="px-4 py-2 text-sm font-semibold min-w-[2.5rem] text-center">
            {quantity}
          </span>
          <button
            onClick={() =>
              setQuantity(Math.min(product.stockQuantity, quantity + 1))
            }
            className="p-2.5 hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => addToCart.mutate()}
          disabled={addToCart.isPending}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-70"
        >
          <ShoppingCart className="w-5 h-5" />
          {addToCart.isPending ? "Adding..." : "Add to Cart"}
        </button>

        <button
          onClick={() => addToWishlist.mutate()}
          disabled={addToWishlist.isPending}
          className="p-3 border border-gray-200 rounded-xl hover:border-red-300 hover:text-red-500 transition-colors"
        >
          <Heart className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
