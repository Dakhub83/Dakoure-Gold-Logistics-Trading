import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db.js";
import { requireRole, requireSession, type AuthedRequest } from "../middleware/auth.js";

export const assaysRouter = Router();

const fileAssaySchema = z.object({
  lotId: z.string().uuid(),
  assayType: z.enum(["field", "hub_preliminary", "government_aneemas", "referee"]),
  purityPct: z.number().min(0).max(100),
  weightG: z.number().positive(),
  labName: z.string().min(1),
  certificateDocId: z.string().uuid().optional(),
});

/** Tolerance a settlement-relevant assay pair must fall within — spec §3.1. */
export const ASSAY_TOLERANCE_PCT = 0.5;

export function withinTolerance(a: number, b: number, tolerance = ASSAY_TOLERANCE_PCT): boolean {
  return Math.abs(a - b) <= tolerance;
}

// POST /api/assays — file an ANEEMAS or referee assay result
assaysRouter.post(
  "/api/assays",
  requireSession,
  requireRole("aneemas_officer", "referee_lab", "gc_admin"),
  async (req: AuthedRequest, res) => {
    const parsed = fileAssaySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "invalid_payload", details: parsed.error.flatten() });
    }
    const body = parsed.data;

    const assay = await prisma.assay.create({
      data: {
        lotId: body.lotId,
        assayType: body.assayType,
        purityPct: body.purityPct,
        weightG: body.weightG,
        labName: body.labName,
        certificateDocId: body.certificateDocId,
        performedAt: new Date(),
      },
    });

    res.status(201).json({ assay });
  }
);
