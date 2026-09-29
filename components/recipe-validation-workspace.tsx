"use client";

import { useState } from "react";
import { components, ingredients } from "@/fixtures/demo";
import { estimateComponentCostCents } from "@/lib/domain/calculations";
import { summarizeRecipeBatchTest } from "@/lib/domain/recipe-validation";

export function RecipeValidationWorkspace() {
  const [componentId, setComponentId] = useState("jerk-chicken");
  const [rawInputGrams, setRawInputGrams] = useState(1000);
  const [cookedOutputGrams, setCookedOutputGrams] = useState(760);
  const [actualBatchCostDollars, setActualBatchCostDollars] = useState(9.5);
  const component = components.find((item) => item.id === componentId) ?? components[0];
  const summary = summarizeRecipeBatchTest({
    id: "local-batch-test",
    componentId,
    rawInputGrams,
    cookedOutputGrams,
    actualBatchCostCents: Math.round(actualBatchCostDollars * 100),
  });
  const demoExpectedCostPer100g = estimateComponentCostCents(component, ingredients, 100);
  const costDeltaPercent = demoExpectedCostPer100g > 0
    ? ((summary.actualCostPerCooked100gCents - demoExpectedCostPer100g) / demoExpectedCostPer100g) * 100
    : 0;

  return <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
    <section className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-7">
      <div className="mb-6"><p className="eyebrow">Physical batch input</p><h2 className="mt-2 text-3xl font-black tracking-[-.05em]">Weigh what actually happened.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-muted)]">Use the cooked kitchen batch — not a recipe estimate — to replace demo yield and cost assumptions with measured operating data.</p></div>
      <label className="block"><span className="mb-2 block text-xs font-black uppercase tracking-[.12em] text-[var(--ink-muted)]">Component</span><select className="field-control" value={componentId} onChange={(event) => setComponentId(event.target.value)}>{components.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.category}</option>)}</select></label>
      <div className="mt-5 grid gap-5 sm:grid-cols-3">
        <NumberField label="Raw / pre-cook grams" value={rawInputGrams} onChange={setRawInputGrams} />
        <NumberField label="Cooked output grams" value={cookedOutputGrams} onChange={setCookedOutputGrams} />
        <NumberField label="Actual batch ingredient cost ($)" value={actualBatchCostDollars} onChange={setActualBatchCostDollars} step="0.01" />
      </div>
      <div className="mt-6 rounded-2xl bg-[var(--surface-soft)] p-5"><p className="text-xs font-black uppercase tracking-[.12em] text-[var(--ink-muted)]">What to capture during the physical test</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{["Exact raw batch weight", "Exact cooked usable output", "Actual ingredients used", "Actual purchase cost", "Trim / spill / burnt loss", "Portion count produced"].map((item) => <div key={item} className="flex items-center gap-3 text-sm font-bold"><span className="h-2 w-2 rounded-full bg-[var(--brand)]" />{item}</div>)}</div></div>
      <p className="mt-5 text-xs leading-5 text-[var(--ink-muted)]">Nothing entered here is stored yet. This workspace is a local calculation surface until YaadBody receives an approved persistence path through the shared platform.</p>
    </section>
    <aside className="h-fit rounded-[1.6rem] bg-[var(--leaf-deep)] p-6 text-white lg:sticky lg:top-6">
      <p className="text-xs font-black uppercase tracking-[.16em] text-[var(--warm)]">Measured batch result</p>
      {!summary.valid ? <ul className="mt-5 space-y-2 text-sm text-[#ffd8c5]">{summary.errors.map((error) => <li key={error}>• {error}</li>)}</ul> : <>
        <div className="mt-5 grid grid-cols-2 gap-3"><Metric label="Mass yield" value={`${summary.yieldPercent}%`} /><Metric label="Mass change" value={`${summary.massChangePercent > 0 ? "+" : ""}${summary.massChangePercent}%`} /><Metric label="Actual / 100g" value={`$${(summary.actualCostPerCooked100gCents / 100).toFixed(2)}`} /><Metric label="Demo / 100g" value={`$${(demoExpectedCostPer100g / 100).toFixed(2)}`} /></div>
        <div className="mt-5 rounded-2xl bg-white/10 p-4"><p className="text-xs font-black uppercase tracking-[.12em] text-white/50">Difference from demo cost</p><p className="mt-2 text-2xl font-black text-[var(--warm)]">{costDeltaPercent > 0 ? "+" : ""}{costDeltaPercent.toFixed(1)}%</p><p className="mt-2 text-xs leading-5 text-white/55">A single test is evidence, not the permanent standard. Repeat batches before locking a production yield or cost baseline.</p></div>
      </>}
    </aside>
  </div>;
}

function NumberField({ label, value, onChange, step = "1" }: { label: string; value: number; onChange: (value: number) => void; step?: string }) { return <label className="block"><span className="mb-2 block text-xs font-black uppercase tracking-[.12em] text-[var(--ink-muted)]">{label}</span><input className="field-control" type="number" min="0" step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs font-bold uppercase tracking-[.1em] text-white/45">{label}</p><p className="mt-2 text-xl font-black">{value}</p></div>; }
