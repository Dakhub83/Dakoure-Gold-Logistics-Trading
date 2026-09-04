import { describe, it, expect } from "vitest";
import { createHmac } from "node:crypto";
import { verifyWebhookSignature } from "../webhooks/signature.js";

const secret = "test-secret";

function sign(body: string, ts: string) {
  return createHmac("sha256", secret).update(`${ts}.`).update(body).digest("hex");
}

describe("webhook signature verification", () => {
  it("accepts a correctly signed, fresh payload", () => {
    const body = JSON.stringify({ hello: "world" });
    const ts = String(Math.floor(Date.now() / 1000));
    const result = verifyWebhookSignature({
      secret,
      rawBody: body,
      signatureHeader: `sha256=${sign(body, ts)}`,
      timestampHeader: ts,
    });
    expect(result).toEqual({ ok: true });
  });

  it("rejects a tampered body", () => {
    const ts = String(Math.floor(Date.now() / 1000));
    const result = verifyWebhookSignature({
      secret,
      rawBody: JSON.stringify({ hello: "tampered" }),
      signatureHeader: `sha256=${sign(JSON.stringify({ hello: "world" }), ts)}`,
      timestampHeader: ts,
    });
    expect(result).toEqual({ ok: false, reason: "bad_signature" });
  });

  it("rejects a stale timestamp (replay protection)", () => {
    const body = JSON.stringify({ hello: "world" });
    const staleTs = String(Math.floor(Date.now() / 1000) - 1000);
    const result = verifyWebhookSignature({
      secret,
      rawBody: body,
      signatureHeader: `sha256=${sign(body, staleTs)}`,
      timestampHeader: staleTs,
      toleranceSeconds: 300,
    });
    expect(result).toEqual({ ok: false, reason: "stale_timestamp" });
  });

  it("rejects missing headers outright", () => {
    const result = verifyWebhookSignature({
      secret,
      rawBody: "{}",
      signatureHeader: undefined,
      timestampHeader: undefined,
    });
    expect(result).toEqual({ ok: false, reason: "missing_headers" });
  });
});
