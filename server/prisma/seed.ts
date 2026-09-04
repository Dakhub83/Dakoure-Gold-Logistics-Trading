/**
 * Seeds the same three demo consignments the Client Portal's Live
 * Shipment Tracker ships with (src/GoldCorridorPlatform.jsx `portal.ship`),
 * so the webhook route and API have something real to match against
 * in local dev.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const producer = await prisma.producer.upsert({
    where: { aneemasPermit: "BF-MEMC-26-4471" },
    update: {},
    create: {
      aneemasPermit: "BF-MEMC-26-4471",
      permitClass: "semi_mechanised",
      region: "Boulkiemdé Province",
      kycStatus: "verified",
      licenseExpiry: new Date("2027-06-30"),
    },
  });

  const comptoir = await prisma.comptoir.upsert({
    where: { id: "seed-comptoir-ouaga" },
    update: {},
    create: { id: "seed-comptoir-ouaga", name: "Ouagadougou Processing Hub", licenseNo: "CPT-2026-118", region: "Ouagadougou" },
  });

  const brinks = await prisma.carrier.upsert({
    where: { name: "brinks" },
    update: {},
    create: { name: "brinks", webhookSecretRef: "WEBHOOK_SECRET_BRINKS" },
  });
  await prisma.carrier.upsert({
    where: { name: "malca-amit" },
    update: {},
    create: { name: "malca-amit", webhookSecretRef: "WEBHOOK_SECRET_MALCA_AMIT" },
  });

  const lot = await prisma.lot.upsert({
    where: { lotRef: "BF-LOT-22014" },
    update: {},
    create: {
      lotRef: "BF-LOT-22014",
      producerId: producer.id,
      comptoirId: comptoir.id,
      grossWeightG: 14350,
      fieldAssayPct: 91.0,
      currentSealCode: "BF-88412-19",
      status: "government_assayed",
    },
  });

  await prisma.seal.upsert({
    where: { sealCode: "BF-88412-19" },
    update: {},
    create: {
      sealCode: "BF-88412-19",
      lotId: lot.id,
      appliedAt: new Date(),
      state: "in_transit",
    },
  });

  const consignment = await prisma.consignment.upsert({
    where: { consignmentRef: "AGL-2609-02" },
    update: {},
    create: {
      consignmentRef: "AGL-2609-02",
      origin: "Ouagadougou",
      destination: "New York",
      carrierId: brinks.id,
      awbNumber: "147-88214930",
      insuredValueUsd: 1182400,
      grossWeightG: 14200,
      declaredFinePct: 92.6,
      currentStage: 6, // matches the seeded frontend consignment
    },
  });

  await prisma.consignmentLot.upsert({
    where: { consignmentId_lotId: { consignmentId: consignment.id, lotId: lot.id } },
    update: {},
    create: { consignmentId: consignment.id, lotId: lot.id, weightG: 14200 },
  });

  const doneSteps = [1, 2, 3, 4, 5];
  for (const step of doneSteps) {
    await prisma.custodyEvent.upsert({
      where: { consignmentId_stepNumber: { consignmentId: consignment.id, stepNumber: step } },
      update: { status: "done" },
      create: {
        consignmentId: consignment.id,
        lotId: lot.id,
        stepNumber: step,
        stepName: `Seed step ${step}`,
        status: "done",
        completedAt: new Date(),
      },
    });
  }
  await prisma.custodyEvent.upsert({
    where: { consignmentId_stepNumber: { consignmentId: consignment.id, stepNumber: 6 } },
    update: { status: "live" },
    create: {
      consignmentId: consignment.id,
      lotId: lot.id,
      stepNumber: 6,
      stepName: "Airfreight Loading & Seal Verification",
      status: "live",
      startedAt: new Date(),
    },
  });

  console.log("Seeded producer, comptoir, carriers, lot, and consignment AGL-2609-02.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
