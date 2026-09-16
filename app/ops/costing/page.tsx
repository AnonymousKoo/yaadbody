import type { Metadata } from "next";
import Link from "next/link";
import { MealCostingWorkbench } from "@/components/meal-costing-workbench";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Meal Costing & Pricing" };

export default function MealCostingPage() {
  return <><SiteHeader /><main className="mx-auto max-w-[var(--page-width)] px-5 py-10 lg:px-8 lg:py-14">
    <div className="flex flex-wrap items-end justify-between gap-5"><div className="max-w-3xl"><p className="eyebrow">Internal · unit economics</p><h1 className="mt-3 text-5xl font-black tracking-[-.065em]">Know the cost. Then protect the price.</h1><p className="mt-4 text-lg leading-8 text-[var(--ink-muted)]">Layer validated cooked-component cost, packaging, waste, labor, fulfillment, fees, and overhead — then calculate a target-margin price floor. Neither cost nor price is treated as production truth until its evidence is complete.</p></div><div className="flex gap-2"><Link href="/ops/recipes" className="rounded-full border border-[var(--line)] bg-white px-5 py-2.5 text-sm font-black">Recipe evidence</Link><Link href="/ops" className="rounded-full border border-[var(--line)] bg-white px-5 py-2.5 text-sm font-black">Kitchen board</Link></div></div>
    <div className="mt-10"><MealCostingWorkbench /></div>
  </main></>;
}
