const PAYMONGO_API = "https://api.paymongo.com/v1";
const SECRET_KEY = process.env.PAYMONGO_SECRET_KEY!;

function getAuthHeader(): string {
  return `Basic ${Buffer.from(SECRET_KEY + ":").toString("base64")}`;
}

async function paymongoFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${PAYMONGO_API}${path}`, {
    ...options,
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.errors?.[0]?.detail || "PayMongo API error");
  }

  return res.json();
}

export interface CreatePaymentIntentOptions {
  amount: number; // in centavos
  currency?: string;
  description?: string;
  metadata?: Record<string, string>;
}

export async function createPaymentIntent(options: CreatePaymentIntentOptions) {
  return paymongoFetch<{ data: { id: string; attributes: Record<string, unknown> } }>(
    "/payment_intents",
    {
      method: "POST",
      body: JSON.stringify({
        data: {
          attributes: {
            amount: Math.round(options.amount * 100), // Convert to centavos
            currency: options.currency || "PHP",
            description: options.description,
            payment_method_allowed: [
              "gcash",
              "paymaya",
              "card",
              "dob",
              "brankas_bdo",
              "brankas_landbank",
              "brankas_metrobank",
            ],
            metadata: options.metadata,
          },
        },
      }),
    }
  );
}

export async function createPaymentMethod(
  type: "gcash" | "paymaya" | "card",
  details?: {
    cardNumber?: string;
    expMonth?: number;
    expYear?: number;
    cvc?: string;
    billingName?: string;
    billingEmail?: string;
    billingPhone?: string;
  }
) {
  return paymongoFetch("/payment_methods", {
    method: "POST",
    body: JSON.stringify({
      data: {
        attributes: {
          type,
          details: details || {},
          billing: details
            ? {
                name: details.billingName,
                email: details.billingEmail,
                phone: details.billingPhone,
              }
            : undefined,
        },
      },
    }),
  });
}

export async function attachPaymentIntent(
  intentId: string,
  paymentMethodId: string,
  returnUrl: string
) {
  return paymongoFetch(`/payment_intents/${intentId}/attach`, {
    method: "POST",
    body: JSON.stringify({
      data: {
        attributes: {
          payment_method: paymentMethodId,
          return_url: returnUrl,
        },
      },
    }),
  });
}

export async function retrievePaymentIntent(intentId: string) {
  return paymongoFetch<{
    data: { id: string; attributes: { status: string; amount: number } };
  }>(`/payment_intents/${intentId}`);
}

export async function createRefund(
  paymentId: string,
  amount: number,
  reason: string
) {
  return paymongoFetch("/refunds", {
    method: "POST",
    body: JSON.stringify({
      data: {
        attributes: {
          amount: Math.round(amount * 100),
          payment_id: paymentId,
          reason,
        },
      },
    }),
  });
}

export function verifyWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  const secret = process.env.PAYMONGO_WEBHOOK_SECRET!;
  const crypto = require("crypto");
  const computedSig = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  return computedSig === signature;
}
