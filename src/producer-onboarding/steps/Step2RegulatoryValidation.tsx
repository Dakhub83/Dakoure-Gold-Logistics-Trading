import React from "react";
import { useProducerOnboarding } from "../useProducerOnboarding";
import { FieldWrap, Select, TextInput } from "../ui";

export function Step2RegulatoryValidation() {
  const { state, setField } = useProducerOnboarding();
  const { data, errors } = state;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[19px] font-semibold text-white">Regulatory Validation</h2>
        <p className="mt-1 text-[13px] text-slate-400">
          Cross-checked against the ANEEMAS register before any lot from this concession is accepted.
        </p>
      </div>

      <FieldWrap
        label="ANEEMAS registration ID"
        htmlFor="aneemasPermit"
        error={errors.aneemasPermit}
        hint="Format 'BF-MEMC-26-4471'"
      >
        <TextInput
          id="aneemasPermit"
          placeholder="BF-MEMC-26-4471"
          value={data.aneemasPermit}
          invalid={!!errors.aneemasPermit}
          onChange={(e) => setField("aneemasPermit", e.target.value.toUpperCase())}
        />
      </FieldWrap>

      <FieldWrap label="Concession permit class" htmlFor="permitClass" error={errors.permitClass}>
        <Select
          id="permitClass"
          value={data.permitClass}
          invalid={!!errors.permitClass}
          onChange={(e) => setField("permitClass", e.target.value as typeof data.permitClass)}
        >
          <option value="" disabled>
            Select a permit class…
          </option>
          <option value="artisanal">Artisanal small-scale mining</option>
          <option value="semi_mechanised">Semi-mechanised</option>
        </Select>
      </FieldWrap>

      <FieldWrap label="Concession reference / name" htmlFor="concessionRef" error={errors.concessionRef}>
        <TextInput
          id="concessionRef"
          placeholder="e.g. Concession Boulkiemdé-14"
          value={data.concessionRef}
          invalid={!!errors.concessionRef}
          onChange={(e) => setField("concessionRef", e.target.value)}
        />
      </FieldWrap>

      <div className="grid grid-cols-2 gap-4">
        <FieldWrap label="Concession latitude" htmlFor="concessionLat" error={errors.concessionLat}>
          <TextInput
            id="concessionLat"
            placeholder="12.353"
            inputMode="decimal"
            value={data.concessionLat}
            invalid={!!errors.concessionLat}
            onChange={(e) => setField("concessionLat", e.target.value)}
          />
        </FieldWrap>
        <FieldWrap label="Concession longitude" htmlFor="concessionLng" error={errors.concessionLng}>
          <TextInput
            id="concessionLng"
            placeholder="-1.512"
            inputMode="decimal"
            value={data.concessionLng}
            invalid={!!errors.concessionLng}
            onChange={(e) => setField("concessionLng", e.target.value)}
          />
        </FieldWrap>
      </div>
    </div>
  );
}
