import type { LotStatus } from "@prisma/client";
import type { Checkpoint } from "./steps.js";

/**
 * The one state rule the logistics-update webhook enforces: hitting the
 * refinery gate (REFINERY_INTAKE) moves the lot into 'verifying_assay' —
 * everything downstream (settled/disputed) waits on the referee assay,
 * not on another logistics ping.
 */
export function nextLotStatusForCheckpoint(checkpoint: Checkpoint): LotStatus | null {
  return checkpoint === "REFINERY_INTAKE" ? "verifying_assay" : null;
}
