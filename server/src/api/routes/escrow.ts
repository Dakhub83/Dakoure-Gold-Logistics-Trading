import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db.js";
import { requireRole, requireSession, type AuthedRequest } from "../middleware/auth.js";
import { applyEscrowEvent } from "../../escrow/service.js";
import { InvalidTransitionError, type SignerRole } from "../../escrow/stateMachine.js";

export const escrowRouter = Router();

const signSchema = z.object({
  role: z.enum(["gc_ops", "bank_compliance", "buyer_authorized"]),
});

// POST /api/escrow/:id/sign — countersign a pending release (spec §3.2)
// :id here is the trade_contract id; the quorum is tracked against its
// latest escrow_transaction.
escrowRouter.post(
  "/api/escrow/:id/sign",
  requireSession,
  requireRole("gc_ops", "bank_compliance", "buyer_authorized", "gc_admin"),
  async (req: AuthedRequest, res) => {
    const parsed = signSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "invalid_payload" });
    }
    const role = parsed.data.role as SignerRole;

    try {
      const result = await applyEscrowEvent(
        prisma,
        req.params.id,
        { type: "SIGN_RELEASE", role },
        { userId: req.user!.id, role }
      );
      res.json({ state: result.state, signedRoles: result.context.signedRoles });
    } catch (err) {
      if (err instanceof InvalidTransitionError) {
        return res.status(409).json({ error: err.message });
      }
      throw err;
    }
  }
);
