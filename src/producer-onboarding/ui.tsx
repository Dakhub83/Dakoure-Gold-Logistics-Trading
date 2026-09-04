import React from "react";
import { Check } from "lucide-react";
import { WIZARD_STEPS, type StepIndex } from "./types";

/**
 * Same hex values as GoldCorridorPlatform.jsx's SILVER/GOLD_GRAD/navy
 * tokens (not imported — that file doesn't export them, and this wizard
 * is meant to stay a self-contained module). Keep these in sync by hand
 * if the brand palette ever changes.
 */
export const BRAND = {
  navy: "#0F172A",
  rail: "#0B1120",
  gold: "#D4AF37",
  goldGrad: "linear-gradient(150deg,#E7CB63 0%,#D4AF37 42%,#9C7C22 100%)",
  silverGrad: "linear-gradient(160deg,#F4F6F8 0%,#C9CDD4 55%,#A8AEB8 100%)",
};

export function WizardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-900 px-5 py-14 text-white" style={{ background: BRAND.navy }}>
      <div className="mx-auto w-full max-w-[720px]">{children}</div>
    </div>
  );
}

export function StepIndicator({ current }: { current: StepIndex }) {
  return (
    <ol className="mb-10 grid grid-cols-4 gap-0">
      {WIZARD_STEPS.map(({ index, title }, i) => {
        const status = index < current ? "done" : index === current ? "live" : "pending";
        const last = i === WIZARD_STEPS.length - 1;
        return (
          <li key={index} className="relative pr-4 last:pr-0">
            {!last && (
              <div className="absolute left-[18px] right-0 top-[17px] h-0.5 bg-white/10">
                <div
                  className="h-full transition-[width] duration-500"
                  style={{ width: status === "done" ? "100%" : "0%", background: BRAND.gold }}
                />
              </div>
            )}
            <div
              className={`relative z-[1] grid h-9 w-9 place-items-center rounded-full border-2 text-[13px] font-semibold ${
                status === "pending" ? "border-white/15 text-slate-500" : "border-[#D4AF37]"
              }`}
              style={
                status === "done"
                  ? { background: BRAND.goldGrad, color: "#0B1120" }
                  : status === "live"
                    ? { color: BRAND.gold, boxShadow: "0 0 0 5px rgba(212,175,55,.14)" }
                    : undefined
              }
            >
              {status === "done" ? <Check size={15} strokeWidth={3} /> : index + 1}
            </div>
            <div
              className={`mt-2.5 font-mono text-[9.5px] uppercase tracking-[0.12em] ${
                status === "pending" ? "text-slate-500" : "text-[#D4AF37]"
              }`}
            >
              Step {index + 1}
            </div>
            <div className={`text-[12.5px] font-medium leading-tight ${status === "pending" ? "text-slate-400" : "text-slate-100"}`}>
              {title}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function FieldWrap({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[12.5px] font-medium text-slate-300">
        {label}
      </label>
      {children}
      {error ? (
        <span className="text-[11.5px] text-rose-400">{error}</span>
      ) : hint ? (
        <span className="text-[11.5px] text-slate-500">{hint}</span>
      ) : null}
    </div>
  );
}

const inputBase =
  "w-full border bg-white/[0.04] px-3.5 py-2.5 text-[13.5px] text-white placeholder:text-slate-500 outline-none transition focus:bg-white/[0.06]";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  const { invalid, className = "", ...rest } = props;
  return (
    <input
      {...rest}
      className={`${inputBase} ${invalid ? "border-rose-500/60" : "border-white/15 focus:border-[#D4AF37]/60"} ${className}`}
    />
  );
}

export function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean; children: React.ReactNode }
) {
  const { invalid, className = "", children, ...rest } = props;
  return (
    <select
      {...rest}
      className={`${inputBase} ${invalid ? "border-rose-500/60" : "border-white/15 focus:border-[#D4AF37]/60"} ${className}`}
    >
      {children}
    </select>
  );
}

export function WizardNav({
  onBack,
  onNext,
  backLabel = "Back",
  nextLabel = "Continue",
  loading = false,
}: {
  onBack?: () => void;
  onNext: () => void;
  backLabel?: string;
  nextLabel?: string;
  loading?: boolean;
}) {
  return (
    <div className="mt-9 flex items-center justify-between border-t border-white/10 pt-6">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="text-[13px] font-medium text-slate-400 transition hover:text-slate-200"
        >
          {backLabel}
        </button>
      ) : (
        <span />
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={loading}
        className="flex items-center gap-2 px-6 py-2.5 text-[13.5px] font-semibold text-[#0B1120] transition disabled:cursor-not-allowed disabled:opacity-50"
        style={{ background: BRAND.goldGrad }}
      >
        {loading ? "Submitting…" : nextLabel}
      </button>
    </div>
  );
}
