export type BankName = "Ecobank" | "Coris Bank" | "Other";
export type PermitClass = "artisanal" | "semi_mechanised";

/**
 * Mirrors server/src/api/routes/producers.ts's onboardSchema field-for-field
 * — the wizard and the API validate the same shape, independently, on
 * purpose (client-side for UX, server-side because the browser is never
 * trusted for KYC-relevant data).
 */
export interface ProducerOnboardingData {
  // Step 1 — corporate registration
  legalName: string;
  rccmNumber: string;
  ifuTaxId: string;
  // Step 2 — regulatory validation
  aneemasPermit: string;
  permitClass: PermitClass | "";
  concessionRef: string;
  concessionLat: string; // form state stays string; parsed to number on submit
  concessionLng: string;
  // Step 3 — financial settlement
  bankName: BankName | "";
  bankAccountHolder: string;
  bankAccountNumber: string;
  // Step 4 — legal & compliance attestation
  oecdAttestationAccepted: boolean;
  signatureName: string;
}

export const emptyOnboardingData = (): ProducerOnboardingData => ({
  legalName: "",
  rccmNumber: "",
  ifuTaxId: "",
  aneemasPermit: "",
  permitClass: "",
  concessionRef: "",
  concessionLat: "",
  concessionLng: "",
  bankName: "",
  bankAccountHolder: "",
  bankAccountNumber: "",
  oecdAttestationAccepted: false,
  signatureName: "",
});

export const WIZARD_STEPS = [
  { index: 0, title: "Corporate Registration" },
  { index: 1, title: "Regulatory Validation" },
  { index: 2, title: "Financial Settlement" },
  { index: 3, title: "Compliance Attestation" },
] as const;

export type StepIndex = 0 | 1 | 2 | 3;

export type FieldErrors = Partial<Record<keyof ProducerOnboardingData, string>>;
