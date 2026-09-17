"use client";

import Link from "next/link";
import { useState } from "react";
import { components, ingredients, meals, plans, weeklyMenu } from "@/fixtures/demo";
import { eligibleMenuForIntake, recommendMealPlan } from "@/lib/domain/recommendations";
import type { Allergen, CustomerGoal, CustomerMealIntake, FulfillmentMethod, MealCount } from "@/lib/domain/types";

const goals: Array<{ id: CustomerGoal; label: string; copy: string }> = [
  { id: "fat-loss", label: "Lose body fat", copy: "Start with the lighter standardized portion." },
  { id: "healthy-eating", label: "Eat healthier", copy: "Use the everyday balanced portion." },
  { id: "maintain", label: "Maintain", copy: "Keep portions steady and predictable." },
  { id: "muscle", label: "Build muscle", copy: "Start with the higher-fuel Build portion." },
  { id: "save-time", label: "Save time", copy: "Let the weekly meal count do the heavy lifting." },
];

const cuisines: Array<{ id: CustomerMealIntake["preferredCuisines"][number]; label: string }> = [
  { id: "jamaican", label: "Jamaican" }, { id: "caribbean", label: "Caribbean" },
  { id: "american", label: "American" }, { id: "mediterranean", label: "Mediterranean" },
  { id: "latin", label: "Latin" }, { id: "asian", label: "Asian" },
];

const allergenOptions: Array<{ id: Allergen; label: string }> = [
  { id: "milk", label: "Milk" }, { id: "egg", label: "Egg" }, { id: "fish", label: "Fish" },
  { id: "crustacean-shellfish", label: "Shellfish" }, { id: "tree-nuts", label: "Tree nuts" },
  { id: "peanuts", label: "Peanuts" }, { id: "wheat", label: "Wheat" }, { id: "soy", label: "Soy" },
  { id: "sesame", label: "Sesame" },
];

export function MealOnboarding() {
  const [goal, setGoal] = useState<CustomerGoal>("healthy-eating");
  const [desiredMealCount, setDesiredMealCount] = useState<MealCount>(10);
  const [preferredCuisines, setPreferredCuisines] = useState<CustomerMealIntake["preferredCuisines"]>([]);
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [dislikedProteinComponentIds, setDislikedProteinComponentIds] = useState<string[]>([]);
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>("pickup");

  const intake: CustomerMealIntake = { goal, desiredMealCount, preferredCuisines, allergens, dislikedProteinComponentIds, fulfillmentMethod };
  const recommendation = recommendMealPlan(intake, plans);
  const eligible = eligibleMenuForIntake(intake, weeklyMenu, meals, components, ingredients);
  const query = new URLSearchParams({ plan: recommendation.plan.id, portion: recommendation.portionSize, fulfillment: fulfillmentMethod });
  if (allergens.length) query.set("allergens", allergens.join(","));
  if (dislikedProteinComponentIds.length) query.set("excludeProteins", dislikedProteinComponentIds.join(","));

  const toggleCuisine = (id: CustomerMealIntake["preferredCuisines"][number]) => setPreferredCuisines((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const toggleAllergen = (id: Allergen) => setAllergens((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const toggleProtein = (id: string) => setDislikedProteinComponentIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  return <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
    <div className="space-y-8">
      <Question title="1. What do you want from your meals?">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{goals.map((option) => <button key={option.id} onClick={() => setGoal(option.id)} className={`rounded-2xl border p-4 text-left ${goal === option.id ? "border-[var(--brand)] bg-[#fff0e8]" : "border-[var(--line)] bg-white"}`}><span className="font-black">{option.label}</span><span className="mt-1 block text-sm text-[var(--ink-muted)]">{option.copy}</span></button>)}</div>
      </Question>
      <Question title="2. How much of the week should YaadBody handle?">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{plans.map((plan) => <button key={plan.id} onClick={() => setDesiredMealCount(plan.mealCount)} className={`rounded-2xl border p-4 ${desiredMealCount === plan.mealCount ? "border-[var(--leaf-deep)] bg-[var(--leaf-deep)] text-white" : "border-[var(--line)] bg-white"}`}><span className="block text-2xl font-black">{plan.mealCount}</span><span className="text-xs font-bold uppercase tracking-[.1em]">meals</span></button>)}</div>
      </Question>
      <Question title="3. What flavors do you usually reach for?" optional>
        <div className="flex flex-wrap gap-2">{cuisines.map((option) => <Toggle key={option.id} active={preferredCuisines.includes(option.id)} onClick={() => toggleCuisine(option.id)}>{option.label}</Toggle>)}</div>
      </Question>
      <Question title="4. Anything you do not want as your main protein?" optional>
        <div className="flex flex-wrap gap-2">{components.filter((component) => component.category === "protein").map((component) => <Toggle key={component.id} active={dislikedProteinComponentIds.includes(component.id)} onClick={() => toggleProtein(component.id)}>{component.name}</Toggle>)}</div>
      </Question>
      <Question title="5. Any major allergens we should filter from the displayed recipes?" optional>
        <div className="flex flex-wrap gap-2">{allergenOptions.map((option) => <Toggle key={option.id} active={allergens.includes(option.id)} onClick={() => toggleAllergen(option.id)}>{option.label}</Toggle>)}</div>
        <p className="mt-3 text-xs leading-5 text-[var(--ink-muted)]">Prototype filter only. This does not establish an allergen-free kitchen or cross-contact guarantee.</p>
      </Question>
      <Question title="6. How do you want to receive the meals?">
        <div className="grid gap-3 sm:grid-cols-2">{(["pickup", "delivery"] as FulfillmentMethod[]).map((method) => <button key={method} onClick={() => setFulfillmentMethod(method)} className={`rounded-2xl border p-5 text-left capitalize ${fulfillmentMethod === method ? "border-[var(--brand)] bg-[#fff0e8]" : "border-[var(--line)] bg-white"}`}><span className="font-black">{method}</span><span className="mt-1 block text-sm text-[var(--ink-muted)]">{method === "pickup" ? "Collect from an approved YaadBody pickup point." : "Delivery area and route pricing will be validated before launch."}</span></button>)}</div>
      </Question>
    </div>
    <aside className="h-fit rounded-[1.7rem] bg-[var(--leaf-deep)] p-6 text-white lg:sticky lg:top-6">
      <p className="text-xs font-black uppercase tracking-[.16em] text-[var(--warm)]">Your starting recommendation</p>
      <p className="mt-4 text-4xl font-black tracking-[-.055em]">{recommendation.plan.mealCount} {recommendation.portionSize}</p>
      <p className="mt-3 text-sm leading-6 text-white/70">{recommendation.reason}</p>
      <dl className="mt-6 space-y-3 border-t border-white/15 pt-5 text-sm"><Row label="Fulfillment" value={fulfillmentMethod} /><Row label="Displayed menu options" value={`${eligible.length}`} /><Row label="Protein exclusions" value={dislikedProteinComponentIds.length ? `${dislikedProteinComponentIds.length}` : "None"} /><Row label="Listed allergen filters" value={allergens.length ? `${allergens.length}` : "None"} /></dl>
      <Link href={`/menu?${query.toString()}`} className="mt-7 block rounded-full bg-[var(--warm)] px-5 py-3 text-center font-black text-[var(--leaf-deep)]">See my weekly menu</Link>
      <p className="mt-4 text-xs leading-5 text-white/45">This is a meal-plan recommendation, not individualized medical or dietetic advice.</p>
    </aside>
  </div>;
}

function Question({ title, optional, children }: { title: string; optional?: boolean; children: React.ReactNode }) { return <section className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] p-6"><div className="mb-5 flex items-center gap-3"><h2 className="text-xl font-black tracking-[-.03em]">{title}</h2>{optional && <span className="rounded-full bg-[var(--surface-soft)] px-2 py-1 text-[10px] font-black uppercase tracking-[.1em] text-[var(--ink-muted)]">Optional</span>}</div>{children}</section>; }
function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) { return <button onClick={onClick} className={`rounded-full border px-4 py-2 text-sm font-bold ${active ? "border-[var(--leaf-deep)] bg-[var(--leaf-deep)] text-white" : "border-[var(--line)] bg-white"}`}>{children}</button>; }
function Row({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between gap-4"><dt className="text-white/55">{label}</dt><dd className="font-black capitalize">{value}</dd></div>; }
