import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verifies a carrier webhook per spec §2.2: HMAC-SHA256 over the raw body,
 * plus a timestamp window to block replay of a captured payload.
 */
export interface VerifyWebhookInput {
  secret: string;
  rawBody: Buffer | string;
  signatureHeader: string | undefined;
  timestampHeader: string | undefined;
  toleranceSeconds?: number;
  now?: () => number;
}

export type VerifyWebhookResult =
  | { ok: true }
  | { ok: false; reason: "missing_headers" | "stale_timestamp" | "bad_signature" };

export function verifyWebhookSignature(
  input: VerifyWebhookInput
): VerifyWebhookResult {
  const {
    secret,
    rawBody,
    signatureHeader,
    timestampHeader,
    toleranceSeconds = 300,
    now = () => Date.now(),
  } = input;

  if (!signatureHeader || !timestampHeader) {
    return { ok: false, reason: "missing_headers" };
  }

  const ts = Number(timestampHeader);
  if (!Number.isFinite(ts) || Math.abs(now() / 1000 - ts) > toleranceSeconds) {
    return { ok: false, reason: "stale_timestamp" };
  }

  const expected = createHmac("sha256", secret)
    .update(`${timestampHeader}.`)
    .update(rawBody)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "hex");
  const gotBuf = Buffer.from(stripPrefix(signatureHeader), "hex");

  if (expectedBuf.length !== gotBuf.length || !timingSafeEqual(expectedBuf, gotBuf)) {
    return { ok: false, reason: "bad_signature" };
  }
  return { ok: true };
}

function stripPrefix(sig: string): string {
  // carriers commonly send "sha256=<hex>"; accept bare hex too
  return sig.startsWith("sha256=") ? sig.slice("sha256=".length) : sig;
}

/**
 * Constant-time comparison for a plain shared-secret header (as opposed to
 * an HMAC over the body) — used by the generic logistics-update webhook,
 * where the sender is a bearer token holder rather than a signer.
 */
export function verifySharedSecret(expected: string, provided: string | undefined): boolean {
  if (!provided || !expected) return false;
  const expectedBuf = Buffer.from(expected, "utf8");
  const providedBuf = Buffer.from(provided, "utf8");
  if (expectedBuf.length !== providedBuf.length) return false;
  return timingSafeEqual(expectedBuf, providedBuf);
}
