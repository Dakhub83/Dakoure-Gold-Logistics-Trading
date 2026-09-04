import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { config } from "../config.js";
import { verifyWebhookSignature } from "./signature.js";
import { applyCarrierEvent } from "../custody/service.js";
import { UnknownCarrierEventError } from "./mapping.js";

/** Spec §2.2 example payload shape (brinks.seal_check.completed, etc.) */
const carrierEventSchema = z.object({
  external_event_id: z.string().min(1),
  event_type: z.string().min(1),
  shipment_reference: z.string().min(1), // AWB, matches consignments.awb_number
  occurred_at: z.string().datetime(),
  location: z
    .object({ facility: z.string().optional(), lat: z.number().optional(), lng: z.number().optional() })
    .optional(),
  seal: z.object({ code: z.string(), result: z.enum(["intact", "broken"]) }).optional(),
  actor: z.string().optional(),
});

export const carrierWebhookRouter = Router();

// Mounted with express.raw({ type: "application/json" }) in index.ts so the
// HMAC is computed over the exact bytes the carrier signed.
carrierWebhookRouter.post(
  "/webhooks/carriers/:carrierId",
  async (req: Request, res: Response) => {
    const carrierId = req.params.carrierId;
    const secret = config.carrierWebhookSecrets[carrierId];
    if (!secret) {
      return res.status(404).json({ error: "unknown_carrier" });
    }

    const rawBody = req.body as Buffer;
    const verification = verifyWebhookSignature({
      secret,
      rawBody,
      signatureHeader: req.header("x-signature"),
      timestampHeader: req.header("x-timestamp"),
    });
    if (!verification.ok) {
      return res.status(401).json({ error: verification.reason });
    }

    const parsed = carrierEventSchema.safeParse(JSON.parse(rawBody.toString("utf8")));
    if (!parsed.success) {
      return res.status(400).json({ error: "invalid_payload", details: parsed.error.flatten() });
    }
    const body = parsed.data;

    // Idempotency at the database, not the queue (spec §2.2): a carrier
    // retry on any non-2xx lands as a no-op on this unique constraint.
    const carrier = await prisma.carrier.findFirst({ where: { name: { equals: carrierId, mode: "insensitive" } } });
    if (!carrier) return res.status(404).json({ error: "unknown_carrier" });

    const existing = await prisma.carrierEvent.findUnique({
      where: { externalEventId: body.external_event_id },
    });
    if (existing) {
      return res.status(202).json({ status: "duplicate_ignored" });
    }

    const consignment = await prisma.consignment.findFirst({
      where: { awbNumber: body.shipment_reference },
    });
    if (!consignment) {
      // Still record the raw event for later reconciliation — we don't
      // want a mis-keyed AWB to silently drop a compliance-relevant event.
      await prisma.carrierEvent.create({
        data: {
          carrierId: carrier.id,
          externalEventId: body.external_event_id,
          eventType: body.event_type,
          rawPayload: body,
        },
      });
      return res.status(202).json({ status: "accepted_unmatched_consignment" });
    }

    await prisma.carrierEvent.create({
      data: {
        carrierId: carrier.id,
        externalEventId: body.external_event_id,
        consignmentId: consignment.id,
        eventType: body.event_type,
        rawPayload: body,
        processedAt: new Date(),
      },
    });

    try {
      await applyCarrierEvent(prisma, {
        consignmentId: consignment.id,
        eventType: body.event_type,
        seal: body.seal,
      });
    } catch (err) {
      if (err instanceof UnknownCarrierEventError) {
        // recorded above for audit; nothing to advance
        return res.status(202).json({ status: "accepted_unmapped_event" });
      }
      throw err;
    }

    return res.status(202).json({ status: "accepted" });
  }
);
