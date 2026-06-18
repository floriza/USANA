import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`;

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}) {
  return resend.emails.send({
    from: FROM,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    text,
  });
}

export async function sendOrderConfirmationEmail(order: {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{ name: string; quantity: number; price: string }>;
  total: string;
  shippingAddress: string;
}) {
  const itemsHtml = order.items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee">${i.name}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${i.price}</td>
        </tr>`
    )
    .join("");

  return sendEmail({
    to: order.customerEmail,
    subject: `Order Confirmed - ${order.orderNumber}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1a56db;padding:20px;text-align:center">
          <h1 style="color:white;margin:0">USANA Store Philippines</h1>
          <p style="color:#bfdbfe;margin:5px 0;font-size:12px">Independent USANA Distributor</p>
        </div>
        <div style="padding:30px">
          <h2>Thank you for your order, ${order.customerName}!</h2>
          <p>Your order <strong>${order.orderNumber}</strong> has been confirmed.</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0">
            <thead>
              <tr style="background:#f3f4f6">
                <th style="padding:8px;text-align:left">Product</th>
                <th style="padding:8px;text-align:center">Qty</th>
                <th style="padding:8px;text-align:right">Price</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding:8px;text-align:right;font-weight:bold">Total:</td>
                <td style="padding:8px;text-align:right;font-weight:bold">${order.total}</td>
              </tr>
            </tfoot>
          </table>
          <p><strong>Shipping to:</strong><br>${order.shippingAddress}</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/orders/${order.id}"
             style="display:inline-block;background:#1a56db;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;margin-top:10px">
            Track Your Order
          </a>
        </div>
        <div style="background:#f9fafb;padding:20px;text-align:center;font-size:12px;color:#6b7280">
          <p>This website is operated by an Independent USANA Distributor and is not owned or operated by USANA Health Sciences.</p>
          <p>These statements have not been evaluated by the Food and Drug Administration. These products are not intended to diagnose, treat, cure, or prevent any disease.</p>
        </div>
      </div>
    `,
  });
}

export async function sendShipmentEmail(order: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  trackingNumber: string;
  courier: string;
}) {
  return sendEmail({
    to: order.customerEmail,
    subject: `Your Order ${order.orderNumber} Has Been Shipped!`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1a56db;padding:20px;text-align:center">
          <h1 style="color:white;margin:0">USANA Store Philippines</h1>
        </div>
        <div style="padding:30px">
          <h2>Your order is on its way, ${order.customerName}!</h2>
          <p>Order: <strong>${order.orderNumber}</strong></p>
          <div style="background:#f0fdf4;border:1px solid #86efac;padding:16px;border-radius:8px;margin:20px 0">
            <p style="margin:0"><strong>Courier:</strong> ${order.courier}</p>
            <p style="margin:8px 0 0"><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
          </div>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/orders"
             style="display:inline-block;background:#1a56db;color:white;padding:12px 24px;text-decoration:none;border-radius:6px">
            View Order Details
          </a>
        </div>
        <div style="background:#f9fafb;padding:20px;text-align:center;font-size:12px;color:#6b7280">
          <p>This website is operated by an Independent USANA Distributor and is not owned or operated by USANA Health Sciences.</p>
        </div>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
) {
  return sendEmail({
    to: email,
    subject: "Reset Your Password - USANA Store",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1a56db;padding:20px;text-align:center">
          <h1 style="color:white;margin:0">USANA Store Philippines</h1>
        </div>
        <div style="padding:30px">
          <h2>Password Reset Request</h2>
          <p>Click the button below to reset your password. This link expires in 1 hour.</p>
          <a href="${resetUrl}"
             style="display:inline-block;background:#1a56db;color:white;padding:12px 24px;text-decoration:none;border-radius:6px">
            Reset Password
          </a>
          <p style="color:#6b7280;font-size:14px;margin-top:20px">If you did not request this, please ignore this email.</p>
        </div>
      </div>
    `,
  });
}

export async function sendLowStockAlert(product: {
  name: string;
  sku: string;
  stockQuantity: number;
  threshold: number;
  isCritical: boolean;
}) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.RESEND_FROM_EMAIL!;
  return sendEmail({
    to: adminEmail,
    subject: `${product.isCritical ? "🚨 CRITICAL" : "⚠️ LOW"} Stock Alert: ${product.name}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:${product.isCritical ? "#dc2626" : "#d97706"};padding:20px;text-align:center">
          <h1 style="color:white;margin:0">${product.isCritical ? "Critical" : "Low"} Stock Alert</h1>
        </div>
        <div style="padding:30px">
          <p><strong>Product:</strong> ${product.name}</p>
          <p><strong>SKU:</strong> ${product.sku}</p>
          <p><strong>Current Stock:</strong> ${product.stockQuantity} units</p>
          <p><strong>Threshold:</strong> ${product.threshold} units</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/inventory"
             style="display:inline-block;background:#1a56db;color:white;padding:12px 24px;text-decoration:none;border-radius:6px">
            Manage Inventory
          </a>
        </div>
      </div>
    `,
  });
}
