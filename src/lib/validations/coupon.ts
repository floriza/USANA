import { z } from "zod";

export const couponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  name: z.string().min(2),
  description: z.string().optional(),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"]),
  value: z.number().positive(),
  minimumPurchase: z.number().positive().optional().nullable(),
  maximumDiscount: z.number().positive().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  perUserLimit: z.number().int().positive().default(1),
  isActive: z.boolean().default(true),
  startsAt: z.string().datetime().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
});

export type CouponInput = z.infer<typeof couponSchema>;
