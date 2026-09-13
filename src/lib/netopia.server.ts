// NETOPIA Payments (v2 "Start Payment" custom integration).
// All credentials stay server-side. Switching sandbox -> live only requires
// changing NETOPIA_ENVIRONMENT and the credential secrets.

export type NetopiaEnvironment = "sandbox" | "live";

const SANDBOX_BASE = "https://secure.sandbox.netopia-payments.com";
const LIVE_BASE = "https://secure.netopia-payments.com";

export type NetopiaConfig = {
  environment: NetopiaEnvironment;
  apiKey: string;
  posSignature: string;
  baseUrl: string;
};

export function readNetopiaConfig(): NetopiaConfig | null {
  const environment: NetopiaEnvironment =
    process.env["NETOPIA_ENVIRONMENT"] === "live" ? "live" : "sandbox";
  const apiKey = process.env["NETOPIA_API_KEY"];
  const posSignature = process.env["NETOPIA_POS_SIGNATURE"];
  if (!apiKey || !posSignature) return null;
  return {
    environment,
    apiKey,
    posSignature,
    baseUrl:
      process.env["NETOPIA_BASE_URL"] ?? (environment === "live" ? LIVE_BASE : SANDBOX_BASE),
  };
}

export type StartPaymentInput = {
  orderNumber: string;
  amountCents: number;
  currency: string;
  description: string;
  redirectUrl: string;
  notifyUrl: string;
  billing: {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    city: string;
    country: string;
    county: string;
    postalCode: string;
    details: string;
  };
};

export type StartPaymentResult = {
  paymentUrl: string | null;
  providerPaymentId: string | null;
  status: number | null;
  formData: Record<string, string> | null;
  raw: unknown;
};

export async function startNetopiaPayment(
  config: NetopiaConfig,
  input: StartPaymentInput,
): Promise<StartPaymentResult> {
  const billing = {
    email: input.billing.email,
    phone: input.billing.phone,
    firstName: input.billing.firstName,
    lastName: input.billing.lastName,
    city: input.billing.city,
    country: 642, // numeric ISO code for Romania, as required by NETOPIA
    countryName: input.billing.country,
    state: input.billing.county,
    postalCode: input.billing.postalCode,
    details: input.billing.details,
  };

  const body = {
    config: {
      notifyUrl: input.notifyUrl,
      redirectUrl: input.redirectUrl,
      language: "ro",
    },
    payment: {
      options: { installments: 0, bonus: 0 },
      instrument: { type: "card" },
      data: {},
    },
    order: {
      ntpID: "",
      posSignature: config.posSignature,
      dateTime: new Date().toISOString(),
      description: input.description,
      orderID: input.orderNumber,
      amount: input.amountCents / 100,
      currency: input.currency,
      billing,
      shipping: billing,
      products: [],
      installments: { selected: 0, available: [0] },
      data: {},
    },
  };

  const response = await fetch(`${config.baseUrl}/payment/card/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: config.apiKey,
    },
    body: JSON.stringify(body),
  });

  const raw = (await response.json().catch(() => null)) as
    | {
        payment?: {
          paymentURL?: string;
          ntpID?: string;
          status?: number;
          token?: string;
          data?: Record<string, string>;
        };
        error?: { message?: string; code?: string };
        customerAction?: { url?: string; formData?: Record<string, string> };
      }
    | null;

  if (!response.ok) {
    throw new Error(
      `NETOPIA start payment failed (${response.status}): ${raw?.error?.message ?? "unknown error"}`,
    );
  }

  return {
    paymentUrl: raw?.payment?.paymentURL ?? raw?.customerAction?.url ?? null,
    providerPaymentId: raw?.payment?.ntpID ?? null,
    status: raw?.payment?.status ?? null,
    formData: raw?.customerAction?.formData ?? null,
    raw,
  };
}

// NETOPIA status codes -> our internal payment status.
export function mapNetopiaStatus(status: number | null | undefined): {
  payment: "pending" | "paid" | "failed" | "cancelled";
  order: "pending" | "paid" | "failed" | "cancelled";
} {
  switch (status) {
    case 3: // paid (authorized)
    case 5: // confirmed
      return { payment: "paid", order: "paid" };
    case 12: // invalid / declined
    case 14:
    case 15:
      return { payment: "failed", order: "failed" };
    case 6: // pending, awaiting 3DS or review
    case 1:
    case 2:
      return { payment: "pending", order: "pending" };
    case 0:
      return { payment: "cancelled", order: "cancelled" };
    default:
      return { payment: "pending", order: "pending" };
  }
}
