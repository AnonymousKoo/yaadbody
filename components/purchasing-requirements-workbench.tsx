"use client";

import { useState } from "react";
import { components, demoOrders, ingredients, meals, weeklyMenu } from "@/fixtures/demo";
import { aggregateMealPrepDemand } from "@/lib/domain/production";
import { calculateIngredientPurchaseRequirements } from "@/lib/domain/purchasing";
import type { ComponentCostEvidence, CostConfidence, IngredientInventoryPosition } from "@/lib/domain/types";

const confidenceOptions: CostConfidence[] = ["demo", "measured-once", "validated"];
const demand = aggregateMealPrepDemand(demoOrders, weeklyMenu, meals);
const demandedComponentIds = demand.map((item) => item.componentId);

export function PurchasingRequirementsWorkbench() {
  const [yieldEvidence, setYieldEvidence] = useState<Record<string, { yieldPercent: number; confidence: CostConfidence; runs: number; yieldSpread: number }>>(
    Object.fromEntries(demandedComponentIds.map((componentId) => [componentId, { yieldPercent: 100, confidence: "demo" as CostConfidence, runs: 0, yieldSpread: 0 }])),
  );
  const [inventory, setInventory] = useState<IngredientInventoryPosition[]>(ingredients.map((ingredient) => ({ ingredientId: ingredient.id, usableOnHandGrams: 0, reservedGrams: 0, safetyStockGrams: 0, confidence: "demo" })));

  const componentEvidence: ComponentCostEvidence[] = demand.map((item) => {
    const evidence = yieldEvidence[item.componentId];
    return { componentId: item.componentId, costPerCooked100gCents: 0, measuredYieldPercent: evidence.yieldPercent, confidence: evidence.confidence, evidenceRunCount: evidence.runs, yieldSpreadPercent: evidence.yieldSpread };
  });
  const result = calculateIngredientPurchaseRequirements(demand, components, componentEvidence, inventory);
  const componentMap = new Map(components.map((component) => [component.id, component]));
  const ingredientMap = new Map(ingredients.map((ingredient) => [ingredient.id, ingredient]));

  const updateYield = (componentId: string, patch: Partial<{ yieldPercent: number; confidence: CostConfidence; runs: number; yieldSpread: number }>) => setYieldEvidence((current) => ({ ...current, [componentId]: { ...current[componentId], ...patch } }));
  const updateInventory = (ingredientId: string, patch: Partial<IngredientInventoryPosition>) => setInventory((current) => current.map((position) => position.ingredientId === ingredientId ? { ...position, ...patch } : position));

  return <div className="grid gap-8 xl:grid-cols-[1fr_370px]">
    <section className="space-y-6">
      <article className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-7">
        <p className="eyebrow">Locked meal demand → component demand</p><h2 className="mt-2 text-3xl font-black tracking-[-.05em]">Reverse the kitchen plan into raw purchasing demand.</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--ink-muted)]">The current rows use local demo orders. Cooked component demand is divided by measured yield before the recipe is expanded into ingredient quantities.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{demand.map((item) => <div key={item.componentId} className="rounded-2xl bg-[var(--surface-soft)] p-4"><p className="font-black">{componentMap.get(item.componentId)?.name ?? item.componentId}</p><p className="mt-1 text-sm text-[var(--ink-muted)]">{(item.totalGrams / 1000).toFixed(2)} kg cooked demand</p></div>)}</div>
      </article>

      <article className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-7">
        <p className="eyebrow">Yield evidence</p><h3 className="mt-2 text-2xl font-black">How much raw input produces the cooked demand?</h3>
        <div className="mt-5 space-y-3">{demand.map((item) => { const evidence = yieldEvidence[item.componentId]; return <div key={item.componentId} className="rounded-2xl border border-[var(--line)] bg-white p-4"><div className="grid gap-3 md:grid-cols-[1fr_140px_170px_110px]"><div><p className="font-black">{componentMap.get(item.componentId)?.name ?? item.componentId}</p><p className="text-xs text-[var(--ink-muted)]">Default 100% is demo-only until a physical batch is measured.</p></div><NumberField label="Measured yield %" value={evidence.yieldPercent} onChange={(yieldPercent) => updateYield(item.componentId, { yieldPercent })} /><ConfidenceField value={evidence.confidence} onChange={(confidence) => updateYield(item.componentId, { confidence })} /><NumberField label="Runs" value={evidence.runs} onChange={(runs) => updateYield(item.componentId, { runs })} /></div>{evidence.confidence === "validated" && <div className="mt-3 max-w-xs"><NumberField label="Yield spread %" value={evidence.yieldSpread} onChange={(yieldSpread) => updateYield(item.componentId, { yieldSpread })} /></div>}</div>; })}</div>
      </article>

      <article className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-7">
        <p className="eyebrow">Usable inventory</p><h3 className="mt-2 text-2xl font-black">Subtract what the kitchen can actually use.</h3><p className="mt-2 text-sm text-[var(--ink-muted)]">On-hand is usable product after trim/spoilage. Reservations are already spoken for. Safety stock is intentionally preserved.</p>
        <div className="mt-5 space-y-3">{result.requirements.map((requirement) => { const position = inventory.find((item) => item.ingredientId === requirement.ingredientId)!; return <div key={requirement.ingredientId} className="rounded-2xl border border-[var(--line)] bg-white p-4"><div className="grid gap-3 lg:grid-cols-[1fr_130px_130px_130px_170px]"><div><p className="font-black">{ingredientMap.get(requirement.ingredientId)?.name ?? requirement.ingredientId}</p><p className="text-xs text-[var(--ink-muted)]">Gross demand {(requirement.grossRequiredGrams / 1000).toFixed(2)} kg</p></div><KgField label="Usable on hand" grams={position.usableOnHandGrams} onChange={(usableOnHandGrams) => updateInventory(requirement.ingredientId, { usableOnHandGrams })} /><KgField label="Reserved" grams={position.reservedGrams} onChange={(reservedGrams) => updateInventory(requirement.ingredientId, { reservedGrams })} /><KgField label="Safety stock" grams={position.safetyStockGrams} onChange={(safetyStockGrams) => updateInventory(requirement.ingredientId, { safetyStockGrams })} /><ConfidenceField value={position.confidence} onChange={(confidence) => updateInventory(requirement.ingredientId, { confidence })} /></div></div>; })}</div>
      </article>
    </section>

    <aside className="h-fit rounded-[1.6rem] bg-[var(--leaf-deep)] p-6 text-white xl:sticky xl:top-6">
      <p className="text-xs font-black uppercase tracking-[.16em] text-[var(--warm)]">Purchasing requirement</p><p className="mt-3 text-3xl font-black capitalize">{result.status.replaceAll("-", " ")}</p>
      <div className="mt-5 space-y-2">{result.requirements.filter((item) => item.netToBuyGrams > 0).map((item) => <div key={item.ingredientId} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3"><div><p className="text-sm font-bold">{ingredientMap.get(item.ingredientId)?.name ?? item.ingredientId}</p><p className="text-[10px] uppercase tracking-[.1em] text-white/40">after inventory + safety</p></div><p className="text-lg font-black text-[var(--warm)]">{(item.netToBuyGrams / 1000).toFixed(2)} kg</p></div>)}{result.requirements.every((item) => item.netToBuyGrams <= 0) && <p className="rounded-2xl bg-white/10 p-4 text-sm text-white/60">Current usable inventory covers the modeled demand and safety stock.</p>}</div>
      {result.errors.length > 0 && <ul className="mt-5 space-y-2 text-xs text-[#ffd8c5]">{result.errors.map((error) => <li key={error}>• {error}</li>)}</ul>}
      <div className="mt-5 rounded-2xl bg-white/10 p-4"><p className="text-xs font-black uppercase tracking-[.1em] text-white/50">Authority</p><p className="mt-2 text-sm text-white/70">{result.status === "validated-requirement" ? "Yield and inventory evidence support an exact requirement." : result.status === "planning-requirement" ? "Useful for planning only. Replace demo/one-time evidence before an actual buy." : "Exact purchasing is blocked until missing evidence is resolved."}</p></div>
      <a href="/ops/procurement" className="mt-5 block rounded-full bg-[var(--warm)] px-5 py-3 text-center text-sm font-black text-[var(--leaf-deep)]">Compare supplier packages →</a>
      <p className="mt-4 text-xs leading-5 text-white/45">No purchase order is created. Supplier selection and actual procurement remain separate actions.</p>
    </aside>
  </div>;
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) { return <label><span className="field-label">{label}</span><input className="field-control" type="number" min="0" step="0.01" value={value} onChange={(e) => onChange(Number(e.target.value))} /></label>; }
function KgField({ label, grams, onChange }: { label: string; grams: number; onChange: (grams: number) => void }) { return <NumberField label={`${label} (kg)`} value={grams / 1000} onChange={(kg) => onChange(Math.round(kg * 1000))} />; }
function ConfidenceField({ value, onChange }: { value: CostConfidence; onChange: (value: CostConfidence) => void }) { return <label><span className="field-label">Evidence</span><select className="field-control" value={value} onChange={(e) => onChange(e.target.value as CostConfidence)}>{confidenceOptions.map((option) => <option key={option} value={option}>{option.replace("-", " ")}</option>)}</select></label>; }
