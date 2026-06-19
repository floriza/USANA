"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { useCartDrawer } from "./cart-drawer-context";

interface CartItem {
  id: string;
  quantity: number;
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

export function CartDrawer() {
  const { open, closeDrawer } = useCartDrawer();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await fetch("/api/v1/cart");
      return res.json();
    },
    enabled: open,
  });

  const removeMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch(`/api/v1/cart?itemId=${itemId}`, { method: "DELETE" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Item removed");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const res = await fetch("/api/v1/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 0 }),
      });
      const data = await res.json();
      if (quantity > 1) {
        await fetch("/api/v1/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity }),
        });
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const items: CartItem[] = data?.data?.items ?? [];
  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat(String(item.product.salePrice ?? item.product.price));
    return sum + price * item.quantity;
  }, 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[90]"
            style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }}
            onClick={closeDrawer}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-[91] flex flex-col w-full max-w-md shadow-2xl"
            style={{ background: "#FAFAF7" }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-5 border-b shrink-0"
              style={{ borderColor: "#EAE7DF" }}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="w-5 h-5" style={{ color: "#2D6A4F" }} />
                <h2
                  className="text-lg font-bold"
                  style={{ fontFamily: "var(--font-playfair,serif)", color: "var(--foreground)" }}
                >
                  Your Cart
                </h2>
                {items.length > 0 && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ background: "#2D6A4F" }}
                  >
                    {items.length}
                  </span>
                )}
              </div>
              <button
                onClick={closeDrawer}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                style={{ background: "#F2EFE8" }}
              >
                <X className="w-4 h-4" style={{ color: "var(--foreground)" }} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {isLoading && (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="w-18 h-18 rounded-xl bg-gray-200 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isLoading && items.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: "#ECFDF5" }}
                  >
                    <ShoppingBag className="w-7 h-7" style={{ color: "#2D6A4F" }} />
                  </div>
                  <p className="font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                    Your cart is empty
                  </p>
                  <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
                    Add some USANA products to get started
                  </p>
                  <Link
                    href="/products"
                    onClick={closeDrawer}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ background: "#2D6A4F" }}
                  >
                    Shop Now <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {items.map((item) => {
                const itemPrice = parseFloat(String(item.product.salePrice ?? item.product.price));
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    className="flex gap-3 p-3 rounded-2xl border"
                    style={{ background: "#fff", borderColor: "#EAE7DF" }}
                  >
                    <Link
                      href={`/products/${item.product.slug}`}
                      onClick={closeDrawer}
                      className="shrink-0 w-18 h-18 rounded-xl overflow-hidden"
                      style={{ width: 72, height: 72, background: "#F8F6F0" }}
                    >
                      {item.product.thumbnail ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={item.product.thumbnail}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="72px"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">💊</div>
                      )}
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.product.slug}`}
                        onClick={closeDrawer}
                        className="text-sm font-semibold leading-tight line-clamp-2 hover:underline"
                        style={{ color: "var(--foreground)" }}
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm font-bold mt-1" style={{ color: "#2D6A4F" }}>
                        {formatCurrency(itemPrice)}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <div
                          className="flex items-center rounded-lg border overflow-hidden"
                          style={{ borderColor: "#EAE7DF" }}
                        >
                          <button
                            onClick={() =>
                              item.quantity > 1
                                ? updateMutation.mutate({ productId: item.product.id, quantity: item.quantity - 1 })
                                : removeMutation.mutate(item.id)
                            }
                            className="w-7 h-7 flex items-center justify-center transition-colors hover:bg-gray-50"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateMutation.mutate({ productId: item.product.id, quantity: item.quantity + 1 })
                            }
                            disabled={item.quantity >= item.product.stockQuantity}
                            className="w-7 h-7 flex items-center justify-center transition-colors hover:bg-gray-50 disabled:opacity-40"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeMutation.mutate(item.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-red-50"
                          style={{ color: "#C53030" }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div
                className="px-6 py-5 border-t shrink-0"
                style={{ borderColor: "#EAE7DF", background: "#fff" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm" style={{ color: "var(--muted)" }}>Subtotal</span>
                  <span
                    className="text-xl font-bold"
                    style={{ fontFamily: "var(--font-playfair,serif)", color: "var(--foreground)" }}
                  >
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                {subtotal < 2000 && (
                  <p className="text-xs mb-3 text-center" style={{ color: "var(--muted)" }}>
                    Add {formatCurrency(2000 - subtotal)} more for free shipping
                  </p>
                )}
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #2D6A4F 0%, #40916C 100%)" }}
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="w-full flex items-center justify-center mt-2 py-2.5 rounded-2xl text-sm font-medium transition-colors"
                  style={{ color: "var(--muted)" }}
                >
                  View Full Cart
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
