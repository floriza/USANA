import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/payment/paymongo";
import { orderService } from "@/services/order.service";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("paymongo-signature") || "";

    if (!verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const { type, data } = event;

    if (type === "payment.paid") {
      const paymentIntentId = data.attributes.payment_intent_id;

      const payment = await prisma.payment.findUnique({
        where: { paymentIntentId },
        include: { order: true },
      });

      if (!payment) {
        return NextResponse.json({ error: "Payment not found" }, { status: 404 });
      }

      if (payment.status === "PAID") {
        // Idempotency - already processed
        return NextResponse.json({ received: true });
      }

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "PAID",
          paidAt: new Date(),
          gatewayReference: data.id,
          gatewayResponse: data as object,
        },
      });

      await orderService.confirmPayment(payment.orderId);
    }

    if (type === "payment.failed") {
      const paymentIntentId = data.attributes.payment_intent_id;

      const payment = await prisma.payment.findUnique({
        where: { paymentIntentId },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "FAILED",
            failureReason: data.attributes.last_payment_error?.description,
            gatewayResponse: data as object,
          },
        });

        await prisma.order.update({
          where: { id: payment.orderId },
          data: { status: "PENDING" },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
