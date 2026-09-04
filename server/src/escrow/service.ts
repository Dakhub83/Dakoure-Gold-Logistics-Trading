import type { PrismaClient } from "@prisma/client";
import {
  transition,
  initialContext,
  type EscrowEvent,
  type EscrowContext,
  type SignerRole,
} from "./stateMachine.js";

/**
 * Rehydrates the in-memory quorum context from signed rows rather than
 * storing it as a JSON blob — `signatures` is the audit-grade record;
 * this is just a read-time projection of it.
 */
async function loadContext(
  prisma: PrismaClient,
  escrowTransactionId: string
): Promise<EscrowContext> {
  const tx = await prisma.escrowTransaction.findUniqueOrThrow({
    where: { id: escrowTransactionId },
  });
  const sigs = await prisma.signature.findMany({
    where: { subjectType: "escrow_transaction", subjectId: escrowTransactionId },
    select: { signerRole: true },
  });
  const base = initialContext();
  return {
    ...base,
    quorumRequired: tx.quorumRequired,
    signedRoles: Array.from(new Set(sigs.map((s) => s.signerRole))) as SignerRole[],
    refereeAssayReconciled: tx.state !== "vaulted" ? true : base.refereeAssayReconciled,
  };
}

/**
 * Applies one escrow event to a trade contract: loads current state,
 * runs the pure transition, persists the result, and — on SIGN_RELEASE —
 * records the countersignature row that satisfies the compliance trail.
 */
export async function applyEscrowEvent(
  prisma: PrismaClient,
  tradeContractId: string,
  event: EscrowEvent,
  signer?: { userId: string; role: SignerRole }
) {
  const contract = await prisma.tradeContract.findUniqueOrThrow({
    where: { id: tradeContractId },
    include: { escrowAccount: { include: { transactions: true } } },
  });

  const latestTx = contract.escrowAccount?.transactions.at(-1);
  const context = latestTx
    ? await loadContext(prisma, latestTx.id)
    : initialContext();

  const result = transition(contract.state, context, event);

  await prisma.tradeContract.update({
    where: { id: tradeContractId },
    data: { state: result.state },
  });

  if (event.type === "SIGN_RELEASE" && signer && latestTx) {
    await prisma.signature.create({
      data: {
        subjectType: "escrow_transaction",
        subjectId: latestTx.id,
        userId: signer.userId,
        signerRole: signer.role,
        signatureHash: `stub:${signer.userId}:${Date.now()}`, // replace with real detached signature
      },
    });
    await prisma.escrowTransaction.update({
      where: { id: latestTx.id },
      data: {
        quorumMet: result.context.signedRoles.length,
        state: result.state,
        releasedAt: result.state === "settled" ? new Date() : undefined,
      },
    });
  }

  return result;
}
