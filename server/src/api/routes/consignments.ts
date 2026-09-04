import { Router } from "express";
import { prisma } from "../../db.js";
import { requireSession } from "../middleware/auth.js";
import { statusForStep, CUSTODY_STEPS } from "../../custody/steps.js";

export const consignmentsRouter = Router();

// GET /api/consignments/:id — full current state, for initial page load
consignmentsRouter.get("/api/consignments/:id", requireSession, async (req, res) => {
  const consignment = await prisma.consignment.findUnique({
    where: { id: req.params.id },
    include: { custodyEvents: { orderBy: { stepNumber: "asc" } } },
  });
  if (!consignment) return res.status(404).json({ error: "not_found" });

  const steps = CUSTODY_STEPS.map(({ step, name }) => {
    const event = consignment.custodyEvents.find((e) => e.stepNumber === step);
    return {
      step,
      name,
      status: event?.status ?? statusForStep(step, consignment.currentStage),
      location: event?.location ?? null,
      completedAt: event?.completedAt ?? null,
    };
  });

  res.json({
    id: consignment.id,
    consignmentRef: consignment.consignmentRef,
    origin: consignment.origin,
    destination: consignment.destination,
    currentStage: consignment.currentStage,
    steps,
  });
});

// GET /api/consignments/:id/events — ordered custody_events history
consignmentsRouter.get("/api/consignments/:id/events", requireSession, async (req, res) => {
  const events = await prisma.custodyEvent.findMany({
    where: { consignmentId: req.params.id },
    orderBy: { stepNumber: "asc" },
  });
  res.json({ events });
});
