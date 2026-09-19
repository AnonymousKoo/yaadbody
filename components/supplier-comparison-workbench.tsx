"use client";

import { useMemo, useState } from "react";
import { ingredients } from "@/fixtures/demo";
import { compareSupplierOffers } from "@/lib/domain/procurement";
import type { CostConfidence, MassUnit, SupplierAvailability, SupplierOffer, SupplierQualityStatus } from "@/lib/domain/types";

const confidenceOptions: CostConfidence[] = ["demo", "measured-once", "validated"];
const qualityOptions: SupplierQualityStatus[] = ["unverified", "approved", "preferred", "rejected"];
const availabilityOptions: SupplierAvailability[] = ["in-stock", "limited", "out-of-stock"];
const massUnits: MassUnit[] = ["lb", "oz", "kg", "g"];

function makeOffer(id: string, ingredientId: string, supplierName: string, priceDollars: number, qualityStatus: SupplierQualityStatus): SupplierOffer {
  const ingredient = ingredients.find((item) => item.id === ingredientId) ?? ingredients[0];
  return {
    id,
    supplierName,
    ingredientId,
    packageQuantity: 5,
    packageUnit: "lb",
    packagePriceCents: Math.round(priceDollars * 100),
    allocatedDeliveryCostCents: 0,
    usableYieldPercent: ingredient.usableYieldPercent,
    qualityStatus,
    availability: "in-stock",
    confidence: "demo",
  };
}

export function SupplierComparisonWorkbench() {
  const [ingredientId, setIngredientId] = useState("chicken");
  const [requiredKg, setRequiredKg] = useState(8);
  const [offers, setOffers] = useState<SupplierOffer[]>([
    makeOffer("supplier-a", "chicken", "Supplier A", 18, "approved"),
    makeOffer("supplier-b", "chicken", "Supplier B", 20, "preferred"),
    makeOffer("supplier-c", "chicken", "Supplier C", 16, "unverified"),
  ]);
  const requiredUsableGrams = Math.max(0, requiredKg * 1000);
  const comparison = useMemo(() => compareSupplierOffers(offers, ingredientId, requiredUsableGrams), [offers, ingredientId, requiredUsableGrams]);

  const resetIngredient = (nextIngredientId: string) => {
    setIngredientId(nextIngredientId);
    setOffers([
      makeOffer("supplier-a", nextIngredientId, "Supplier A", 18, "approved"),
      makeOffer("supplier-b", nextIngredientId, "Supplier B", 20, "preferred"),
      makeOffer("supplier-c", nextIngredientId, "Supplier C", 16, "unverified"),
    ]);
  };

  const updateOffer = (id: string, patch: Partial<SupplierOffer>) => setOffers((current) => current.map((offer) => offer.id === id ? { ...offer, ...patch } : offer));

  return <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
    <section className="space-y-6">
      <article className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-7">
        <p className="eyebrow">Demand target</p><h2 className="mt-2 text-3xl font-black tracking-[-.05em]">Compare what you actually need to buy.</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2"><label><span className="field-label">Ingredient</span><select className="field-control" value={ingredientId} onChange={(e) => resetIngredient(e.target.value)}>{ingredients.map((ingredient) => <option key={ingredient.id} value={ingredient.id}>{ingredient.name}</option>)}</select></label><NumberField label="Required usable kg" value={requiredKg} onChange={setRequiredKg} /></div>
        <p className="mt-4 text-xs leading-5 text-[var(--ink-muted)]">Enter usable demand, not raw sticker-weight demand. The comparison converts each supplier package into expected usable product before ranking cost.</p>
      </article>

      {offers.map((offer) => {
        const result = comparison.evaluated.find((item) => item.offerId === offer.id);
        return <article key={offer.id} className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="eyebrow">Supplier offer</p><input aria-label="Supplier name" className="mt-2 border-0 bg-transparent p-0 text-2xl font-black tracking-[-.04em] outline-none" value={offer.supplierName} onChange={(e) => updateOffer(offer.id, { supplierName: e.target.value })} /></div><span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[.1em] ${result?.eligible ? "bg-[#e5f0e6] text-[var(--leaf-deep)]" : "bg-[#fff0e8] text-[var(--brand-deep)]"}`}>{result?.eligible ? "Eligible" : "Excluded"}</span></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><NumberField label="Package qty" value={offer.packageQuantity} onChange={(packageQuantity) => updateOffer(offer.id, { packageQuantity })} /><SelectField label="Unit" value={offer.packageUnit} options={massUnits} onChange={(packageUnit) => updateOffer(offer.id, { packageUnit: packageUnit as MassUnit })} /><NumberField label="Package price ($)" value={offer.packagePriceCents / 100} onChange={(value) => updateOffer(offer.id, { packagePriceCents: Math.round(value * 100) })} /><NumberField label="Allocated delivery ($)" value={offer.allocatedDeliveryCostCents / 100} onChange={(value) => updateOffer(offer.id, { allocatedDeliveryCostCents: Math.round(value * 100) })} /></div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><NumberField label="Usable yield %" value={offer.usableYieldPercent} onChange={(usableYieldPercent) => updateOffer(offer.id, { usableYieldPercent })} /><SelectField label="Quality gate" value={offer.qualityStatus} options={qualityOptions} onChange={(qualityStatus) => updateOffer(offer.id, { qualityStatus: qualityStatus as SupplierQualityStatus })} /><SelectField label="Availability" value={offer.availability} options={availabilityOptions} onChange={(availability) => updateOffer(offer.id, { availability: availability as SupplierAvailability })} /><SelectField label="Evidence" value={offer.confidence} options={confidenceOptions} onChange={(confidence) => updateOffer(offer.id, { confidence: confidence as CostConfidence })} /></div>
          {result && <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Landed / usable lb" value={`$${((result.landedCostPerUsableGramCents * 453.59237) / 100).toFixed(2)}`} /><Metric label="Packages needed" value={String(result.packagesRequired)} /><Metric label="Projected spend" value={`$${(result.projectedSpendCents / 100).toFixed(2)}`} /><Metric label="Projected overage" value={`${(result.projectedOverageGrams / 1000).toFixed(2)} kg`} /></div>}
          {result?.exclusionReason && <p className="mt-4 rounded-xl bg-[#fff0e8] p-3 text-xs font-bold text-[var(--brand-deep)]">{result.exclusionReason}</p>}
        </article>;
      })}
    </section>

    <aside className="h-fit rounded-[1.6rem] bg-[var(--leaf-deep)] p-6 text-white xl:sticky xl:top-6">
      <p className="text-xs font-black uppercase tracking-[.16em] text-[var(--warm)]">Comparison result</p>
      <p className="mt-3 text-3xl font-black capitalize">{comparison.status.replaceAll("-", " ")}</p>
      {comparison.lowestCostEligibleOffer ? <><div className="mt-5 rounded-2xl bg-white/10 p-4"><p className="text-xs font-black uppercase tracking-[.1em] text-white/50">Lowest-cost eligible offer</p><p className="mt-2 text-2xl font-black">{comparison.lowestCostEligibleOffer.supplierName}</p><p className="mt-2 text-sm text-white/65">${(comparison.lowestCostEligibleOffer.projectedSpendCents / 100).toFixed(2)} projected spend · {comparison.lowestCostEligibleOffer.packagesRequired} package(s)</p></div>{comparison.savingsVsHighestEligibleCents !== null && <div className="mt-3 rounded-2xl border border-white/10 p-4"><p className="text-xs text-white/50">Spread vs highest eligible option</p><p className="mt-1 text-xl font-black text-[var(--warm)]">${(comparison.savingsVsHighestEligibleCents / 100).toFixed(2)}</p></div>}</> : <p className="mt-5 rounded-2xl bg-white/10 p-4 text-sm text-white/65">No supplier offer currently passes both the quality and availability gates.</p>}
      <p className="mt-5 text-xs leading-5 text-white/45">“Lowest-cost eligible” is not an automatic purchase order. Demo evidence stays planning-only. Record real supplier evidence before using this for an actual buy decision.</p>
    </aside>
  </div>;
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) { return <label><span className="field-label">{label}</span><input className="field-control" type="number" min="0" step="0.01" value={value} onChange={(e) => onChange(Number(e.target.value))} /></label>; }
function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) { return <label><span className="field-label">{label}</span><select className="field-control" value={value} onChange={(e) => onChange(e.target.value)}>{options.map((option) => <option key={option} value={option}>{option.replaceAll("-", " ")}</option>)}</select></label>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-[var(--surface-soft)] p-3"><p className="text-[10px] font-black uppercase tracking-[.1em] text-[var(--ink-muted)]">{label}</p><p className="mt-1 font-black">{value}</p></div>; }
