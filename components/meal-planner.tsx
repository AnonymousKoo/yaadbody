"use client";

import Image from "next/image";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { calculateMealSnapshot } from "@/lib/domain/calculations";
import { validateMealPrepOrderDraft } from "@/lib/domain/orders";
import type { Allergen, FulfillmentMethod, MealPrepOrderDraft, PortionSize } from "@/lib/domain/types";
import { components, ingredients, meals, plans, weeklyMenu } from "@/fixtures/demo";

const portionCopy: Record<PortionSize, string> = {
  lean: "Lighter portion",
  balanced: "Everyday balance",
  build: "More fuel",
};

const mealImageById: Record<string, string> = {
  "yaad-jerk-chicken": "/food/yaad-jerk-chicken.jpg",
  "island-curry-chicken": "/food/island-curry-chicken.jpg",
  "garlic-shrimp-bowl": "/food/garlic-shrimp-bowl.jpg",
  "beef-sweet-potato": "/food/beef-sweet-potato.jpg",
  "escovitch-cod-plate": "/food/escovitch-cod-plate.jpg",
};

const mealCopyById: Record<string, { name: string; description: string }> = {
  "island-curry-chicken": {
    name: "Jamaican Curry Chicken",
    description: "Rich Jamaican curry chicken served with classic island-style sides.",
  },
};

function mealCopy(meal: (typeof meals)[number]) {
  return mealCopyById[meal.id] ?? meal;
}

export function MealPlanner() {
  const searchParams = useSearchParams();
  const requestedPlan = searchParams.get("plan");
  const requestedPortion = searchParams.get("portion");
  const requestedFulfillment = searchParams.get("fulfillment");
  const allergenFilters = (searchParams.get("allergens")?.split(",").filter(Boolean) ?? []) as Allergen[];
  const excludedProteinIds = searchParams.get("excludeProteins")?.split(",").filter(Boolean) ?? [];
  const initialPlanId = plans.some((item) => item.id === requestedPlan) ? requestedPlan! : "plan-10";
  const initialPortion = (["lean", "balanced", "build"] as string[]).includes(requestedPortion ?? "") ? requestedPortion as PortionSize : "balanced";
  const initialFulfillment = (["pickup", "delivery"] as string[]).includes(requestedFulfillment ?? "") ? requestedFulfillment as FulfillmentMethod : "pickup";
  const [planId, setPlanId] = useState(initialPlanId);
  const [portionSize, setPortionSize] = useState<PortionSize>(initialPortion);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>(initialFulfillment);
  const [reviewing, setReviewing] = useState(false);
  const plan = plans.find((item) => item.id === planId) ?? plans[1];
  const selectedCount = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const remaining = plan.mealCount - selectedCount;

  const menu = weeklyMenu
    .map((item) => ({ item, meal: meals.find((meal) => meal.id === item.mealId)! }))
    .filter(({ meal }) => {
      if (excludedProteinIds.includes(meal.proteinComponentId)) return false;
      if (allergenFilters.length === 0) return true;
      const snapshot = calculateMealSnapshot(meal, portionSize, components, ingredients);
      return !snapshot.allergens.some((allergen) => allergenFilters.includes(allergen));
    });

  const changeCount = (menuItemId: string, delta: number) => {
    setCounts((current) => {
      const next = Math.max(0, (current[menuItemId] ?? 0) + delta);
      setReviewing(false);
      if (delta > 0 && selectedCount >= plan.mealCount) return current;
      return { ...current, [menuItemId]: next };
    });
  };

  const draft: MealPrepOrderDraft = {
    id: "prototype-draft",
    status: "draft",
    planId,
    fulfillmentMethod,
    customerAllergenFilters: allergenFilters,
    selections: menu
      .filter(({ item }) => (counts[item.id] ?? 0) > 0)
      .map(({ item }) => ({ menuItemId: item.id, portionSize, quantity: counts[item.id] })),
  };
  const draftValidation = validateMealPrepOrderDraft(draft, plans, weeklyMenu);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_330px]">
      <div>
        <div className="grid gap-3 sm:grid-cols-4">
          {plans.map((option) => (
            <button
              key={option.id}
              onClick={() => { setPlanId(option.id); setCounts({}); setReviewing(false); }}
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
              onClick={() => { setPortionSize(size); setReviewing(false); }}
              className={`rounded-full border px-4 py-2 text-sm font-bold capitalize ${portionSize === size ? "border-[var(--leaf-deep)] bg-[var(--leaf-deep)] text-white" : "border-[var(--line)] bg-white"}`}
            >
              {size} · {portionCopy[size]}
            </button>
          ))}
        </div>

        {(requestedFulfillment || allergenFilters.length > 0 || excludedProteinIds.length > 0) && <div className="mt-7 rounded-2xl border border-[var(--line)] bg-white p-4 text-sm"><span className="font-black">From your intake:</span><span className="ml-2 capitalize">{fulfillmentMethod}</span>{excludedProteinIds.length > 0 && <span className="ml-2 text-[var(--ink-muted)]">· {excludedProteinIds.length} protein exclusion(s)</span>}{allergenFilters.length > 0 && <span className="ml-2 text-[var(--ink-muted)]">· hiding recipes listing {allergenFilters.join(", ")}</span>}<p className="mt-1 text-xs text-[var(--ink-muted)]">Displayed-recipe filtering is not a cross-contact guarantee.</p></div>}

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {menu.map(({ item, meal }) => {
            const count = counts[item.id] ?? 0;
            const copy = mealCopy(meal);
            return (
              <article key={item.id} className="overflow-hidden rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] shadow-[0_20px_55px_rgba(60,45,25,.07)]">
                <div className="relative min-h-56 overflow-hidden text-white">
                  <Image src={mealImageById[meal.id]} alt={`Illustrative ${copy.name} presentation`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <span className="rounded-full border border-white/20 bg-black/30 px-3 py-1 text-[10px] font-black uppercase tracking-[.16em] backdrop-blur-sm">{meal.core ? "Core favorite" : "Rotating"}</span>
                    <p className="mt-4 text-3xl font-black tracking-[-.05em] drop-shadow-md">{copy.name}</p>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm leading-6 text-[var(--ink-muted)]">{copy.description}</p>
                  <div className="mt-5 rounded-2xl bg-[var(--surface-soft)] p-3 text-sm font-bold text-[var(--ink-muted)]">
                    Choose the portion that fits your week.
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[.12em] text-[var(--ink-muted)]">Portion</p>
                      <p className="font-black capitalize">{portionSize}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button aria-label={`Remove ${copy.name}`} onClick={() => changeCount(item.id, -1)} className="grid h-9 w-9 place-items-center rounded-full border border-[var(--line)] bg-white font-black">−</button>
                      <span className="w-6 text-center font-black">{count}</span>
                      <button aria-label={`Add ${copy.name}`} onClick={() => changeCount(item.id, 1)} className="grid h-9 w-9 place-items-center rounded-full bg-[var(--brand)] font-black text-white">+</button>
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
              <span className="text-white/70">{mealCopy(meal).name}</span>
              <span className="font-black">× {counts[item.id]}</span>
            </div>
          ))}
          {selectedCount === 0 && <p className="text-sm text-white/55">Add meals to build your weekly plan.</p>}
        </div>
        <div className="mt-6 border-t border-white/15 pt-5">
          <p className="text-xs font-black uppercase tracking-[.14em] text-white/50">Fulfillment</p>
          <div className="mt-3 grid grid-cols-2 gap-2">{(["pickup", "delivery"] as FulfillmentMethod[]).map((method) => <button key={method} onClick={() => { setFulfillmentMethod(method); setReviewing(false); }} className={`rounded-full px-3 py-2 text-sm font-black capitalize ${fulfillmentMethod === method ? "bg-white text-[var(--leaf-deep)]" : "border border-white/20 text-white/70"}`}>{method}</button>)}</div>
        </div>
        <button onClick={() => setReviewing(true)} disabled={remaining !== 0} className="mt-6 w-full rounded-full bg-[var(--warm)] px-5 py-3 font-black text-[var(--leaf-deep)] disabled:cursor-not-allowed disabled:opacity-35">
          {remaining === 0 ? "Review my week" : `Choose ${remaining} more`}
        </button>
        {reviewing && <div className="mt-5 rounded-2xl bg-white/10 p-4">
          <p className="font-black text-[var(--warm)]">{draftValidation.valid ? "Your week is ready to review" : "Check your selections"}</p>
          <p className="mt-2 text-sm text-white/65">{plan.mealCount} meals · <span className="capitalize">{portionSize}</span> · <span className="capitalize">{fulfillmentMethod}</span></p>
          {draftValidation.errors.length > 0 && <ul className="mt-3 space-y-1 text-xs text-[#ffd8c5]">{draftValidation.errors.map((error) => <li key={error}>• {error}</li>)}</ul>}
          {draftValidation.valid && <p className="mt-3 text-xs leading-5 text-white/50">Review your meal count, portion, and fulfillment choice before finalizing your order with YaadBody.</p>}
        </div>}

      </aside>
    </div>
  );
}
