import { z } from "zod";

export const checkoutSchema = z.object({
  addressId: z.string().min(1, "Shipping address is required"),
  couponCode: z.string().optional(),
  paymentMethod: z.enum(["GCASH", "MAYA", "CREDIT_CARD", "DEBIT_CARD"]),
  pointsToRedeem: z.number().int().min(0).default(0),
  notes: z.string().optional(),
});

export const addressSchema = z.object({
  label: z.string().optional(),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  phone: z
    .string()
    .regex(/^(09|\+639)\d{9}$/, "Invalid Philippine phone number"),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  barangay: z.string().min(2, "Barangay is required"),
  city: z.string().min(2, "City is required"),
  province: z.string().min(2, "Province is required"),
  region: z.string().min(2, "Region is required"),
  zipCode: z.string().regex(/^\d{4}$/, "Invalid ZIP code"),
  isDefault: z.boolean().default(false),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CheckoutInputRaw = z.input<typeof checkoutSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type AddressInputRaw = z.input<typeof addressSchema>;
