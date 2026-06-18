import prisma from "@/lib/db";
import { generateOrderNumber } from "@/lib/utils";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { productRepository } from "@/repositories/product.repository";
import type { CheckoutInput } from "@/lib/validations/order";
function toNum(d: { toString(): string } | number): number {
  return typeof d === "number" ? d : parseFloat(d.toString());
}

export const orderService = {
  async createOrder(userId: string, input: CheckoutInput) {
    return prisma.$transaction(async (tx) => {
      // Get cart
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new Error("Cart is empty");
      }

      // Validate stock and calculate subtotal
      let subtotal = 0;
      for (const item of cart.items) {
        const available =
          item.product.stockQuantity - item.product.reservedQuantity;
        if (available < item.quantity) {
          throw new Error(
            `Insufficient stock for ${item.product.name}. Available: ${available}`
          );
        }
        subtotal += toNum(item.product.price) * item.quantity;
      }

      // Validate address
      const address = await tx.address.findFirst({
        where: { id: input.addressId, userId },
      });
      if (!address) throw new Error("Invalid shipping address");

      // Apply coupon
      let discountAmount = 0;
      let couponId: string | undefined;
      if (input.couponCode) {
        const coupon = await tx.coupon.findFirst({
          where: {
            code: input.couponCode,
            isActive: true,
            deletedAt: null,
            expiresAt: { not: { lt: new Date() } },
            startsAt: { not: { gt: new Date() } },
          },
        });

        if (!coupon) throw new Error("Invalid or expired coupon");
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          throw new Error("Coupon usage limit reached");
        }
        if (
          coupon.minimumPurchase &&
          subtotal < toNum(coupon.minimumPurchase)
        ) {
          throw new Error(
            `Minimum purchase of ₱${coupon.minimumPurchase} required`
          );
        }

        couponId = coupon.id;
        if (coupon.type === "PERCENTAGE") {
          discountAmount = subtotal * (toNum(coupon.value) / 100);
          if (coupon.maximumDiscount) {
            discountAmount = Math.min(
              discountAmount,
              toNum(coupon.maximumDiscount)
            );
          }
        } else if (coupon.type === "FIXED_AMOUNT") {
          discountAmount = Math.min(toNum(coupon.value), subtotal);
        }
      }

      // Calculate shipping
      const shippingFee = await this.calculateShipping(
        address.region,
        cart.items
      );

      // Reward points
      let pointsRedeemed = 0;
      let pointsDiscount = 0;
      if (input.pointsToRedeem > 0) {
        const pointsAccount = await tx.rewardPointsAccount.findUnique({
          where: { userId },
        });
        const settings = await tx.rewardSettings.findFirst();
        if (pointsAccount && settings) {
          const maxRedeemable = Math.min(
            input.pointsToRedeem,
            pointsAccount.balance
          );
          pointsRedeemed = maxRedeemable;
          pointsDiscount = maxRedeemable * toNum(settings.pesoPerPoint);
        }
      }

      const total = Math.max(
        0,
        subtotal - discountAmount - pointsDiscount + shippingFee
      );

      // Create order
      const order = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId,
          addressId: input.addressId,
          couponId,
          status: "PENDING",
          subtotal,
          discountAmount: discountAmount + pointsDiscount,
          shippingFee,
          tax: 0,
          total,
          pointsRedeemed,
          notes: input.notes,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              productSku: item.product.sku,
              productImage: item.product.thumbnail,
              quantity: item.quantity,
              unitPrice: item.product.salePrice || item.product.price,
              totalPrice:
                toNum(item.product.salePrice || item.product.price) *
                item.quantity,
            })),
          },
          statusHistory: {
            create: { status: "PENDING", comment: "Order placed" },
          },
        },
        include: {
          items: true,
          address: true,
          user: true,
        },
      });

      // Reserve stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { reservedQuantity: { increment: item.quantity } },
        });
      }

      // Deduct reward points
      if (pointsRedeemed > 0) {
        await tx.rewardPointsAccount.update({
          where: { userId },
          data: {
            balance: { decrement: pointsRedeemed },
            totalRedeemed: { increment: pointsRedeemed },
          },
        });
        await tx.pointsTransaction.create({
          data: {
            account: { connect: { userId } },
            orderId: order.id,
            type: "REDEEMED",
            points: -pointsRedeemed,
            description: `Redeemed for order ${order.orderNumber}`,
          },
        });
      }

      // Update coupon usage
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });
        await tx.couponUsage.create({
          data: {
            couponId,
            orderId: order.id,
            userId,
            discount: discountAmount,
          },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return order;
    });
  },

  async calculateShipping(
    region: string,
    items: Array<{ quantity: number; product: { weight: unknown } }>
  ): Promise<number> {
    // Map region to delivery zone
    const zone =
      region.toLowerCase().includes("metro manila") ||
      region.toLowerCase().includes("ncr")
        ? "METRO_MANILA"
        : region.toLowerCase().includes("cebu") ||
            region.toLowerCase().includes("iloilo") ||
            region.toLowerCase().includes("visayas")
          ? "VISAYAS"
          : region.toLowerCase().includes("davao") ||
              region.toLowerCase().includes("cagayan") ||
              region.toLowerCase().includes("mindanao")
            ? "MINDANAO"
            : "LUZON";

    const rate = await prisma.shippingRate.findFirst({
      where: { zone: zone as never, isActive: true },
      orderBy: { baseRate: "asc" },
    });

    if (!rate) return 150; // Default fallback

    const totalWeight = items.reduce((sum, item) => {
      const w = item.product.weight ? parseFloat(String(item.product.weight)) : 0.3;
      return sum + w * item.quantity;
    }, 0);

    return (
      parseFloat(rate.baseRate.toString()) +
      parseFloat(rate.ratePerKg.toString()) * totalWeight
    );
  },

  async confirmPayment(orderId: string) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: orderId },
        data: { status: "PAID", confirmedAt: new Date() },
        include: {
          items: { include: { product: true } },
          user: true,
          address: true,
        },
      });

      await tx.orderStatusHistory.create({
        data: { orderId, status: "PAID", comment: "Payment confirmed" },
      });

      // Reduce actual stock, release reservations
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: { decrement: item.quantity },
            reservedQuantity: { decrement: item.quantity },
            totalSold: { increment: item.quantity },
          },
        });

        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            orderId,
            type: "SALE",
            quantityBefore:
              item.product.stockQuantity + item.quantity,
            quantityChange: -item.quantity,
            quantityAfter: item.product.stockQuantity,
            reason: `Order ${order.orderNumber} paid`,
          },
        });
      }

      // Award reward points
      const settings = await tx.rewardSettings.findFirst();
      if (settings?.isActive) {
        const pointsEarned = Math.floor(
          toNum(order.total) * toNum(settings.pointsPerPeso)
        );
        if (pointsEarned > 0) {
          await tx.rewardPointsAccount.upsert({
            where: { userId: order.userId },
            create: {
              userId: order.userId,
              balance: pointsEarned,
              totalEarned: pointsEarned,
            },
            update: {
              balance: { increment: pointsEarned },
              totalEarned: { increment: pointsEarned },
            },
          });

          const account = await tx.rewardPointsAccount.findUnique({
            where: { userId: order.userId },
          });
          if (account) {
            await tx.pointsTransaction.create({
              data: {
                accountId: account.id,
                orderId,
                type: "EARNED",
                points: pointsEarned,
                description: `Earned from order ${order.orderNumber}`,
                expiresAt: new Date(
                  Date.now() +
                    settings.pointsExpiryDays * 24 * 60 * 60 * 1000
                ),
              },
            });
          }

          await tx.order.update({
            where: { id: orderId },
            data: { pointsEarned },
          });
        }
      }

      // Send confirmation email
      try {
        await sendOrderConfirmationEmail({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.user.name || order.user.email,
          customerEmail: order.user.email,
          items: order.items.map((i) => ({
            name: i.productName,
            quantity: i.quantity,
            price: `₱${parseFloat(i.unitPrice.toString()).toFixed(2)}`,
          })),
          total: `₱${toNum(order.total).toFixed(2)}`,
          shippingAddress: [
            order.address.addressLine1,
            order.address.city,
            order.address.province,
          ].join(", "),
        });
      } catch {
        // Non-critical - log but don't fail
      }

      // Check low stock
      for (const item of order.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            name: true,
            sku: true,
            stockQuantity: true,
            lowStockThreshold: true,
            criticalThreshold: true,
          },
        });
        if (
          product &&
          product.stockQuantity <= product.lowStockThreshold
        ) {
          await tx.notification.create({
            data: {
              userId: order.userId,
              type: "INVENTORY_ALERT",
              title: `Low Stock: ${product.name}`,
              message: `Stock is at ${product.stockQuantity} units`,
              data: { productId: product.id },
            },
          });
        }
      }

      return order;
    });
  },
};
