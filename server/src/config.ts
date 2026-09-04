import "dotenv/config";

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined) {
    throw new Error(`Missing required env var ${name}`);
  }
  return v;
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? "dev-only-insecure-secret",
  /** carrier slug (from :carrierId in the webhook path) -> HMAC secret */
  carrierWebhookSecrets: {
    brinks: process.env.WEBHOOK_SECRET_BRINKS ?? "",
    "malca-amit": process.env.WEBHOOK_SECRET_MALCA_AMIT ?? "",
  } as Record<string, string>,
  /** shared bearer secret for POST /api/v1/webhooks/logistics-update */
  logisticsWebhookSecret: process.env.WEBHOOK_SECRET_LOGISTICS_UPDATE ?? "",
};

export { required };
