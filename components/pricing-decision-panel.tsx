"use client";

import { useState } from "react";
import { evaluateMealPricing, type CostBasisStatus } from "@/lib/domain/pricing";

export function PricingDecisionPanel({ costCents, costStatus }: { costCents: number | null; costStatus: CostBasisStatus }) {
  const [targetMarginPercent, setTargetMarginPercent] = useState(25);
  const [roundingIncrementCents, setRoundingIncrementCents] = useState(50);
  const [candidatePriceDollars, setCandidatePriceDollars] = useState(14);
  const result = evaluateMealPricing({
    costCents,
    costStatus,
    targetMarginPercent,
    roundingIncrementCents,
    candidatePriceCents: Math.round(candidatePriceDollars * 100),
  });

  return <article className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-7">
    <p className="eyebrow">Pricing decision support</p>
    <h3 className="mt-2 text-2xl font-black">Protect the margin before publishing a price.</h3>
    <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--ink-muted)]">This uses the fully loaded unit cost above. An estimate can support planning, but only a validated cost basis can produce a validated price floor.</p>
    <div className="mt-5 grid gap-4 sm:grid-cols-3">
      <NumberField label="Target unit margin %" value={targetMarginPercent} onChange={setTargetMarginPercent} />
      <label><span className="field-label">Round price up to</span><select className="field-control" value={roundingIncrementCents} onChange={(e) => setRoundingIncrementCents(Number(e.target.value))}><option value={25}>$0.25</option><option value={50}>$0.50</option><option value={100}>$1.00</option></select></label>
      <NumberField label="Candidate sell price ($)" value={candidatePriceDollars} onChange={setCandidatePriceDollars} />
    </div>
    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <PricingMetric label="Cost basis" value={costCents === null ? "Blocked" : `$${(costCents / 100).toFixed(2)}`} />
      <PricingMetric label="Exact price floor" value={result.minimumPriceCents === null ? "—" : `$${(result.minimumPriceCents / 100).toFixed(2)}`} />
      <PricingMetric label="Rounded planning price" value={result.recommendedPriceCents === null ? "—" : `$${(result.recommendedPriceCents / 100).toFixed(2)}`} />
      <PricingMetric label="Margin at rounded price" value={result.achievedMarginPercent === null ? "—" : `${result.achievedMarginPercent}%`} />
    </div>
    <div className={`mt-5 rounded-2xl p-4 ${result.canFinalize ? "bg-[#e5f0e6] text-[var(--leaf-deep)]" : "bg-[#fff0e8] text-[var(--brand-deep)]"}`}>
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.12em]">{result.status.replaceAll("-", " ")}</p><p className="mt-1 text-sm font-bold">Candidate ${candidatePriceDollars.toFixed(2)} → {result.candidateMarginPercent === null ? "margin unavailable" : `${result.candidateMarginPercent}% fully loaded unit margin`}</p></div><span className="rounded-full border border-current/20 px-3 py-1 text-xs font-black">{result.canFinalize ? "Cost basis validated" : "Planning only"}</span></div>
      {!result.canFinalize && <p className="mt-2 text-xs leading-5 opacity-75">Do not publish this as a system-approved price until the underlying meal cost reaches validated status.</p>}
    </div>
    {result.errors.length > 0 && <ul className="mt-4 space-y-1 text-xs text-[var(--brand-deep)]">{result.errors.map((error) => <li key={error}>• {error}</li>)}</ul>}
  </article>;
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) { return <label><span className="field-label">{label}</span><input className="field-control" type="number" min="0" step="0.01" value={value} onChange={(e) => onChange(Number(e.target.value))} /></label>; }
function PricingMetric({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-[var(--surface-soft)] p-4"><p className="text-[10px] font-black uppercase tracking-[.12em] text-[var(--ink-muted)]">{label}</p><p className="mt-2 text-xl font-black">{value}</p></div>; }
