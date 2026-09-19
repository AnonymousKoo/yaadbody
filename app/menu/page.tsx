import type { Metadata } from "next";
import { Suspense } from "react";
import { MealPlanner } from "@/components/meal-planner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Weekly Menu" };

export default function MenuPage() {
  return <><SiteHeader /><main className="mx-auto max-w-[var(--page-width)] px-5 py-12 lg:px-8 lg:py-16">
    <div className="max-w-3xl"><p className="eyebrow">This week&apos;s menu</p><h1 className="text-balance mt-4 text-5xl font-black tracking-[-.065em] sm:text-6xl">Tell us how much of the week you want handled.</h1><p className="mt-5 text-lg leading-8 text-[var(--ink-muted)]">Choose a plan, choose a portion, then fill your week with the meals that fit you best.</p></div>
    <div className="mt-10"><Suspense fallback={<div className="rounded-2xl border border-[var(--line)] bg-white p-6">Loading weekly menu…</div>}><MealPlanner /></Suspense></div>
  </main><SiteFooter /></>;
}
