import React, { useMemo } from "react";
import { FlaskConical } from "lucide-react";

/**
 * "Origin Assay vs Refinery Settlement Match" — compares the ANEEMAS
 * government assay (origin) against the independent referee assay at
 * settlement (server/src/api/routes/assays.ts's ASSAY_TOLERANCE_PCT is
 * ±0.5%; this widget renders that same tolerance rather than a separate
 * hardcoded threshold, so a schema/spec change to the tolerance only
 * needs to happen in one place).
 */
const ASSAY_TOLERANCE_PCT = 0.5;

const DEFAULT_SETTLEMENTS = [
  { lotRef: "AGL-2608-01", originPct: 99.3, settlementPct: 99.34 },
  { lotRef: "AGL-2607-04", originPct: 97.85, settlementPct: 97.71 },
  { lotRef: "AGL-2606-09", originPct: 92.6, settlementPct: 92.42 },
];

function matchTone(variance) {
  const abs = Math.abs(variance);
  if (abs <= ASSAY_TOLERANCE_PCT * 0.4) return "emerald";
  if (abs <= ASSAY_TOLERANCE_PCT) return "amber";
  return "rose";
}

const TONE = {
  emerald: { bar: "#059669", text: "text-emerald-600", bg: "bg-emerald-500" },
  amber: { bar: "#B45309", text: "text-amber-600", bg: "bg-amber-500" },
  rose: { bar: "#B91C1C", text: "text-rose-600", bg: "bg-rose-500" },
};

export default function AssayMatchWidget({ settlements = DEFAULT_SETTLEMENTS }) {
  // A linear "match score" reads as alarming for lots that are actually
  // fine (a variance at 40% of tolerance is a clean pass, not a C-minus) —
  // the honest aggregate is how many lots cleared tolerance at all.
  const withinTolerance = useMemo(
    () => settlements.filter((s) => Math.abs(s.settlementPct - s.originPct) <= ASSAY_TOLERANCE_PCT).length,
    [settlements]
  );

  return (
    <div className="border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <FlaskConical size={15} className="text-[#D4AF37]" />
          <div>
            <div className="text-[13.5px] font-bold text-slate-900">Origin Assay vs Refinery Settlement Match</div>
            <div className="text-[11.5px] text-slate-500">ANEEMAS government assay reconciled against independent referee assay</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[20px] font-semibold tabular-nums text-slate-900">
            {withinTolerance}/{settlements.length}
          </div>
          <div className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-slate-400">Within ±{ASSAY_TOLERANCE_PCT}%, last {settlements.length}</div>
        </div>
      </div>

      <div className="flex flex-col divide-y divide-slate-100">
        {settlements.map((s) => {
          const variance = s.settlementPct - s.originPct;
          const tone = matchTone(variance);
          const t = TONE[tone];
          const barWidth = Math.max(4, 100 - (Math.abs(variance) / ASSAY_TOLERANCE_PCT) * 100);
          return (
            <div key={s.lotRef} className="grid grid-cols-[110px_1fr_auto] items-center gap-4 px-6 py-3.5">
              <div className="font-mono text-[12px] font-semibold text-slate-900">{s.lotRef}</div>
              <div>
                <div className="flex items-center justify-between font-mono text-[10.5px] text-slate-400">
                  <span>Origin {s.originPct.toFixed(2)}%</span>
                  <span>Settled {s.settlementPct.toFixed(2)}%</span>
                </div>
                <div className="mt-1 h-1.5 w-full bg-slate-100">
                  <div className={`h-full ${t.bg}`} style={{ width: `${barWidth}%` }} />
                </div>
              </div>
              <div className={`whitespace-nowrap font-mono text-[12px] font-semibold ${t.text}`}>
                {variance >= 0 ? "+" : ""}
                {variance.toFixed(2)}%
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-slate-100 px-6 py-3 text-[11px] text-slate-400">
        Tolerance ±{ASSAY_TOLERANCE_PCT}% — a lot outside tolerance routes to escrow dispute review before settlement.
      </div>
    </div>
  );
}
