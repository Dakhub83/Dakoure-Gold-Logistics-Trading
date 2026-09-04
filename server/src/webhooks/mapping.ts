/**
 * Carrier event_type -> custody step effect, spec §2.2 table.
 * Pure config + pure function: no I/O, easy to unit test and to extend
 * when a second carrier's vocabulary doesn't match Brink's/Malca-Amit's.
 */

export type StepEffect = { step: number; status: "live" | "done" };

export interface CarrierEventInput {
  eventType: string;
  seal?: { code: string; result: "intact" | "broken" };
}

const EFFECTS: Record<string, StepEffect[]> = {
  "pickup.confirmed": [{ step: 2, status: "live" }],
  "hub.received": [
    { step: 2, status: "done" },
    { step: 3, status: "live" },
  ],
  "export.customs_cleared": [{ step: 5, status: "done" }],
  "seal_check.completed": [{ step: 6, status: "live" }],
  "flight.departed": [
    { step: 6, status: "done" },
    { step: 7, status: "live" },
  ],
  "import.customs_cleared": [
    { step: 7, status: "done" },
    { step: 8, status: "live" },
  ],
  "refinery.intake_confirmed": [{ step: 8, status: "live" }],
};

export class UnknownCarrierEventError extends Error {
  constructor(eventType: string) {
    super(`No custody mapping for carrier event_type "${eventType}"`);
    this.name = "UnknownCarrierEventError";
  }
}

/** Ordered list of (step, status) writes to apply, per spec's mapping table. */
export function mapCarrierEvent(input: CarrierEventInput): StepEffect[] {
  const effects = EFFECTS[input.eventType];
  if (!effects) throw new UnknownCarrierEventError(input.eventType);
  return effects;
}

export const KNOWN_EVENT_TYPES = Object.keys(EFFECTS);
