"use client";

import { Shield, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { CheckoutForm } from "./checkout-flow";

type CartItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    thumbnail: string | null;
    price: string;
    salePrice: string | null;
    sku: string;
  };
};

type Address = {
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
} | undefined;

const PAYMENT_LABELS: Record<string, string> = {
  GCASH: "GCash",
  MAYA: "Maya",
  CREDIT_CARD: "Credit Card",
  DEBIT_CARD: "Debit Card",
};

interface OrderReviewProps {
  cart: { items: CartItem[] };
  selectedAddress: Address;
  form: CheckoutForm;
  subtotal: number;
  shippingFee: number;
  pointsDiscount: number;
  total: number;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
}

export function OrderReview({
  cart,
  selectedAddress,
  form,
  subtotal,
  shippingFee,
  pointsDiscount,
  total,
  isSubmitting,
  onBack,
  onSubmit,
}: OrderReviewProps) {
  const values = form.getValues();

  return (
    <div className="space-y-4">
      {/* Items */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-bold text-gray-900 mb-4">Order Items</h2>
        <div className="space-y-3">
          {cart.items.map((item) => {
            const price = parseFloat(item.product.salePrice ?? item.product.price);
            return (
              <div key={item.id} className="flex gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-12 h-12 rounded-lg bg-gray-50 flex-shrink-0 overflow-hidden">
                  {item.product.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.product.thumbnail}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">💊</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{item.product.name}</p>
                  <p className="text-xs text-gray-500">SKU: {item.product.sku} • Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold text-gray-900 text-sm flex-shrink-0">
                  {formatCurrency(price * item.quantity)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shipping address */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-bold text-gray-900 mb-3">Shipping Address</h2>
        {selectedAddress ? (
          <div className="text-sm text-gray-700">
            <p className="font-semibold">{selectedAddress.firstName} {selectedAddress.lastName}</p>
            <p>{selectedAddress.phone}</p>
            <p>
              {selectedAddress.addressLine1}
              {selectedAddress.addressLine2 && `, ${selectedAddress.addressLine2}`}
            </p>
            <p>
              {selectedAddress.barangay}, {selectedAddress.city}, {selectedAddress.province} {selectedAddress.zipCode}
            </p>
            <p className="text-gray-500">{selectedAddress.region}</p>
          </div>
        ) : (
          <p className="text-sm text-red-500">No address selected</p>
        )}
      </div>

      {/* Payment & pricing */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-bold text-gray-900 mb-4">Payment Details</h2>
        <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
          <span className="text-lg">
            {values.paymentMethod === "GCASH" ? "🟦" : values.paymentMethod === "MAYA" ? "🟩" : "💳"}
          </span>
          <span className="font-medium text-sm text-gray-900">
            {PAYMENT_LABELS[values.paymentMethod] || values.paymentMethod}
          </span>
        </div>

        {values.couponCode && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-green-50 border border-green-200 rounded-lg text-sm">
            <span className="text-green-600 font-medium">Coupon: {values.couponCode}</span>
          </div>
        )}

        <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {pointsDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Points Discount ({values.pointsToRedeem} pts)</span>
              <span>-{formatCurrency(pointsDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>Shipping Fee</span>
            <span>{formatCurrency(shippingFee)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Health disclaimer */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800">
          <p className="font-semibold mb-1">Health Supplement Disclaimer</p>
          <p>
            These products are food supplements and are not intended to diagnose, treat, cure, or prevent any disease.
            FDA-registered. Results may vary. Consult your healthcare provider before use if pregnant, nursing, or taking medication.
          </p>
        </div>
      </div>

      {/* Submit */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
          <Shield className="w-4 h-4 text-green-500" />
          <span>Secured by PayMongo • 256-bit SSL encryption</span>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="px-6 py-3 text-sm font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 text-base"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              `Place Order • ${formatCurrency(total)}`
            )}
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-3">
          By placing your order, you agree to our Terms & Conditions and Refund Policy.
        </p>
      </div>
    </div>
  );
}
