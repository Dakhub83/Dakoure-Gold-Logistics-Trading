import { describe, it, expect } from "vitest";
import {
  transition,
  initialContext,
  InvalidTransitionError,
  type EscrowState,
} from "../escrow/stateMachine.js";

describe("escrow state machine", () => {
  it("walks the happy path draft -> settled", () => {
    let state: EscrowState = "draft";
    let ctx = initialContext();

    ({ state, context: ctx } = transition(state, ctx, { type: "ONBOARD" }));
    expect(state).toBe("onboarded");

    ({ state, context: ctx } = transition(state, ctx, { type: "FILE_ANEEMAS_ASSAY" }));
    expect(state).toBe("assayed");

    ({ state, context: ctx } = transition(state, ctx, { type: "CUSTODY_REACHED_EXPORT" }));
    expect(state).toBe("in_transit");

    ({ state, context: ctx } = transition(state, ctx, { type: "CUSTODY_REACHED_INTAKE" }));
    expect(state).toBe("vaulted");

    ({ state, context: ctx } = transition(state, ctx, {
      type: "FILE_REFEREE_ASSAY",
      withinTolerance: true,
    }));
    expect(state).toBe("vaulted"); // assay alone doesn't settle — quorum still needed
    expect(ctx.refereeAssayReconciled).toBe(true);

    ({ state, context: ctx } = transition(state, ctx, { type: "SIGN_RELEASE", role: "gc_ops" }));
    expect(state).toBe("vaulted"); // 1 of 2 required signers
    expect(ctx.signedRoles).toEqual(["gc_ops"]);

    ({ state, context: ctx } = transition(state, ctx, {
      type: "SIGN_RELEASE",
      role: "bank_compliance",
    }));
    expect(state).toBe("settled"); // quorum met
  });

  it("cannot release without a reconciled referee assay", () => {
    let state: EscrowState = "vaulted";
    const ctx = initialContext();
    expect(() => transition(state, ctx, { type: "SIGN_RELEASE", role: "gc_ops" })).toThrow(
      InvalidTransitionError
    );
  });

  it("routes a referee variance to disputed instead of settling", () => {
    const { state } = transition("vaulted", initialContext(), {
      type: "FILE_REFEREE_ASSAY",
      withinTolerance: false,
    });
    expect(state).toBe("disputed");
  });

  it("recovers from disputed via re-assay, and can also refund on SLA breach", () => {
    const resolved = transition("disputed", initialContext(), { type: "REASSAY_RESOLVED" });
    expect(resolved.state).toBe("assayed");

    const refunded = transition("disputed", initialContext(), { type: "DISPUTE_SLA_EXCEEDED" });
    expect(refunded.state).toBe("refunded");
  });

  it("rejects an event that doesn't apply to the current state", () => {
    expect(() => transition("draft", initialContext(), { type: "CUSTODY_REACHED_INTAKE" })).toThrow(
      InvalidTransitionError
    );
    expect(() => transition("settled", initialContext(), { type: "ONBOARD" })).toThrow(
      InvalidTransitionError
    );
  });

  it("cancels only from onboarded, on instrument expiry", () => {
    const { state } = transition("onboarded", initialContext(), { type: "INSTRUMENT_EXPIRED" });
    expect(state).toBe("cancelled");
    expect(() => transition("draft", initialContext(), { type: "INSTRUMENT_EXPIRED" })).toThrow();
  });

  it("does not double-count the same signer role re-signing", () => {
    let ctx = initialContext();
    ({ context: ctx } = transition("vaulted", ctx, {
      type: "FILE_REFEREE_ASSAY",
      withinTolerance: true,
    }));
    ({ context: ctx } = transition("vaulted", ctx, { type: "SIGN_RELEASE", role: "gc_ops" }));
    const second = transition("vaulted", ctx, { type: "SIGN_RELEASE", role: "gc_ops" });
    expect(second.state).toBe("vaulted");
    expect(second.context.signedRoles).toEqual(["gc_ops"]);
  });
});
