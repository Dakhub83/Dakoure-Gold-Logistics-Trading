import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { config } from "../config.js";
import { verifySharedSecret } from "./signature.js";
import {
  applyLogisticsCheckpoint,
  SealNotFoundError,
  ConsignmentNotFoundError,
} from "../custody/service.js";

const logisticsUpdateSchema = z.object({
  external_event_id: z.string().min(1),
  carrier: z.string().min(1), // slug, e.g. 'brinks' | 'malca-amit'
  seal_number: z.string().min(1),
  checkpoint: z.enum(["ORIGIN", "IN_TRANSIT", "CUSTOMS", "REFINERY_INTAKE"]),
  occurred_at: z.string().datetime(),
  location: z.string().optional(),
  api_key_id: z.string().uuid().optional(),
});

export const logisticsUpdateRouter = Router();

/**
 * Generic logistics-update ingestion, spec-requested §3: validates a
 * shared webhook secret (not per-carrier HMAC — this is a bearer-token
 * integration, distinct from the structured per-carrier route in
 * carriers.ts), correlates cargo by physical seal number rather than AWB,
 * logs the checkpoint, and — on REFINERY_INTAKE — moves the lot to
 * 'verifying_assay'.
 */
logisticsUpdateRouter.post(
  "/api/v1/webhooks/logistics-update",
  async (req: Request, res: Response) => {
    if (!verifySharedSecret(config.logisticsWebhookSecret, req.header("x-webhook-secret"))) {
      return res.status(401).json({ error: "invalid_webhook_secret" });
    }

    const parsed = logisticsUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "invalid_payload", details: parsed.error.flatten() });
    }
    const body = parsed.data;

    const carrier = await prisma.carrier.findFirst({
      where: { name: { equals: body.carrier, mode: "insensitive" } },
    });
    if (!carrier) return res.status(404).json({ error: "unknown_carrier" });

    if (body.api_key_id) {
      const key = await prisma.apiKey.findUnique({ where: { id: body.api_key_id } });
      if (!key || key.revokedAt) {
        return res.status(401).json({ error: "invalid_or_revoked_api_key" });
      }
    }

    // Idempotency at the database, same pattern as the per-carrier route.
    const existing = await prisma.carrierEvent.findUnique({
      where: { externalEventId: body.external_event_id },
    });
    if (existing) {
      return res.status(202).json({ status: "duplicate_ignored" });
    }
    await prisma.carrierEvent.create({
      data: {
        carrierId: carrier.id,
        externalEventId: body.external_event_id,
        eventType: `checkpoint.${body.checkpoint.toLowerCase()}`,
        rawPayload: body,
        processedAt: new Date(),
      },
    });

    try {
      const result = await applyLogisticsCheckpoint(prisma, {
        sealCode: body.seal_number,
        checkpoint: body.checkpoint,
        location: body.location,
        signedByApiKeyId: body.api_key_id,
      });
      return res.status(202).json({ status: "accepted", ...result });
    } catch (err) {
      if (err instanceof SealNotFoundError || err instanceof ConsignmentNotFoundError) {
        // Recorded above for audit even though we can't advance anything yet.
        return res.status(202).json({ status: "accepted_unmatched_seal" });
      }
      throw err;
    }
  }
);
