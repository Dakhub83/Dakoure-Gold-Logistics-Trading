import React from "react";
import { CheckCircle2 } from "lucide-react";
import { ProducerOnboardingProvider, useProducerOnboarding } from "./useProducerOnboarding";
import { BRAND, StepIndicator, WizardNav, WizardShell } from "./ui";
import { Step1CorporateRegistration } from "./steps/Step1CorporateRegistration";
import { Step2RegulatoryValidation } from "./steps/Step2RegulatoryValidation";
import { Step3FinancialSettlement } from "./steps/Step3FinancialSettlement";
import { Step4ComplianceAttestation } from "./steps/Step4ComplianceAttestation";

function WizardBody() {
  const { state, goNext, goBack, submit } = useProducerOnboarding();

  if (state.result) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div
          className="grid h-16 w-16 place-items-center rounded-full"
          style={{ background: BRAND.goldGrad }}
        >
          <CheckCircle2 size={30} className="text-[#0B1120]" />
        </div>
        <h2 className="text-[22px] font-semibold text-white">Onboarding submitted</h2>
        <p className="max-w-[46ch] text-[13.5px] text-slate-400">
          Producer record <span className="font-mono text-[#D4AF37]">{state.result.producerId}</span> is
          now <span className="font-mono text-[#D4AF37]">{state.result.status}</span> and queued for
          ANEEMAS cross-verification. You'll be notified once compliance clears it for lot creation.
        </p>
      </div>
    );
  }

  const steps = [
    <Step1CorporateRegistration key={0} />,
    <Step2RegulatoryValidation key={1} />,
    <Step3FinancialSettlement key={2} />,
    <Step4ComplianceAttestation key={3} />,
  ];

  const isLast = state.step === 3;

  return (
    <>
      <StepIndicator current={state.step} />
      {steps[state.step]}
      {state.submitError && (
        <div className="mt-5 border border-rose-500/30 bg-rose-500/[0.08] px-4 py-3 text-[12.5px] text-rose-300">
          {state.submitError}
        </div>
      )}
      <WizardNav
        onBack={state.step > 0 ? goBack : undefined}
        onNext={isLast ? submit : goNext}
        nextLabel={isLast ? "Sign & Submit" : "Continue"}
        loading={state.submitting}
      />
    </>
  );
}

export default function ProducerOnboardingWizard() {
  return (
    <WizardShell>
      <div className="mb-8">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#D4AF37]">
          Gold Corridor · Producer Onboarding
        </div>
        <h1 className="mt-1.5 text-[26px] font-bold tracking-tight text-white">
          Register as a licensed producer
        </h1>
      </div>
      <ProducerOnboardingProvider>
        <WizardBody />
      </ProducerOnboardingProvider>
    </WizardShell>
  );
}
