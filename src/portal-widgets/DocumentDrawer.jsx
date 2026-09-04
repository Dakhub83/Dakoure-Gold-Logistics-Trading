import React, { useEffect } from "react";
import { X, FileText, ShieldCheck, Download } from "lucide-react";

const REGULATORY_RE = /ANEEMAS|BUMIGEB/i;

/**
 * Slide-over panel for one Document Vault row. Kept as a standalone
 * component (like AssayMatchWidget) rather than inlined in Documents() —
 * it owns its own escape-key/backdrop-close behaviour and doesn't need
 * anything from the rest of that component beyond the row + i18n labels
 * already resolved there.
 */
export default function DocumentDrawer({ doc, labels, onClose }) {
  const { drawer: D, th, st, dl } = labels;
  const isRegulatory = REGULATORY_RE.test(doc.n);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const statusPill =
    doc.s === "ok"
      ? { label: st.ok, cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600" }
      : doc.s === "wait"
        ? { label: st.wait, cls: "border-amber-500/30 bg-amber-500/10 text-amber-600" }
        : { label: st.move, cls: "border-slate-300 bg-slate-100 text-slate-600" };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px]" onClick={onClose} />

      <aside className="relative flex h-full w-full max-w-[440px] flex-col bg-white shadow-2xl animate-[drawerin_.28s_ease] motion-reduce:animate-none">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div className="flex min-w-0 items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center border border-slate-200 bg-slate-100 text-[#B8952E]">
              <FileText size={18} />
            </div>
            <div className="min-w-0">
              <div className="font-mono text-[9.5px] uppercase tracking-[0.13em] text-slate-400">{D.title}</div>
              <div className="mt-0.5 text-[14.5px] font-bold leading-snug text-slate-900">{doc.n}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={D.close}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-sm text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={17} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10.5px] font-medium ${statusPill.cls}`}>
              {statusPill.label}
            </span>
            {isRegulatory && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/35 bg-[#D4AF37]/10 px-2.5 py-1 font-mono text-[10.5px] font-medium text-[#8A6C1E]">
                <ShieldCheck size={11} /> {D.regulatory}
              </span>
            )}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden border border-slate-200 bg-slate-200">
            {[
              [th[1], doc.c],
              [th[2], doc.d],
              ["File size", doc.m],
              [th[3], statusPill.label],
            ].map(([k, v]) => (
              <div key={k} className="bg-white px-4 py-3">
                <div className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-slate-400">{k}</div>
                <div className="mt-1 font-mono text-[12.5px] font-semibold text-slate-900">{v}</div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <div className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-3 border border-dashed border-slate-300 bg-slate-50 text-center">
              <FileText size={34} className="text-slate-300" />
              <div className="px-8 text-[12px] text-slate-400">{D.previewNote}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-slate-200 px-6 py-4">
          <button
            onClick={onClose}
            className="flex-1 border border-slate-200 py-2.5 text-[13px] font-semibold text-slate-600 hover:bg-slate-50"
          >
            {D.close}
          </button>
          <button
            className="flex flex-1 items-center justify-center gap-2 py-2.5 text-[13px] font-semibold text-[#0B1120]"
            style={{ background: "linear-gradient(150deg,#E7CB63 0%,#D4AF37 42%,#9C7C22 100%)" }}
          >
            <Download size={15} /> {dl}
          </button>
        </div>
      </aside>
    </div>
  );
}
