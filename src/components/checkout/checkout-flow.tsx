"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle, ChevronRight, MapPin, Truck, CreditCard } from "lucide-react";
import { checkoutSchema, type CheckoutInput, type CheckoutInputRaw } from "@/lib/validations/order";

export type CheckoutForm = UseFormReturn<CheckoutInputRaw, unknown, CheckoutInput>;
import { formatCurrency } from "@/lib/utils";
import { AddressStep } from "./address-step";
import { ShippingStep } from "./shipping-step";
import { PaymentStep } from "./payment-step";
import { OrderReview } from "./order-review";

type CartItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    thumbnail: string | null;
    price: string;
    salePrice: string | null;
    stockQuantity: number;
    reservedQuantity: number;
    weight: string | null;
    sku: string;
  };
};

type Address = {
  id: string;
  label: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  barangay: string;
  city: string;
  province: string;
  region: string;
  zipCode: string;
  isDefault: boolean;
};

interface CheckoutFlowProps {
  cart: { items: CartItem[] };
  addresses: Address[];
  pointsBalance: number;
  pointsPerPeso: number;
}

const STEPS = [
  { id: "address", label: "Address", icon: MapPin },
  { id: "shipping", label: "Shipping", icon: Truck },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "review", label: "Review", icon: CheckCircle },
];

export function CheckoutFlow({ cart, addresses, pointsBalance, pointsPerPeso }: CheckoutFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CheckoutInputRaw, unknown, CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      addressId: addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? "",
      paymentMethod: "GCASH",
      pointsToRedeem: 0,
      couponCode: "",
      notes: "",
    },
  });

  const subtotal = cart.items.reduce((sum, item) => {
    const price = parseFloat(item.product.salePrice ?? item.product.price);
    return sum + price * item.quantity;
  }, 0);

  const pointsToRedeem = form.watch("pointsToRedeem");
  const pointsDiscount = (pointsToRedeem ?? 0) * pointsPerPeso;
  const total = Math.max(0, subtotal - pointsDiscount + shippingFee);

  async function handleSubmit(values: CheckoutInput) {
    setIsSubmitting(true);
    try {
      // Create order
      const orderRes = await fetch("/api/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Failed to create order");

      // Create payment intent
      const payRes = await fetch("/api/v1/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderData.data.id,
          paymentMethod: values.paymentMethod,
        }),
      });
      const payData = await payRes.json();
      if (!payRes.ok) throw new Error(payData.error || "Failed to initiate payment");

      // Redirect to PayMongo checkout URL
      if (payData.data?.checkoutUrl) {
        window.location.href = payData.data.checkoutUrl;
      } else {
        router.push(`/account/orders/${orderData.data.id}?status=pending`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
      setIsSubmitting(false);
    }
  }

  const selectedAddress = addresses.find((a) => a.id === form.watch("addressId"));

  return (
    <div className="min-h-screen" style={{ background: "#F8F6F0" }}>
      <div className="max-w-6xl mx-auto px-4 py-8 pt-28">
        <h1
          className="text-2xl md:text-3xl font-bold mb-2"
          style={{ fontFamily: "var(--font-playfair,serif)", color: "var(--foreground)" }}
        >
          Checkout
        </h1>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center gap-4 mb-8 text-xs" style={{ color: "var(--muted)" }}>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px]" style={{ background: "#2D6A4F" }}>🔒</span>
            SSL Secured Checkout
          </span>
          <span className="flex items-center gap-1.5">
            <span>💳</span>
            Powered by PayMongo
          </span>
          <span className="flex items-center gap-1.5">
            <span>✓</span>
            Money-back Guarantee
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === step;
              const isDone = i < step;
              return (
                <button
                  key={s.id}
                  onClick={() => i < step && setStep(i)}
                  disabled={i > step}
                  className="flex flex-col items-center gap-1.5 flex-1 disabled:cursor-not-allowed"
                >
                  <span
                    className="w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300"
                    style={{
                      borderColor: isDone || isActive ? "#2D6A4F" : "#D6D0C4",
                      background: isDone ? "#2D6A4F" : isActive ? "#ECFDF5" : "#fff",
                      color: isDone ? "#fff" : isActive ? "#2D6A4F" : "#9CA3AF",
                    }}
                  >
                    {isDone ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </span>
                  <span
                    className="text-xs font-medium hidden sm:block"
                    style={{ color: isDone || isActive ? "#2D6A4F" : "var(--muted)" }}
                  >
                    {s.label}
                  </span>
                </button>
              );
          })}
          </div>
          {/* Progress track */}
          <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: "#EAE7DF" }}>
            <div
              className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
              style={{
                background: "linear-gradient(90deg, #2D6A4F, #52B788)",
                width: `${((step + 1) / STEPS.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2">
            {step === 0 && (
              <AddressStep
                addresses={addresses}
                form={form}
                onNext={() => setStep(1)}
              />
            )}
            {step === 1 && (
              <ShippingStep
                selectedAddress={selectedAddress}
                cartItems={cart.items}
                onShippingFeeChange={setShippingFee}
                onNext={() => setStep(2)}
                onBack={() => setStep(0)}
              />
            )}
            {step === 2 && (
              <PaymentStep
                form={form}
                pointsBalance={pointsBalance}
                pointsPerPeso={pointsPerPeso}
                subtotal={subtotal}
                onNext={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            )}
            {step === 3 && (
              <OrderReview
                cart={cart}
                selectedAddress={selectedAddress}
                form={form}
                subtotal={subtotal}
                shippingFee={shippingFee}
                pointsDiscount={pointsDiscount}
                total={total}
                isSubmitting={isSubmitting}
                onBack={() => setStep(2)}
                onSubmit={() => form.handleSubmit(handleSubmit)()}
              />
            )}
          </div>

          {/* Order summary sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border p-5 sticky top-24" style={{ background: "#fff", borderColor: "#EAE7DF" }}>
              <h2
                className="font-bold mb-4"
                style={{ fontFamily: "var(--font-playfair,serif)", color: "var(--foreground)" }}
              >
                Order Summary
              </h2>
              <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                {cart.items.map((item) => {
                  const price = parseFloat(item.product.salePrice ?? item.product.price);
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden"
                        style={{ background: "#F8F6F0" }}
                      >
                        {item.product.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.product.thumbnail}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">💊</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>{item.product.name}</p>
                        <p className="text-xs" style={{ color: "var(--muted)" }}>Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold flex-shrink-0" style={{ color: "var(--foreground)" }}>
                        {formatCurrency(price * item.quantity)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-4 space-y-2 text-sm" style={{ borderColor: "#EAE7DF" }}>
                <div className="flex justify-between" style={{ color: "var(--muted)" }}>
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {pointsDiscount > 0 && (
                  <div className="flex justify-between" style={{ color: "#2D6A4F" }}>
                    <span>Points Discount</span>
                    <span>-{formatCurrency(pointsDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between" style={{ color: "var(--muted)" }}>
                  <span>Shipping</span>
                  <span>{shippingFee > 0 ? formatCurrency(shippingFee) : "—"}</span>
                </div>
                <div
                  className="flex justify-between font-bold text-base border-t pt-2 mt-2"
                  style={{ borderColor: "#EAE7DF", color: "var(--foreground)", fontFamily: "var(--font-playfair,serif)" }}
                >
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
