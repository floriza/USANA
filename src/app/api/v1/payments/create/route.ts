import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createPaymentIntent } from "@/lib/payment/paymongo";
import { orderRepository } from "@/repositories/order.repository";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, paymentMethod } = await req.json();

    const order = await orderRepository.findById(orderId);
    if (!order || order.userId !== session.user.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "PENDING") {
      return NextResponse.json(
        { error: "Order is not in a payable state" },
        { status: 400 }
      );
    }

    // Check for duplicate payment
    if (order.payment && order.payment.status === "PAID") {
      return NextResponse.json(
        { error: "Order already paid" },
        { status: 400 }
      );
    }

    const intent = await createPaymentIntent({
      amount: parseFloat(order.total.toString()),
      description: `USANA Store - Order ${order.orderNumber}`,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId: session.user.id,
      },
    });

    // Store payment intent
    await prisma.payment.upsert({
      where: { orderId },
      create: {
        orderId,
        paymentIntentId: intent.data.id,
        paymentMethod: paymentMethod || "GCASH",
        status: "PENDING",
        amount: order.total,
      },
      update: {
        paymentIntentId: intent.data.id,
        status: "PENDING",
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "PAYMENT_PENDING" },
    });

    return NextResponse.json({
      success: true,
      data: {
        paymentIntentId: intent.data.id,
        clientKey: (intent.data.attributes as { client_key?: string }).client_key,
      },
    });
  } catch (error) {
    console.error("Payment create error:", error);
    return NextResponse.json({ error: "Payment initialization failed" }, { status: 500 });
  }
}
