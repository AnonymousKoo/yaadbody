"use client";

import { useMemo, useState } from "react";
import { components, ingredients } from "@/fixtures/demo";
import { calculateIngredientPurchaseEconomics, calculateMeasuredBatchCost } from "@/lib/domain/costing";
import type { CostConfidence, IngredientPurchaseObservation, MassUnit } from "@/lib/domain/types";

type PurchaseDraft = IngredientPurchaseObservation & { packagePriceDollars: number; gramsUsed: number };

const units: MassUnit[] = ["lb", "oz", "kg", "g"];
const confidenceLabels: Record<CostConfidence, string> = { demo: "Demo assumption", "measured-once": "Measured once", validated: "Verified purchase evidence" };

function defaultPurchase(ingredientId: string, gramsUsed: number): PurchaseDraft {
  const ingredient = ingredients.find((item) => item.id === ingredientId)!;
  const packageQuantity = ingredient.purchaseUnit === "oz" ? 16 : 1;
  const packageUnit: MassUnit = ingredient.purchaseUnit === "oz" ? "oz" : "lb";
  const grams = packageQuantity * (packageUnit === "lb" ? 453.59237 : 28.349523125);
  const usable = grams * (ingredient.usableYieldPercent / 100);
  return {
    ingredientId,
    packageQuantity,
    packageUnit,
    packagePriceCents: Math.round(usable * ingredient.estimatedCostPerUsableGramCents),
    packagePriceDollars: Math.round(usable * ingredient.estimatedCostPerUsableGramCents) / 100,
    usableYieldPercent: ingredient.usableYieldPercent,
    confidence: "demo",
    sourceLabel: "Demo fixture",
    gramsUsed,
  };
}

export function PurchaseBackedBatchWorkbench() {
  const [componentId, setComponentId] = useState("jerk-chicken");
  const component = components.find((item) => item.id === componentId) ?? components[0];
  const defaults = useMemo(() => component.ingredients.map((line) => defaultPurchase(line.ingredientId, line.gramsPer100gComponent * 10)), [component]);
  const [draftsByComponent, setDraftsByComponent] = useState<Record<string, PurchaseDraft[]>>({});
  const [rawByComponent, setRawByComponent] = useState<Record<string, number>>({});
  const [cookedByComponent, setCookedByComponent] = useState<Record<string, number>>({});
  const [expectedYieldByComponent, setExpectedYieldByComponent] = useState<Record<string, number>>({});
  const drafts = draftsByComponent[componentId] ?? defaults;
  const rawInputGrams = rawByComponent[componentId] ?? Math.round(drafts.reduce((sum, item) => sum + item.gramsUsed, 0));
  const cookedOutputGrams = cookedByComponent[componentId] ?? Math.round(rawInputGrams * 0.78);
  const expectedYieldPercent = expectedYieldByComponent[componentId] ?? 78;

  const updateDraft = (ingredientId: string, patch: Partial<PurchaseDraft>) => {
    setDraftsByComponent((current) => ({
      ...current,
      [componentId]: drafts.map((draft) => draft.ingredientId === ingredientId ? { ...draft, ...patch } : draft),
    }));
  };

  const result = calculateMeasuredBatchCost({
    id: `local-${componentId}`,
    componentId,
    rawInputGrams,
    cookedOutputGrams,
    expectedYieldPercent,
    ingredientUsage: drafts.map((draft) => ({ ingredientId: draft.ingredientId, gramsUsed: draft.gramsUsed })),
    purchases: drafts.map((draft) => ({ ingredientId: draft.ingredientId, packageQuantity: draft.packageQuantity, packageUnit: draft.packageUnit, packagePriceCents: Math.round(draft.packagePriceDollars * 100), usableYieldPercent: draft.usableYieldPercent, confidence: draft.confidence, sourceLabel: draft.sourceLabel })),
  });

  return <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
    <section className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-7">
      <div><p className="eyebrow">Purchase-backed batch</p><h2 className="mt-2 text-3xl font-black tracking-[-.05em]">Prove the food cost from what you bought.</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--ink-muted)]">Enter the package price and size from the receipt or supplier listing, the usable yield, and the exact grams used in the physical batch.</p></div>
      <label className="mt-6 block"><span className="field-label">Component</span><select className="field-control" value={componentId} onChange={(event) => setComponentId(event.target.value)}>{components.map((item) => <option value={item.id} key={item.id}>{item.name} · {item.category}</option>)}</select></label>

      <div className="mt-7 space-y-4">
        {drafts.map((draft) => {
          const ingredient = ingredients.find((item) => item.id === draft.ingredientId)!;
          const economics = calculateIngredientPurchaseEconomics({ ...draft, packagePriceCents: Math.round(draft.packagePriceDollars * 100) });
          return <article key={draft.ingredientId} className="rounded-2xl border border-[var(--line)] bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-black">{ingredient.name}</p><p className="text-xs text-[var(--ink-muted)]">Fixture yield: {ingredient.usableYieldPercent}% · replace with observed trim/yield when known</p></div><select className="rounded-full border border-[var(--line)] bg-white px-3 py-2 text-xs font-bold" value={draft.confidence} onChange={(e) => updateDraft(draft.ingredientId, { confidence: e.target.value as CostConfidence })}>{Object.entries(confidenceLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <NumberField label="Package qty" value={draft.packageQuantity} onChange={(value) => updateDraft(draft.ingredientId, { packageQuantity: value })} step="0.01" />
              <label><span className="field-label">Unit</span><select className="field-control" value={draft.packageUnit} onChange={(e) => updateDraft(draft.ingredientId, { packageUnit: e.target.value as MassUnit })}>{units.map((unit) => <option key={unit}>{unit}</option>)}</select></label>
              <NumberField label="Package price ($)" value={draft.packagePriceDollars} onChange={(value) => updateDraft(draft.ingredientId, { packagePriceDollars: value })} step="0.01" />
              <NumberField label="Usable yield %" value={draft.usableYieldPercent} onChange={(value) => updateDraft(draft.ingredientId, { usableYieldPercent: value })} step="0.1" />
              <NumberField label="Used in batch (g)" value={draft.gramsUsed} onChange={(value) => updateDraft(draft.ingredientId, { gramsUsed: value })} />
            </div>
            <p className="mt-3 text-xs text-[var(--ink-muted)]">{economics.valid ? `${economics.usableGrams.toLocaleString()} usable g · $${(economics.costPerUsableGramCents / 100).toFixed(4)}/usable g` : economics.errors.join(" ")}</p>
          </article>;
        })}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <NumberField label="Raw batch input (g)" value={rawInputGrams} onChange={(value) => setRawByComponent((current) => ({ ...current, [componentId]: value }))} />
        <NumberField label="Cooked usable output (g)" value={cookedOutputGrams} onChange={(value) => setCookedByComponent((current) => ({ ...current, [componentId]: value }))} />
        <NumberField label="Expected yield %" value={expectedYieldPercent} onChange={(value) => setExpectedYieldByComponent((current) => ({ ...current, [componentId]: value }))} step="0.1" />
      </div>
      <p className="mt-5 text-xs leading-5 text-[var(--ink-muted)]">Local calculation only. Nothing is persisted. “Validated” component economics require at least three consistent measured batches; marking a purchase as verified does not validate the recipe by itself.</p>
    </section>

    <aside className="h-fit rounded-[1.6rem] bg-[var(--leaf-deep)] p-6 text-white xl:sticky xl:top-6">
      <p className="text-xs font-black uppercase tracking-[.16em] text-[var(--warm)]">Measured economics</p>
      {!result.valid ? <ul className="mt-5 space-y-2 text-sm text-[#ffd8c5]">{result.errors.map((error) => <li key={error}>• {error}</li>)}</ul> : <>
        <div className="mt-5 grid grid-cols-2 gap-3"><Metric label="Batch food cost" value={`$${(result.totalBatchIngredientCostCents / 100).toFixed(2)}`} /><Metric label="Cost / cooked 100g" value={`$${(result.costPerCooked100gCents / 100).toFixed(2)}`} /><Metric label="Measured yield" value={`${result.measuredYieldPercent}%`} /><Metric label="Vs expected" value={`${result.yieldVariancePercent > 0 ? "+" : ""}${result.yieldVariancePercent}%`} /></div>
        <div className="mt-5 rounded-2xl bg-white/10 p-4"><p className="text-xs font-black uppercase tracking-[.12em] text-white/50">Evidence state</p><p className="mt-2 text-2xl font-black capitalize text-[var(--warm)]">{result.confidence.replace("-", " ")}</p><p className="mt-2 text-xs leading-5 text-white/55">A single physical batch can become measured evidence, never a validated production baseline by itself.</p></div>
        <div className="mt-5 divide-y divide-white/10 border-t border-white/10">{result.ingredientCosts.map((line) => <div key={line.ingredientId} className="flex justify-between gap-3 py-3 text-sm"><span className="text-white/60">{ingredients.find((item) => item.id === line.ingredientId)?.name}</span><span className="font-black">${(line.costCents / 100).toFixed(2)}</span></div>)}</div>
      </>}
    </aside>
  </div>;
}

function NumberField({ label, value, onChange, step = "1" }: { label: string; value: number; onChange: (value: number) => void; step?: string }) { return <label><span className="field-label">{label}</span><input className="field-control" type="number" min="0" step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-[10px] font-black uppercase tracking-[.1em] text-white/45">{label}</p><p className="mt-2 text-xl font-black">{value}</p></div>; }
