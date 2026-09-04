import React from "react";
import { useProducerOnboarding } from "../useProducerOnboarding";
import { FieldWrap, Select, TextInput } from "../ui";

export function Step3FinancialSettlement() {
  const { state, setField } = useProducerOnboarding();
  const { data, errors } = state;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[19px] font-semibold text-white">Financial Settlement</h2>
        <p className="mt-1 text-[13px] text-slate-400">
          Settlement account must be held in the name of the corporate entity from Step 1 — a mismatch is
          the single most common reason KYC rejects a producer.
        </p>
      </div>

      <FieldWrap label="Settlement bank" htmlFor="bankName" error={errors.bankName}>
        <Select
          id="bankName"
          value={data.bankName}
          invalid={!!errors.bankName}
          onChange={(e) => setField("bankName", e.target.value as typeof data.bankName)}
        >
          <option value="" disabled>
            Select a bank…
          </option>
          <option value="Ecobank">Ecobank Burkina Faso</option>
          <option value="Coris Bank">Coris Bank International</option>
          <option value="Other">Other licensed bank</option>
        </Select>
      </FieldWrap>

      <FieldWrap
        label="Account holder name"
        htmlFor="bankAccountHolder"
        error={errors.bankAccountHolder}
        hint="Must match the legal name entered in Step 1"
      >
        <TextInput
          id="bankAccountHolder"
          placeholder={data.legalName || "e.g. Société Minière SOMIKA SARL"}
          value={data.bankAccountHolder}
          invalid={!!errors.bankAccountHolder}
          onChange={(e) => setField("bankAccountHolder", e.target.value)}
        />
      </FieldWrap>

      <FieldWrap
        label="Account number / RIB"
        htmlFor="bankAccountNumber"
        error={errors.bankAccountNumber}
      >
        <TextInput
          id="bankAccountNumber"
          placeholder="BF13 BF00 0000 0000 0000 0000 0000"
          value={data.bankAccountNumber}
          invalid={!!errors.bankAccountNumber}
          onChange={(e) => setField("bankAccountNumber", e.target.value.toUpperCase())}
        />
      </FieldWrap>
    </div>
  );
}
