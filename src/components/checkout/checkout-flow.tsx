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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

        {/* Step indicator */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isDone = i < step;
            return (
              <div key={s.id} className="flex items-center">
                <button
                  onClick={() => i < step && setStep(i)}
                  disabled={i > step}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-blue-600"
                      : isDone
                      ? "text-green-600 hover:text-green-700 cursor-pointer"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      isActive
                        ? "border-blue-600 bg-blue-600 text-white"
                        : isDone
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-gray-300 text-gray-400"
                    }`}
                  >
                    {isDone ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-300 mx-2" />
                )}
              </div>
            );
          })}
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
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
              <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                {cart.items.map((item) => {
                  const price = parseFloat(item.product.salePrice ?? item.product.price);
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 flex-shrink-0 overflow-hidden">
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
                        <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
                        {formatCurrency(price * item.quantity)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Points Discount</span>
                    <span>-{formatCurrency(pointsDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shippingFee > 0 ? formatCurrency(shippingFee) : "—"}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2 mt-2">
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
