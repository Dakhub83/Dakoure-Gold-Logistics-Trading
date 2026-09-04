/**
 * Escrow authorization state machine — spec §3.
 *
 * Principal never touches this platform. This machine coordinates
 * *authorization*: a quorum of named signers countersigning a release
 * instruction against a bank-held SBLC/LC. It never moves funds itself.
 */

export type EscrowState =
  | "draft"
  | "onboarded"
  | "assayed"
  | "in_transit"
  | "vaulted"
  | "settled"
  | "disputed"
  | "refunded"
  | "cancelled";

export type SignerRole = "gc_ops" | "bank_compliance" | "buyer_authorized";

export interface EscrowContext {
  /** distinct signer roles that have countersigned the pending release */
  signedRoles: SignerRole[];
  /** quorum required before Vaulted -> Settled, per spec §3.2 */
  quorumRequired: number;
  /** true once the referee assay has reconciled within tolerance */
  refereeAssayReconciled: boolean;
}

export const initialContext = (): EscrowContext => ({
  signedRoles: [],
  quorumRequired: 2,
  refereeAssayReconciled: false,
});

export type EscrowEvent =
  | { type: "ONBOARD" } // KYC cleared both parties + SBLC/LC issued
  | { type: "INSTRUMENT_EXPIRED" }
  | { type: "FILE_ANEEMAS_ASSAY" } // government assay filed; onboarded -> assayed
  | { type: "FLAG_ASSAY_DISPUTE" } // variance exceeds tolerance, detected in assayed or vaulted
  | { type: "CUSTODY_REACHED_EXPORT" } // steps 5-6 done -> in_transit
  | { type: "CUSTODY_REACHED_INTAKE" } // CBP entry + refinery intake logged -> vaulted
  | { type: "FILE_REFEREE_ASSAY"; withinTolerance: boolean }
  | { type: "SIGN_RELEASE"; role: SignerRole }
  | { type: "REASSAY_RESOLVED" } // disputed -> assayed
  | { type: "DISPUTE_SLA_EXCEEDED" }; // disputed -> refunded

export class InvalidTransitionError extends Error {
  constructor(state: EscrowState, event: EscrowEvent["type"]) {
    super(`Cannot apply event "${event}" from state "${state}"`);
    this.name = "InvalidTransitionError";
  }
}

export interface TransitionResult {
  state: EscrowState;
  context: EscrowContext;
}

/**
 * Pure transition function — no I/O, no clock reads beyond what callers pass
 * in via context. Fully testable without a database.
 */
export function transition(
  state: EscrowState,
  context: EscrowContext,
  event: EscrowEvent
): TransitionResult {
  switch (event.type) {
    case "ONBOARD":
      requireState(state, event.type, ["draft"]);
      return { state: "onboarded", context };

    case "INSTRUMENT_EXPIRED":
      requireState(state, event.type, ["onboarded"]);
      return { state: "cancelled", context };

    case "FILE_ANEEMAS_ASSAY":
      requireState(state, event.type, ["onboarded"]);
      return { state: "assayed", context };

    case "FLAG_ASSAY_DISPUTE":
      requireState(state, event.type, ["assayed", "vaulted"]);
      return { state: "disputed", context };

    case "CUSTODY_REACHED_EXPORT":
      requireState(state, event.type, ["assayed"]);
      return { state: "in_transit", context };

    case "CUSTODY_REACHED_INTAKE":
      requireState(state, event.type, ["in_transit"]);
      return { state: "vaulted", context };

    case "FILE_REFEREE_ASSAY":
      requireState(state, event.type, ["vaulted"]);
      if (!event.withinTolerance) {
        return { state: "disputed", context };
      }
      return {
        state: "vaulted",
        context: { ...context, refereeAssayReconciled: true },
      };

    case "SIGN_RELEASE": {
      requireState(state, event.type, ["vaulted"]);
      if (!context.refereeAssayReconciled) {
        throw new InvalidTransitionError(state, event.type);
      }
      const signedRoles = context.signedRoles.includes(event.role)
        ? context.signedRoles
        : [...context.signedRoles, event.role];
      const quorumMet = signedRoles.length >= context.quorumRequired;
      const nextContext = { ...context, signedRoles };
      return quorumMet
        ? { state: "settled", context: nextContext }
        : { state: "vaulted", context: nextContext };
    }

    case "REASSAY_RESOLVED":
      requireState(state, event.type, ["disputed"]);
      return { state: "assayed", context };

    case "DISPUTE_SLA_EXCEEDED":
      requireState(state, event.type, ["disputed"]);
      return { state: "refunded", context };

    default: {
      const _exhaustive: never = event;
      throw new Error(`Unhandled event: ${JSON.stringify(_exhaustive)}`);
    }
  }
}

function requireState(
  state: EscrowState,
  event: EscrowEvent["type"],
  allowed: EscrowState[]
): void {
  if (!allowed.includes(state)) {
    throw new InvalidTransitionError(state, event);
  }
}

export const TERMINAL_STATES: readonly EscrowState[] = [
  "settled",
  "refunded",
  "cancelled",
];

export const isTerminal = (state: EscrowState): boolean =>
  TERMINAL_STATES.includes(state);
