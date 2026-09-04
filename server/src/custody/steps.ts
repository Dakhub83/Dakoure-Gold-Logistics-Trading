/**
 * The eight custody milestones — must stay in sync with the EN/FR copy in
 * src/GoldCorridorPlatform.jsx `portal.ship.steps` (Client Portal ->
 * Active Shipments -> Live Shipment Tracker). This module is the backend's
 * single source of truth for step numbers and names; the frontend copy
 * carries the buyer-facing description text.
 */
export const CUSTODY_STEPS = [
  { step: 1, name: "Mine-Site Lot Creation" },
  { step: 2, name: "Secure Transport to Ouagadougou Hub" },
  { step: 3, name: "Comptoir Intake & Re-Weigh" },
  { step: 4, name: "ANEEMAS Government Assay & Export Valuation" },
  { step: 5, name: "Export Customs Declaration" },
  { step: 6, name: "Airfreight Loading & Seal Verification" },
  { step: 7, name: "Import Clearance & Arrival" },
  { step: 8, name: "Refinery Intake, Referee Assay & Settlement" },
] as const;

export const TOTAL_STEPS = CUSTODY_STEPS.length;

export function stepName(step: number): string {
  const found = CUSTODY_STEPS.find((s) => s.step === step);
  if (!found) throw new RangeError(`Unknown custody step ${step}`);
  return found.name;
}

/**
 * Mirrors the Stepper component's own status derivation
 * (src/GoldCorridorPlatform.jsx Stepper): a step is "done" while a lower
 * step is the active one, "live" when it IS the active one, else "pending".
 */
export function statusForStep(
  step: number,
  currentStage: number
): "done" | "live" | "pending" {
  if (step < currentStage) return "done";
  if (step === currentStage) return "live";
  return "pending";
}

/**
 * consignments.current_stage is a materialized value: the highest
 * completed step, plus one. A consignment with all 8 steps done reports
 * stage 9 — every node renders "done", matching AGL-2608-01 in the seed
 * frontend data.
 */
export function computeCurrentStage(doneSteps: readonly number[]): number {
  if (doneSteps.length === 0) return 1;
  return Math.min(Math.max(...doneSteps) + 1, TOTAL_STEPS + 1);
}

export type Checkpoint = "ORIGIN" | "IN_TRANSIT" | "CUSTOMS" | "REFINERY_INTAKE";

/**
 * Coarse checkpoint each of the eight fine-grained steps belongs to — the
 * four buckets a compliance dashboard (and the logistics-update webhook)
 * reports on.
 */
export function checkpointForStep(step: number): Checkpoint {
  if (step >= 1 && step <= 4) return "ORIGIN";
  if (step === 5 || step === 7) return "CUSTOMS";
  if (step === 6) return "IN_TRANSIT";
  if (step === 8) return "REFINERY_INTAKE";
  throw new RangeError(`Unknown custody step ${step}`);
}

/**
 * When a generic logistics-update ping names only a coarse checkpoint (not
 * a specific one of the eight steps), this is which step it advances —
 * the most-advanced step within that checkpoint's range.
 */
export function representativeStepForCheckpoint(checkpoint: Checkpoint): number {
  switch (checkpoint) {
    case "ORIGIN":
      return 4; // ANEEMAS government assay — the terminal origin step
    case "CUSTOMS":
      return 5; // export customs declaration
    case "IN_TRANSIT":
      return 6;
    case "REFINERY_INTAKE":
      return 8;
  }
}
