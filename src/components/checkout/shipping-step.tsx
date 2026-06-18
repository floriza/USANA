"use client";

import { useEffect, useState } from "react";
import { Truck, Package, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type Address = {
  region: string;
  city: string;
  province: string;
} | undefined;

type CartItem = {
  quantity: number;
  product: { weight: string | null };
};

interface ShippingRate {
  id: string;
  courier: string;
  zone: string;
  baseRate: string;
  ratePerKg: string;
  estimatedDays: string;
  isActive: boolean;
}

interface ShippingStepProps {
  selectedAddress: Address;
  cartItems: CartItem[];
  onShippingFeeChange: (fee: number) => void;
  onNext: () => void;
  onBack: () => void;
}

const COURIER_INFO: Record<string, { logo: string; desc: string }> = {
  "J&T Express": { logo: "🟠", desc: "Reliable nationwide delivery" },
  "Ninja Van": { logo: "🟢", desc: "Fast door-to-door service" },
  "Flash Express": { logo: "🔵", desc: "Same-day Metro Manila" },
  "Lalamove": { logo: "🟡", desc: "On-demand delivery" },
  "Standard Shipping": { logo: "📦", desc: "Economy shipping" },
};

export function ShippingStep({
  selectedAddress,
  cartItems,
  onShippingFeeChange,
  onNext,
  onBack,
}: ShippingStepProps) {
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const totalWeight = cartItems.reduce((sum, item) => {
    const w = item.product.weight ? parseFloat(item.product.weight) : 0.3;
    return sum + w * item.quantity;
  }, 0);

  useEffect(() => {
    async function fetchRates() {
      if (!selectedAddress) return;
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/v1/shipping/rates?region=${encodeURIComponent(selectedAddress.region)}&weight=${totalWeight}`
        );
        const data = await res.json();
        if (data.data) {
          setRates(data.data);
          if (data.data.length > 0) {
            setSelectedRate(data.data[0]);
            onShippingFeeChange(parseFloat(data.data[0].fee));
          }
        }
      } catch {
        // Fallback: show a single default rate
        const fallback = {
          id: "default",
          courier: "Standard Shipping",
          zone: "LUZON",
          baseRate: "150",
          ratePerKg: "30",
          estimatedDays: "3-5",
          isActive: true,
          fee: (150 + 30 * totalWeight).toFixed(2),
        };
        setRates([fallback as never]);
        setSelectedRate(fallback as never);
        onShippingFeeChange(parseFloat(fallback.fee));
      } finally {
        setIsLoading(false);
      }
    }
    fetchRates();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAddress?.region, totalWeight]);

  function selectRate(rate: ShippingRate & { fee?: string }) {
    setSelectedRate(rate);
    const fee = (rate as { fee?: string }).fee
      ? parseFloat((rate as { fee?: string }).fee!)
      : parseFloat(rate.baseRate) + parseFloat(rate.ratePerKg) * totalWeight;
    onShippingFeeChange(fee);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
        <Truck className="w-5 h-5 text-blue-600" />
        Shipping Method
      </h2>
      {selectedAddress && (
        <p className="text-sm text-gray-500 mb-5">
          Delivering to {selectedAddress.city}, {selectedAddress.province} ({selectedAddress.region})
        </p>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {rates.map((rate) => {
            const rateWithFee = rate as ShippingRate & { fee?: string };
            const fee = rateWithFee.fee
              ? parseFloat(rateWithFee.fee)
              : parseFloat(rate.baseRate) + parseFloat(rate.ratePerKg) * totalWeight;
            const info = COURIER_INFO[rate.courier] || { logo: "📦", desc: "Delivery service" };
            const isSelected = selectedRate?.id === rate.id;

            return (
              <label
                key={rate.id}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-200"
                }`}
              >
                <input
                  type="radio"
                  className="sr-only"
                  checked={isSelected}
                  onChange={() => selectRate(rate as never)}
                />
                <span className="text-2xl">{info.logo}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{rate.courier}</p>
                  <p className="text-xs text-gray-500">{info.desc}</p>
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{rate.estimatedDays} business days</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatCurrency(fee)}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                    <Package className="w-3 h-3" />
                    {totalWeight.toFixed(2)} kg
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      )}

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
          disabled={!selectedRate || isLoading}
          className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
}
