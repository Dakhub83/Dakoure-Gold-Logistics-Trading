import { describe, it, expect } from "vitest";
import { mapCarrierEvent, UnknownCarrierEventError } from "../webhooks/mapping.js";
import { computeCurrentStage, statusForStep, TOTAL_STEPS } from "../custody/steps.js";

describe("carrier event mapping", () => {
  it("maps a single-effect event", () => {
    expect(mapCarrierEvent({ eventType: "export.customs_cleared" })).toEqual([
      { step: 5, status: "done" },
    ]);
  });

  it("maps a two-effect event (closes one step, opens the next)", () => {
    expect(mapCarrierEvent({ eventType: "hub.received" })).toEqual([
      { step: 2, status: "done" },
      { step: 3, status: "live" },
    ]);
  });

  it("throws for an event type outside the spec's table", () => {
    expect(() => mapCarrierEvent({ eventType: "carrier.made_this_up" })).toThrow(
      UnknownCarrierEventError
    );
  });
});

describe("current stage math", () => {
  it("starts at stage 1 with nothing done", () => {
    expect(computeCurrentStage([])).toBe(1);
  });

  it("is one past the highest done step", () => {
    expect(computeCurrentStage([1, 2, 3])).toBe(4);
    expect(computeCurrentStage([1, 3, 2])).toBe(4); // order-independent
  });

  it("caps at TOTAL_STEPS + 1 once every step is done — the AGL-2608-01 case", () => {
    expect(computeCurrentStage([1, 2, 3, 4, 5, 6, 7, 8])).toBe(TOTAL_STEPS + 1);
  });

  it("statusForStep agrees with the frontend Stepper's done/live/pending split", () => {
    const stage = 6;
    expect(statusForStep(5, stage)).toBe("done");
    expect(statusForStep(6, stage)).toBe("live");
    expect(statusForStep(7, stage)).toBe("pending");
  });
});
