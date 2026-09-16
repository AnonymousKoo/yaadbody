"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { calculateMealSnapshot } from "@/lib/domain/calculations";
import type { Allergen, FulfillmentMethod, PortionSize } from "@/lib/domain/types";
import { components, ingredients, meals, plans, weeklyMenu } from "@/fixtures/demo";

const portionCopy: Record<PortionSize, string> = {
  lean: "Lighter portion",
  balanced: "Everyday balance",
  build: "More fuel",
};

export function MealPlanner() {
  const searchParams = useSearchParams();
  const requestedPlan = searchParams.get("plan");
  const requestedPortion = searchParams.get("portion");
  const requestedFulfillment = searchParams.get("fulfillment");
  const allergenFilters = (searchParams.get("allergens")?.split(",").filter(Boolean) ?? []) as Allergen[];
  const initialPlanId = plans.some((item) => item.id === requestedPlan) ? requestedPlan! : "plan-10";
  const initialPortion = (["lean", "balanced", "build"] as string[]).includes(requestedPortion ?? "") ? requestedPortion as PortionSize : "balanced";
  const fulfillment = (["pickup", "delivery"] as string[]).includes(requestedFulfillment ?? "") ? requestedFulfillment as FulfillmentMethod : undefined;
  const [planId, setPlanId] = useState(initialPlanId);
  const [portionSize, setPortionSize] = useState<PortionSize>(initialPortion);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const plan = plans.find((item) => item.id === planId) ?? plans[1];
  const selectedCount = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const remaining = plan.mealCount - selectedCount;

  const menu = weeklyMenu
    .map((item) => ({ item, meal: meals.find((meal) => meal.id === item.mealId)! }))
    .filter(({ meal }) => {
      if (allergenFilters.length === 0) return true;
      const snapshot = calculateMealSnapshot(meal, portionSize, components, ingredients);
      return !snapshot.allergens.some((allergen) => allergenFilters.includes(allergen));
    });

  const changeCount = (menuItemId: string, delta: number) => {
    setCounts((current) => {
      const next = Math.max(0, (current[menuItemId] ?? 0) + delta);
      if (delta > 0 && selectedCount >= plan.mealCount) return current;
      return { ...current, [menuItemId]: next };
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_330px]">
      <div>
        <div className="grid gap-3 sm:grid-cols-4">
          {plans.map((option) => (
            <button
              key={option.id}
              onClick={() => { setPlanId(option.id); setCounts({}); }}
              className={`rounded-2xl border px-4 py-4 text-left transition ${planId === option.id ? "border-[var(--brand)] bg-[#fff0e8]" : "border-[var(--line)] bg-[var(--surface)] hover:border-[#c5b9a8]"}`}
            >
              <span className="block text-2xl font-black">{option.mealCount}</span>
              <span className="text-xs font-bold uppercase tracking-[.12em] text-[var(--ink-muted)]">meals / week</span>
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span className="eyebrow">Portion</span>
          {(["lean", "balanced", "build"] as PortionSize[]).map((size) => (
            <button
              key={size}
              onClick={() => setPortionSize(size)}
              className={`rounded-full border px-4 py-2 text-sm font-bold capitalize ${portionSize === size ? "border-[var(--leaf-deep)] bg-[var(--leaf-deep)] text-white" : "border-[var(--line)] bg-white"}`}
            >
              {size} · {portionCopy[size]}
            </button>
          ))}
        </div>

        {(fulfillment || allergenFilters.length > 0) && <div className="mt-7 rounded-2xl border border-[var(--line)] bg-white p-4 text-sm"><span className="font-black">From your intake:</span>{fulfillment && <span className="ml-2 capitalize">{fulfillment}</span>}{allergenFilters.length > 0 && <span className="ml-2 text-[var(--ink-muted)]">· hiding recipes listing {allergenFilters.join(", ")}</span>}<p className="mt-1 text-xs text-[var(--ink-muted)]">Displayed-recipe filtering is not a cross-contact guarantee.</p></div>}

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {menu.map(({ item, meal }) => {
            const snapshot = calculateMealSnapshot(meal, portionSize, components, ingredients);
            const count = counts[item.id] ?? 0;
            return (
              <article key={item.id} className="overflow-hidden rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] shadow-[0_20px_55px_rgba(60,45,25,.07)]">
                <div className="relative grid min-h-44 place-items-center bg-[linear-gradient(135deg,#253d2d,#e46d31)] p-6 text-white">
                  <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_25%_25%,white_0,transparent_28%),radial-gradient(circle_at_75%_65%,#ffd791_0,transparent_30%)]" />
                  <div className="relative text-center">
                    <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-[.16em]">{meal.core ? "Core favorite" : "Rotating"}</span>
                    <p className="mt-4 text-3xl font-black tracking-[-.05em]">{meal.name}</p>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm leading-6 text-[var(--ink-muted)]">{meal.description}</p>
                  <div className="mt-5 grid grid-cols-4 gap-2 rounded-2xl bg-[var(--surface-soft)] p-3 text-center">
                    <Macro label="Cal" value={snapshot.macros.calories} />
                    <Macro label="Protein" value={`${Math.round(snapshot.macros.proteinGrams)}g`} />
                    <Macro label="Carbs" value={`${Math.round(snapshot.macros.carbGrams)}g`} />
                    <Macro label="Fat" value={`${Math.round(snapshot.macros.fatGrams)}g`} />
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[.12em] text-[var(--ink-muted)]">Demo food cost</p>
                      <p className="font-black">${(snapshot.estimatedFoodCostCents / 100).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button aria-label={`Remove ${meal.name}`} onClick={() => changeCount(item.id, -1)} className="grid h-9 w-9 place-items-center rounded-full border border-[var(--line)] bg-white font-black">−</button>
                      <span className="w-6 text-center font-black">{count}</span>
                      <button aria-label={`Add ${meal.name}`} onClick={() => changeCount(item.id, 1)} className="grid h-9 w-9 place-items-center rounded-full bg-[var(--brand)] font-black text-white">+</button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <aside className="h-fit rounded-[1.6rem] bg-[var(--leaf-deep)] p-6 text-white lg:sticky lg:top-6">
        <p className="text-xs font-black uppercase tracking-[.16em] text-[var(--warm)]">Your week</p>
        <div className="mt-4 flex items-end justify-between">
          <p className="text-4xl font-black tracking-[-.06em]">{selectedCount}/{plan.mealCount}</p>
          <p className="text-sm text-white/60">{remaining > 0 ? `${remaining} left` : "Plan filled"}</p>
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-[var(--warm)] transition-all" style={{ width: `${Math.min(100, (selectedCount / plan.mealCount) * 100)}%` }} />
        </div>
        <div className="mt-6 space-y-3 border-t border-white/15 pt-5">
          {menu.filter(({ item }) => (counts[item.id] ?? 0) > 0).map(({ item, meal }) => (
            <div key={item.id} className="flex justify-between gap-4 text-sm">
              <span className="text-white/70">{meal.name}</span>
              <span className="font-black">× {counts[item.id]}</span>
            </div>
          ))}
          {selectedCount === 0 && <p className="text-sm text-white/55">Add meals to build your weekly plan.</p>}
        </div>
        <button disabled={remaining !== 0} className="mt-7 w-full rounded-full bg-[var(--warm)] px-5 py-3 font-black text-[var(--leaf-deep)] disabled:cursor-not-allowed disabled:opacity-35">
          {remaining === 0 ? "Continue to fulfillment" : `Choose ${remaining} more`}
        </button>
        <p className="mt-4 text-xs leading-5 text-white/45">Prototype only. Checkout, Avuhz billing, customer identity, and fulfillment are intentionally not wired yet.</p>
      </aside>
    </div>
  );
}

function Macro({ label, value }: { label: string; value: string | number }) {
  return <div><p className="font-black">{value}</p><p className="text-[10px] font-bold uppercase tracking-[.08em] text-[var(--ink-muted)]">{label}</p></div>;
}
