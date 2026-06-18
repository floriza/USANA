import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { orderRepository } from "@/repositories/order.repository";
import { hasPermission } from "@/lib/auth/permissions";
import { sendShipmentEmail } from "@/lib/email";
import prisma from "@/lib/db";
import type { OrderStatus, UserRole } from "@prisma/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !hasPermission(session.user.role as UserRole, "orders:read:all")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const order = await orderRepository.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !hasPermission(session.user.role as UserRole, "orders:update")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { status, comment, trackingNumber, courier } = await req.json();

    const order = await orderRepository.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updated = await orderRepository.updateStatus(
      id,
      status as OrderStatus,
      comment,
      session.user.id
    );

    // Handle shipment creation/update
    if (
      (status === "SHIPPED" || trackingNumber) &&
      (trackingNumber || courier)
    ) {
      await prisma.shipment.upsert({
        where: { orderId: id },
        create: {
          orderId: id,
          trackingNumber,
          courier: courier || "MANUAL",
          shippingFee: order.shippingFee,
          status: "IN_TRANSIT",
          shippedAt: new Date(),
        },
        update: {
          trackingNumber,
          courier: courier || "MANUAL",
          status: "IN_TRANSIT",
          shippedAt: new Date(),
        },
      });

      if (trackingNumber) {
        try {
          await sendShipmentEmail({
            orderNumber: order.orderNumber,
            customerName: order.user.name || order.user.email,
            customerEmail: order.user.email,
            trackingNumber,
            courier: courier || "Manual",
          });
        } catch {
          // Non-critical
        }
      }
    }

    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
