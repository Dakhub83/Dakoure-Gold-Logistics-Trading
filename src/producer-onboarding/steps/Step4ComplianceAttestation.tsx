import React from "react";
import { ShieldCheck } from "lucide-react";
import { useProducerOnboarding } from "../useProducerOnboarding";
import { FieldWrap, TextInput } from "../ui";

const OECD_STEPS = [
  "Establish strong company management systems for supply chain due diligence.",
  "Identify and assess risk in the mineral supply chain — conflict financing, serious human rights abuses, and non-state armed group involvement.",
  "Design and implement a strategy to respond to identified risks, including suspension or discontinuation of engagement where risk cannot be mitigated.",
  "Carry out an independent third-party audit of supply chain due diligence at identified points in the chain.",
  "Report annually on supply chain due diligence, in line with the OECD Due Diligence Guidance for Responsible Supply Chains of Minerals from Conflict-Affected and High-Risk Areas.",
];

export function Step4ComplianceAttestation() {
  const { state, setField } = useProducerOnboarding();
  const { data, errors } = state;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[19px] font-semibold text-white">Legal &amp; Compliance Attestation</h2>
        <p className="mt-1 text-[13px] text-slate-400">
          Burkina Faso is treated as a Conflict-Affected and High-Risk Area under the OECD framework —
          this attestation is required before any lot from this producer can be allocated.
        </p>
      </div>

      <div className="border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center gap-2.5 text-[12.5px] font-semibold uppercase tracking-[0.1em] text-[#D4AF37]">
          <ShieldCheck size={15} /> OECD Due Diligence — Five-Step Framework
        </div>
        <ol className="mt-3.5 flex flex-col gap-2.5">
          {OECD_STEPS.map((text, i) => (
            <li key={i} className="flex gap-3 text-[12.8px] leading-relaxed text-slate-300">
              <span className="font-mono text-[11px] text-slate-500">{String(i + 1).padStart(2, "0")}</span>
              <span>{text}</span>
            </li>
          ))}
        </ol>
      </div>

      <label className="flex cursor-pointer items-start gap-3 border border-white/10 bg-white/[0.03] p-4">
        <input
          type="checkbox"
          checked={data.oecdAttestationAccepted}
          onChange={(e) => setField("oecdAttestationAccepted", e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[#D4AF37]"
        />
        <span className="text-[12.8px] leading-relaxed text-slate-300">
          I attest, on behalf of the corporate entity named in Step 1, that the gold supplied through this
          account originates from conflict-free sources, that we will cooperate with chain-of-custody
          audits, and that we understand a false attestation voids this producer's ANEEMAS-linked
          allocation.
        </span>
      </label>
      {errors.oecdAttestationAccepted && (
        <span className="-mt-3 text-[11.5px] text-rose-400">{errors.oecdAttestationAccepted}</span>
      )}

      <FieldWrap
        label="Digital signature — type your full legal name"
        htmlFor="signatureName"
        error={errors.signatureName}
        hint="Typing your name here constitutes your electronic signature on this attestation."
      >
        <TextInput
          id="signatureName"
          placeholder="e.g. Adama Ouédraogo, Gérant"
          value={data.signatureName}
          invalid={!!errors.signatureName}
          onChange={(e) => setField("signatureName", e.target.value)}
        />
      </FieldWrap>

      {data.signatureName.trim().length > 1 && (
        <div className="border border-[#D4AF37]/30 bg-[#D4AF37]/[0.06] p-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">Signed as</div>
          <div className="mt-1 text-[20px] italic text-[#E7CB63]" style={{ fontFamily: "Georgia, serif" }}>
            {data.signatureName}
          </div>
          <div className="mt-1.5 font-mono text-[10.5px] text-slate-500">
            Recorded at submission time · attestation ID assigned on confirmation
          </div>
        </div>
      )}
    </div>
  );
}
