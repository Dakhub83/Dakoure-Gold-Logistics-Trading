import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db.js";

export const producersRouter = Router();

/** Mirrors the 4-step producer onboarding wizard's field set exactly. */
const onboardSchema = z.object({
  // Step 1 — corporate registration
  legalName: z.string().min(2),
  rccmNumber: z.string().regex(/^BF [A-Z]{3,4} \d{4} [A-Z] \d{3,6}$/, "RCCM format: 'BF OUA 2024 B 1234'"),
  ifuTaxId: z.string().regex(/^\d{11}$/, "IFU must be 11 digits"),

  // Step 2 — regulatory validation
  aneemasPermit: z.string().regex(/^BF-[A-Z]{3,5}-\d{2}-\d{3,6}$/, "ANEEMAS ID format: 'BF-MEMC-26-4471'"),
  permitClass: z.enum(["artisanal", "semi_mechanised"]),
  concessionRef: z.string().min(2),
  concessionLat: z.number().min(9.3).max(15.1), // Burkina Faso bounding box
  concessionLng: z.number().min(-5.6).max(2.5),

  // Step 3 — financial settlement
  bankName: z.enum(["Ecobank", "Coris Bank", "Other"]),
  bankAccountHolder: z.string().min(2),
  bankAccountNumber: z.string().regex(/^[A-Z0-9]{10,34}$/, "Enter a valid account number / RIB"),

  // Step 4 — legal & compliance attestation
  oecdAttestationAccepted: z.literal(true),
  signatureName: z.string().min(2),
});

/**
 * POST /api/v1/producers/onboard — receives the 4-step wizard's payload,
 * validated server-side independently of the client (never trust the
 * browser for RCCM/IFU/ANEEMAS format or the OECD attestation checkbox).
 * bankAccountHolder is cross-checked against legalName here, not just
 * flagged in the UI, since that mismatch is exactly what KYC would reject.
 */
producersRouter.post("/api/v1/producers/onboard", async (req, res) => {
  const parsed = onboardSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_payload", details: parsed.error.flatten() });
  }
  const body = parsed.data;

  if (!namesLikelyMatch(body.legalName, body.bankAccountHolder)) {
    return res.status(422).json({
      error: "bank_holder_mismatch",
      message: "Bank account holder must match the registered corporate legal name.",
    });
  }

  const producer = await prisma.producer.upsert({
    where: { aneemasPermit: body.aneemasPermit },
    update: {
      legalName: body.legalName,
      rccmNumber: body.rccmNumber,
      ifuTaxId: body.ifuTaxId,
      permitClass: body.permitClass,
      concessionRef: body.concessionRef,
      concessionLat: body.concessionLat,
      concessionLng: body.concessionLng,
      bankName: body.bankName,
      bankAccountHolder: body.bankAccountHolder,
      bankAccountNumber: body.bankAccountNumber,
      oecdAttestationSignedAt: new Date(),
      oecdAttestationSigId: `stub:${body.signatureName}:${Date.now()}`,
      onboardingStatus: "submitted",
    },
    create: {
      aneemasPermit: body.aneemasPermit,
      permitClass: body.permitClass,
      region: body.concessionRef,
      legalName: body.legalName,
      rccmNumber: body.rccmNumber,
      ifuTaxId: body.ifuTaxId,
      concessionRef: body.concessionRef,
      concessionLat: body.concessionLat,
      concessionLng: body.concessionLng,
      bankName: body.bankName,
      bankAccountHolder: body.bankAccountHolder,
      bankAccountNumber: body.bankAccountNumber,
      oecdAttestationSignedAt: new Date(),
      oecdAttestationSigId: `stub:${body.signatureName}:${Date.now()}`,
      onboardingStatus: "submitted",
    },
  });

  res.status(201).json({ producerId: producer.id, status: producer.onboardingStatus });
});

/** Loose match: same normalized tokens, order-independent (case/punct-insensitive). */
export function namesLikelyMatch(legalName: string, accountHolder: string): boolean {
  const normalize = (s: string) =>
    s
      .toUpperCase()
      .replace(/[^A-Z0-9 ]/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .sort()
      .join(" ");
  return normalize(legalName) === normalize(accountHolder);
}
