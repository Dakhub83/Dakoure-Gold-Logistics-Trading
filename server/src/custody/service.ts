import type { Prisma, PrismaClient } from "@prisma/client";
import { mapCarrierEvent, type CarrierEventInput } from "../webhooks/mapping.js";
import {
  computeCurrentStage,
  representativeStepForCheckpoint,
  stepName,
  TOTAL_STEPS,
  type Checkpoint,
} from "./steps.js";
import { nextLotStatusForCheckpoint } from "./checkpoint.js";
import { eventBus, CONSIGNMENT_UPDATED } from "../events/bus.js";

export interface ApplyCarrierEventInput extends CarrierEventInput {
  consignmentId: string;
}

export interface ApplyCarrierEventResult {
  consignmentId: string;
  stage: number;
  status: "live" | "done";
}

/**
 * Spec §2.2: apply the mapped step effects and recompute
 * consignments.current_stage, in one transaction. Publishes
 * `consignment.updated` for the realtime gateway to fan out — the caller
 * (webhook route) is responsible for having already deduped the raw
 * carrier event before calling this.
 */
export async function applyCarrierEvent(
  prisma: PrismaClient,
  input: ApplyCarrierEventInput
): Promise<ApplyCarrierEventResult> {
  const effects = mapCarrierEvent(input);

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    for (const effect of effects) {
      await tx.custodyEvent.upsert({
        where: {
          consignmentId_stepNumber: {
            consignmentId: input.consignmentId,
            stepNumber: effect.step,
          },
        },
        create: {
          consignmentId: input.consignmentId,
          stepNumber: effect.step,
          stepName: stepName(effect.step),
          status: effect.status,
          startedAt: new Date(),
          completedAt: effect.status === "done" ? new Date() : null,
        },
        update: {
          status: effect.status,
          completedAt: effect.status === "done" ? new Date() : null,
        },
      });
    }

    if (input.seal) {
      await tx.seal.updateMany({
        where: { sealCode: input.seal.code },
        data: {
          state: input.seal.result === "intact" ? "verified_intact" : "compromised",
          verifiedAt: new Date(),
        },
      });
    }

    const doneEvents = await tx.custodyEvent.findMany({
      where: { consignmentId: input.consignmentId, status: "done" },
      select: { stepNumber: true },
    });
    const stage = computeCurrentStage(doneEvents.map((e) => e.stepNumber));

    await tx.consignment.update({
      where: { id: input.consignmentId },
      data: { currentStage: stage },
    });

    const lastEffect = effects[effects.length - 1];
    return { consignmentId: input.consignmentId, stage, status: lastEffect.status };
  });

  eventBus.publish(CONSIGNMENT_UPDATED, {
    type: "stage_advanced",
    ...result,
  });

  return result;
}

export const isFullyDelivered = (stage: number): boolean => stage > TOTAL_STEPS;

export interface ApplyLogisticsCheckpointInput {
  sealCode: string;
  checkpoint: Checkpoint;
  location?: string;
  signedByApiKeyId?: string;
}

export interface ApplyLogisticsCheckpointResult {
  lotId: string;
  consignmentId: string;
  stage: number;
  lotStatus: string;
}

export class SealNotFoundError extends Error {
  constructor(sealCode: string) {
    super(`No lot correlates to seal "${sealCode}"`);
    this.name = "SealNotFoundError";
  }
}

export class ConsignmentNotFoundError extends Error {
  constructor(lotId: string) {
    super(`Lot "${lotId}" is not attached to any consignment`);
    this.name = "ConsignmentNotFoundError";
  }
}

/**
 * The `/api/v1/webhooks/logistics-update` path: correlate a checkpoint
 * ping to a lot by its physical seal number (not by AWB — a generic
 * logistics integration may not carry one), advance the representative
 * custody step for that checkpoint, and — on REFINERY_INTAKE — flip the
 * lot into 'verifying_assay'.
 */
export async function applyLogisticsCheckpoint(
  prisma: PrismaClient,
  input: ApplyLogisticsCheckpointInput
): Promise<ApplyLogisticsCheckpointResult> {
  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const seal = await tx.seal.findUnique({ where: { sealCode: input.sealCode } });
    if (!seal) throw new SealNotFoundError(input.sealCode);

    const consignmentLot = await tx.consignmentLot.findFirst({
      where: { lotId: seal.lotId },
    });
    if (!consignmentLot) throw new ConsignmentNotFoundError(seal.lotId);

    const step = representativeStepForCheckpoint(input.checkpoint);

    await tx.custodyEvent.upsert({
      where: {
        consignmentId_stepNumber: {
          consignmentId: consignmentLot.consignmentId,
          stepNumber: step,
        },
      },
      create: {
        consignmentId: consignmentLot.consignmentId,
        lotId: seal.lotId,
        stepNumber: step,
        stepName: stepName(step),
        checkpointType: input.checkpoint,
        status: "live",
        location: input.location,
        signedByApiKeyId: input.signedByApiKeyId,
        startedAt: new Date(),
      },
      update: {
        checkpointType: input.checkpoint,
        status: "live",
        location: input.location ?? undefined,
        signedByApiKeyId: input.signedByApiKeyId,
      },
    });

    const doneEvents = await tx.custodyEvent.findMany({
      where: { consignmentId: consignmentLot.consignmentId, status: "done" },
      select: { stepNumber: true },
    });
    const stage = computeCurrentStage(doneEvents.map((e) => e.stepNumber));
    await tx.consignment.update({
      where: { id: consignmentLot.consignmentId },
      data: { currentStage: stage },
    });

    const nextStatus = nextLotStatusForCheckpoint(input.checkpoint);
    const lot = nextStatus
      ? await tx.lot.update({ where: { id: seal.lotId }, data: { status: nextStatus } })
      : await tx.lot.findUniqueOrThrow({ where: { id: seal.lotId } });

    return {
      lotId: lot.id,
      consignmentId: consignmentLot.consignmentId,
      stage,
      lotStatus: lot.status,
    };
  });

  eventBus.publish(CONSIGNMENT_UPDATED, {
    type: "stage_advanced",
    consignmentId: result.consignmentId,
    stage: result.stage,
    status: "live",
  });

  return result;
}
