import { describe, it, expect } from "vitest";
import {
  checkpointForStep,
  representativeStepForCheckpoint,
} from "../custody/steps.js";
import { nextLotStatusForCheckpoint } from "../custody/checkpoint.js";
import { verifySharedSecret } from "../webhooks/signature.js";
import { namesLikelyMatch } from "../api/routes/producers.js";

describe("checkpoint <-> step mapping", () => {
  it("buckets each of the eight steps into its checkpoint", () => {
    expect(checkpointForStep(1)).toBe("ORIGIN");
    expect(checkpointForStep(4)).toBe("ORIGIN");
    expect(checkpointForStep(5)).toBe("CUSTOMS");
    expect(checkpointForStep(6)).toBe("IN_TRANSIT");
    expect(checkpointForStep(7)).toBe("CUSTOMS");
    expect(checkpointForStep(8)).toBe("REFINERY_INTAKE");
  });

  it("is invertible for the representative step of each checkpoint", () => {
    for (const checkpoint of ["ORIGIN", "IN_TRANSIT", "CUSTOMS", "REFINERY_INTAKE"] as const) {
      const step = representativeStepForCheckpoint(checkpoint);
      // CUSTOMS covers two steps (5 and 7); the representative must still
      // map back to CUSTOMS, even though it's not a bijection there.
      expect(checkpointForStep(step)).toBe(checkpoint);
    }
  });
});

describe("lot status transition on checkpoint", () => {
  it("only REFINERY_INTAKE moves the lot to verifying_assay", () => {
    expect(nextLotStatusForCheckpoint("REFINERY_INTAKE")).toBe("verifying_assay");
    expect(nextLotStatusForCheckpoint("ORIGIN")).toBeNull();
    expect(nextLotStatusForCheckpoint("IN_TRANSIT")).toBeNull();
    expect(nextLotStatusForCheckpoint("CUSTOMS")).toBeNull();
  });
});

describe("shared-secret webhook verification", () => {
  it("accepts an exact match", () => {
    expect(verifySharedSecret("s3cr3t", "s3cr3t")).toBe(true);
  });
  it("rejects a mismatch or missing header", () => {
    expect(verifySharedSecret("s3cr3t", "wrong")).toBe(false);
    expect(verifySharedSecret("s3cr3t", undefined)).toBe(false);
    expect(verifySharedSecret("", "s3cr3t")).toBe(false);
  });
});

describe("bank account holder vs legal name match", () => {
  it("matches regardless of word order or punctuation", () => {
    expect(namesLikelyMatch("SOMIKA SARL", "Somika, SARL")).toBe(true);
    expect(namesLikelyMatch("Gold Corridor Trading", "TRADING GOLD CORRIDOR")).toBe(true);
  });
  it("rejects a genuinely different name", () => {
    expect(namesLikelyMatch("SOMIKA SARL", "Different Holdings Ltd")).toBe(false);
  });
});
