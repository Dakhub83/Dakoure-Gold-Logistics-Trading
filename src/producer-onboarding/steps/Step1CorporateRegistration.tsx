import React from "react";
import { useProducerOnboarding } from "../useProducerOnboarding";
import { FieldWrap, TextInput } from "../ui";

export function Step1CorporateRegistration() {
  const { state, setField } = useProducerOnboarding();
  const { data, errors } = state;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[19px] font-semibold text-white">Corporate Registration</h2>
        <p className="mt-1 text-[13px] text-slate-400">
          The registered legal entity that will hold the ANEEMAS permit and sign the trade contract.
        </p>
      </div>

      <FieldWrap label="Legal name" htmlFor="legalName" error={errors.legalName}>
        <TextInput
          id="legalName"
          placeholder="e.g. Société Minière SOMIKA SARL"
          value={data.legalName}
          invalid={!!errors.legalName}
          onChange={(e) => setField("legalName", e.target.value)}
        />
      </FieldWrap>

      <FieldWrap
        label="RCCM registration number"
        htmlFor="rccmNumber"
        error={errors.rccmNumber}
        hint="Registre du Commerce et du Crédit Mobilier — format 'BF OUA 2024 B 1234'"
      >
        <TextInput
          id="rccmNumber"
          placeholder="BF OUA 2024 B 1234"
          value={data.rccmNumber}
          invalid={!!errors.rccmNumber}
          onChange={(e) => setField("rccmNumber", e.target.value.toUpperCase())}
        />
      </FieldWrap>

      <FieldWrap label="Tax ID / IFU" htmlFor="ifuTaxId" error={errors.ifuTaxId} hint="Identifiant Financier Unique — 11 digits">
        <TextInput
          id="ifuTaxId"
          placeholder="00123456789"
          inputMode="numeric"
          maxLength={11}
          value={data.ifuTaxId}
          invalid={!!errors.ifuTaxId}
          onChange={(e) => setField("ifuTaxId", e.target.value.replace(/\D/g, ""))}
        />
      </FieldWrap>
    </div>
  );
}
