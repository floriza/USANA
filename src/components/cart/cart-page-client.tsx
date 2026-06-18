"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface CartItem {
  id: string;
  quantity: number;
  price: string | number;
  product: {
    id: string;
    name: string;
    slug: string;
    thumbnail: string | null;
    price: string | number;
    salePrice: string | number | null;
    stockQuantity: number;
  };
}

export function CartPageClient() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await fetch("/api/v1/cart");
      return res.json();
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch(`/api/v1/cart?itemId=${itemId}`, {
        method: "DELETE",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Item removed");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => {
      const res = await fetch("/api/v1/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 0 }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
    onError: () => toast.error("Failed to update quantity"),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 max-w-5xl py-12">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const cart = data?.data;
  const items: CartItem[] = cart?.items || [];
  const subtotal = cart?.subtotal || 0;

  if (!items.length) {
    return (
      <div className="container mx-auto px-4 max-w-5xl py-16 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Your cart is empty
        </h1>
        <p className="text-gray-500 mb-6">
          Add some products to get started!
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Browse Products
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-5xl py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Shopping Cart ({items.length} {items.length === 1 ? "item" : "items"})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => {
            const unitPrice = parseFloat(
              (item.product.salePrice || item.product.price).toString()
            );

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4"
              >
                <Link
                  href={`/products/${item.product.slug}`}
                  className="shrink-0"
                >
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-50">
                    {item.product.thumbnail ? (
                      <Image
                        src={item.product.thumbnail}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-2xl">
                        💊
                      </div>
                    )}
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product.slug}`}>
                    <h3 className="font-semibold text-gray-900 text-sm hover:text-blue-600 line-clamp-2">
                      {item.product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {formatCurrency(unitPrice)} each
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => {
                          if (item.quantity <= 1) {
                            removeMutation.mutate(item.id);
                          }
                        }}
                        className="p-1.5 hover:bg-gray-50"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 py-1 text-sm font-semibold min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => {
                          if (item.quantity < item.product.stockQuantity) {
                            updateMutation.mutate({
                              productId: item.product.id,
                              quantity: 1,
                            });
                          }
                        }}
                        className="p-1.5 hover:bg-gray-50"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900">
                        {formatCurrency(unitPrice * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeMutation.mutate(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 h-fit sticky top-24">
          <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>

          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span className="text-gray-500">Calculated at checkout</span>
            </div>
            {subtotal >= 2000 && (
              <div className="flex justify-between text-green-600">
                <span>Free Shipping Eligible!</span>
                <span>✓</span>
              </div>
            )}
          </div>

          <hr className="my-4" />

          <div className="flex justify-between font-bold text-lg mb-4">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          <Link
            href="/checkout"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Proceed to Checkout
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/products"
            className="w-full flex items-center justify-center text-sm text-gray-500 hover:text-gray-700 mt-3"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
