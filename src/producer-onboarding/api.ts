import type { ProducerOnboardingData } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export interface SubmitResult {
  producerId: string;
  status: string;
}

export class OnboardingApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "OnboardingApiError";
  }
}

/** POST to server/src/api/routes/producers.ts's onboardSchema-shaped endpoint. */
export async function submitProducerOnboarding(
  data: ProducerOnboardingData
): Promise<SubmitResult> {
  const res = await fetch(`${API_BASE}/api/v1/producers/onboard`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      legalName: data.legalName.trim(),
      rccmNumber: data.rccmNumber.trim(),
      ifuTaxId: data.ifuTaxId.trim(),
      aneemasPermit: data.aneemasPermit.trim(),
      permitClass: data.permitClass,
      concessionRef: data.concessionRef.trim(),
      concessionLat: Number(data.concessionLat),
      concessionLng: Number(data.concessionLng),
      bankName: data.bankName,
      bankAccountHolder: data.bankAccountHolder.trim(),
      bankAccountNumber: data.bankAccountNumber.trim().toUpperCase(),
      oecdAttestationAccepted: data.oecdAttestationAccepted,
      signatureName: data.signatureName.trim(),
    }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new OnboardingApiError(
      body.message ?? body.error ?? `Submission failed (${res.status})`,
      res.status,
      body.details
    );
  }
  return body as SubmitResult;
}
