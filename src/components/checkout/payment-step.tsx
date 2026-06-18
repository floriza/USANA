"use client";

import { CreditCard, Smartphone, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { CheckoutForm } from "./checkout-flow";

interface PaymentStepProps {
  form: CheckoutForm;
  pointsBalance: number;
  pointsPerPeso: number;
  subtotal: number;
  onNext: () => void;
  onBack: () => void;
}

const PAYMENT_METHODS = [
  {
    id: "GCASH" as const,
    name: "GCash",
    icon: "🟦",
    desc: "Pay via GCash e-wallet",
    tag: "Most Popular",
  },
  {
    id: "MAYA" as const,
    name: "Maya",
    icon: "🟩",
    desc: "Pay via Maya (formerly PayMaya)",
  },
  {
    id: "CREDIT_CARD" as const,
    name: "Credit Card",
    icon: "💳",
    desc: "Visa, Mastercard, JCB",
  },
  {
    id: "DEBIT_CARD" as const,
    name: "Debit Card",
    icon: "🏦",
    desc: "Visa Debit, Mastercard Debit",
  },
];

export function PaymentStep({
  form,
  pointsBalance,
  pointsPerPeso,
  subtotal,
  onNext,
  onBack,
}: PaymentStepProps) {
  const selectedMethod = form.watch("paymentMethod");
  const pointsToRedeem = form.watch("pointsToRedeem");
  const couponCode = form.watch("couponCode");

  const maxRedeemable = Math.min(pointsBalance, Math.floor(subtotal / pointsPerPeso));
  const pointsDiscount = (pointsToRedeem ?? 0) * pointsPerPeso;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-blue-600" />
        Payment Method
      </h2>

      {/* Payment methods */}
      <div className="space-y-3 mb-6">
        {PAYMENT_METHODS.map((method) => (
          <label
            key={method.id}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
              selectedMethod === method.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-200"
            }`}
          >
            <input
              type="radio"
              className="sr-only"
              value={method.id}
              checked={selectedMethod === method.id}
              onChange={() => form.setValue("paymentMethod", method.id)}
            />
            <span className="text-2xl">{method.icon}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 text-sm">{method.name}</span>
                {method.tag && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    {method.tag}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">{method.desc}</p>
            </div>
            <div
              className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                selectedMethod === method.id
                  ? "border-blue-500 bg-blue-500"
                  : "border-gray-300"
              }`}
            />
          </label>
        ))}
      </div>

      {/* Coupon */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Coupon Code (optional)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            {...form.register("couponCode")}
            placeholder="Enter coupon code"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
            onChange={(e) => form.setValue("couponCode", e.target.value.toUpperCase())}
          />
        </div>
        {couponCode && (
          <p className="text-xs text-gray-500 mt-1">Coupon will be applied at checkout</p>
        )}
      </div>

      {/* Reward Points */}
      {pointsBalance > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-yellow-600" />
            <span className="font-semibold text-gray-900 text-sm">Reward Points</span>
            <span className="text-xs text-gray-500 ml-auto">
              Balance: <strong>{pointsBalance.toLocaleString()} pts</strong>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <input
                type="range"
                min={0}
                max={maxRedeemable}
                step={1}
                value={pointsToRedeem ?? 0}
                onChange={(e) => form.setValue("pointsToRedeem", parseInt(e.target.value))}
                className="w-full accent-yellow-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-0.5">
                <span>0 pts</span>
                <span>{maxRedeemable.toLocaleString()} pts max</span>
              </div>
            </div>
            <div className="text-right min-w-[80px]">
              <p className="font-bold text-gray-900 text-sm">
                {(pointsToRedeem ?? 0).toLocaleString()} pts
              </p>
              {pointsDiscount > 0 && (
                <p className="text-xs text-green-600 font-medium">
                  -{formatCurrency(pointsDiscount)}
                </p>
              )}
            </div>
          </div>
          {pointsPerPeso > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              {(1 / pointsPerPeso).toFixed(0)} points = ₱1.00
            </p>
          )}
        </div>
      )}

      {/* Mobile payments info */}
      {(selectedMethod === "GCASH" || selectedMethod === "MAYA") && (
        <div className="mb-5 p-3 bg-gray-50 rounded-lg flex items-start gap-2">
          <Smartphone className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-600">
            You will be redirected to {selectedMethod === "GCASH" ? "GCash" : "Maya"} to complete payment. Make sure your app is updated.
          </p>
        </div>
      )}

      {/* Notes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Order Notes (optional)
        </label>
        <textarea
          {...form.register("notes")}
          rows={2}
          placeholder="Special instructions, delivery notes..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 text-sm font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          Review Order
        </button>
      </div>
    </div>
  );
}
