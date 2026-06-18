"use client";

import { useState } from "react";
import { Plus, MapPin, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addressSchema, type AddressInput, type AddressInputRaw } from "@/lib/validations/order";
import type { CheckoutForm } from "./checkout-flow";

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

export interface AddressStepProps {
  addresses: Address[];
  form: CheckoutForm;
  onNext: () => void;
}

export function AddressStep({ addresses, form, onNext }: AddressStepProps) {
  const router = useRouter();
  const [showNewForm, setShowNewForm] = useState(addresses.length === 0);
  const [isSaving, setIsSaving] = useState(false);

  const newAddressForm = useForm<AddressInputRaw, unknown, AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: { isDefault: addresses.length === 0 },
  });

  const selectedId = form.watch("addressId");

  async function saveNewAddress(data: AddressInput) {
    setIsSaving(true);
    try {
      const res = await fetch("/api/v1/customer/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save address");
      form.setValue("addressId", json.data.id);
      toast.success("Address saved");
      router.refresh();
      setShowNewForm(false);
      onNext();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save address");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-blue-600" />
        Shipping Address
      </h2>

      {addresses.length > 0 && !showNewForm && (
        <div className="space-y-3 mb-5">
          {addresses.map((addr) => (
            <label
              key={addr.id}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                selectedId === addr.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-200"
              }`}
            >
              <input
                type="radio"
                className="sr-only"
                value={addr.id}
                checked={selectedId === addr.id}
                onChange={() => form.setValue("addressId", addr.id)}
              />
              <div
                className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  selectedId === addr.id
                    ? "border-blue-500 bg-blue-500"
                    : "border-gray-300"
                }`}
              >
                {selectedId === addr.id && <Check className="w-3 h-3 text-white" />}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-gray-900 text-sm">
                    {addr.firstName} {addr.lastName}
                  </span>
                  {addr.isDefault && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      Default
                    </span>
                  )}
                  {addr.label && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {addr.label}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{addr.phone}</p>
                <p className="text-sm text-gray-600">
                  {addr.addressLine1}
                  {addr.addressLine2 && `, ${addr.addressLine2}`}
                  {`, ${addr.barangay}, ${addr.city}, ${addr.province} ${addr.zipCode}`}
                </p>
              </div>
            </label>
          ))}

          <button
            type="button"
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-2 text-blue-600 text-sm font-medium hover:text-blue-700 mt-2"
          >
            <Plus className="w-4 h-4" />
            Add new address
          </button>
        </div>
      )}

      {showNewForm && (
        <form onSubmit={newAddressForm.handleSubmit(saveNewAddress)} className="space-y-4 mb-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                {...newAddressForm.register("firstName")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Juan"
              />
              {newAddressForm.formState.errors.firstName && (
                <p className="text-xs text-red-500 mt-1">{newAddressForm.formState.errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                {...newAddressForm.register("lastName")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Dela Cruz"
              />
              {newAddressForm.formState.errors.lastName && (
                <p className="text-xs text-red-500 mt-1">{newAddressForm.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                {...newAddressForm.register("phone")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="09XXXXXXXXX"
              />
              {newAddressForm.formState.errors.phone && (
                <p className="text-xs text-red-500 mt-1">{newAddressForm.formState.errors.phone.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label (optional)</label>
              <input
                {...newAddressForm.register("label")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Home / Office"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
            <input
              {...newAddressForm.register("addressLine1")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="House/Unit No., Street Name"
            />
            {newAddressForm.formState.errors.addressLine1 && (
              <p className="text-xs text-red-500 mt-1">{newAddressForm.formState.errors.addressLine1.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (optional)</label>
            <input
              {...newAddressForm.register("addressLine2")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Building, Subdivision, Landmark"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Barangay</label>
              <input
                {...newAddressForm.register("barangay")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {newAddressForm.formState.errors.barangay && (
                <p className="text-xs text-red-500 mt-1">{newAddressForm.formState.errors.barangay.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City / Municipality</label>
              <input
                {...newAddressForm.register("city")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {newAddressForm.formState.errors.city && (
                <p className="text-xs text-red-500 mt-1">{newAddressForm.formState.errors.city.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
              <input
                {...newAddressForm.register("province")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {newAddressForm.formState.errors.province && (
                <p className="text-xs text-red-500 mt-1">{newAddressForm.formState.errors.province.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <input
                {...newAddressForm.register("region")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="NCR / Region III"
              />
              {newAddressForm.formState.errors.region && (
                <p className="text-xs text-red-500 mt-1">{newAddressForm.formState.errors.region.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
              <input
                {...newAddressForm.register("zipCode")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={4}
                placeholder="1234"
              />
              {newAddressForm.formState.errors.zipCode && (
                <p className="text-xs text-red-500 mt-1">{newAddressForm.formState.errors.zipCode.message}</p>
              )}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              {...newAddressForm.register("isDefault")}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Set as default address
          </label>

          <div className="flex gap-3">
            {addresses.length > 0 && (
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save & Continue"}
            </button>
          </div>
        </form>
      )}

      {!showNewForm && addresses.length > 0 && (
        <button
          type="button"
          onClick={() => {
            if (!selectedId) {
              toast.error("Please select a shipping address");
              return;
            }
            onNext();
          }}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          Continue to Shipping
        </button>
      )}
    </div>
  );
}
