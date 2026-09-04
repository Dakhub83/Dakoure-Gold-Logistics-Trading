import type { FieldErrors, ProducerOnboardingData, StepIndex } from "./types";

// Same patterns as server/src/api/routes/producers.ts's onboardSchema —
// kept in sync by hand across the two packages (frontend/backend are
// separate npm projects), not shared code.
const RCCM_RE = /^BF [A-Z]{3,4} \d{4} [A-Z] \d{3,6}$/;
const IFU_RE = /^\d{11}$/;
const ANEEMAS_RE = /^BF-[A-Z]{3,5}-\d{2}-\d{3,6}$/;
const BANK_ACCOUNT_RE = /^[A-Z0-9]{10,34}$/;

// Burkina Faso's approximate bounding box — catches a mis-typed
// coordinate (wrong hemisphere, swapped lat/lng) before it reaches a
// compliance officer.
const BF_LAT = { min: 9.3, max: 15.1 };
const BF_LNG = { min: -5.6, max: 2.5 };

export function validateStep1(d: ProducerOnboardingData): FieldErrors {
  const errors: FieldErrors = {};
  if (d.legalName.trim().length < 2) errors.legalName = "Enter the registered corporate name.";
  if (!RCCM_RE.test(d.rccmNumber.trim())) {
    errors.rccmNumber = "Format: 'BF OUA 2024 B 1234' (RCCM registration number).";
  }
  if (!IFU_RE.test(d.ifuTaxId.trim())) errors.ifuTaxId = "IFU tax ID must be 11 digits.";
  return errors;
}

export function validateStep2(d: ProducerOnboardingData): FieldErrors {
  const errors: FieldErrors = {};
  if (!ANEEMAS_RE.test(d.aneemasPermit.trim())) {
    errors.aneemasPermit = "Format: 'BF-MEMC-26-4471' (ANEEMAS registration ID).";
  }
  if (d.permitClass === "") errors.permitClass = "Select the concession's permit class.";
  if (d.concessionRef.trim().length < 2) errors.concessionRef = "Enter the concession's reference or name.";

  const lat = Number(d.concessionLat);
  if (!d.concessionLat || Number.isNaN(lat) || lat < BF_LAT.min || lat > BF_LAT.max) {
    errors.concessionLat = `Latitude must fall within Burkina Faso (${BF_LAT.min}–${BF_LAT.max}).`;
  }
  const lng = Number(d.concessionLng);
  if (!d.concessionLng || Number.isNaN(lng) || lng < BF_LNG.min || lng > BF_LNG.max) {
    errors.concessionLng = `Longitude must fall within Burkina Faso (${BF_LNG.min}–${BF_LNG.max}).`;
  }
  return errors;
}

export function validateStep3(d: ProducerOnboardingData): FieldErrors {
  const errors: FieldErrors = {};
  if (d.bankName === "") errors.bankName = "Select the settlement bank.";
  if (d.bankAccountHolder.trim().length < 2) {
    errors.bankAccountHolder = "Enter the account holder name.";
  } else if (!namesLikelyMatch(d.legalName, d.bankAccountHolder)) {
    errors.bankAccountHolder = "Account holder must match the registered corporate legal name.";
  }
  if (!BANK_ACCOUNT_RE.test(d.bankAccountNumber.trim().toUpperCase())) {
    errors.bankAccountNumber = "Enter a valid account number / RIB.";
  }
  return errors;
}

export function validateStep4(d: ProducerOnboardingData): FieldErrors {
  const errors: FieldErrors = {};
  if (!d.oecdAttestationAccepted) {
    errors.oecdAttestationAccepted = "You must attest to the OECD Due Diligence guidelines to proceed.";
  }
  if (d.signatureName.trim().length < 2) {
    errors.signatureName = "Type your full legal name as your signature.";
  }
  return errors;
}

const VALIDATORS: Record<StepIndex, (d: ProducerOnboardingData) => FieldErrors> = {
  0: validateStep1,
  1: validateStep2,
  2: validateStep3,
  3: validateStep4,
};

export function validateStep(step: StepIndex, data: ProducerOnboardingData): FieldErrors {
  return VALIDATORS[step](data);
}

export function isStepValid(step: StepIndex, data: ProducerOnboardingData): boolean {
  return Object.keys(validateStep(step, data)).length === 0;
}

/** Same normalization rule as the backend's namesLikelyMatch — order- and punctuation-insensitive. */
export function namesLikelyMatch(legalName: string, accountHolder: string): boolean {
  const normalize = (s: string) =>
    s
      .toUpperCase()
      .replace(/[^A-Z0-9 ]/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .sort()
      .join(" ");
  return normalize(legalName) === normalize(accountHolder);
}
