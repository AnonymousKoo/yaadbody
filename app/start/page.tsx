import type { Metadata } from "next";
import { MealOnboarding } from "@/components/meal-onboarding";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Find My Meal Plan" };

export default function StartPage() {
  return <><SiteHeader /><main className="mx-auto max-w-[var(--page-width)] px-5 py-12 lg:px-8 lg:py-16">
    <div className="max-w-3xl"><p className="eyebrow">Tell us what matters</p><h1 className="text-balance mt-4 text-5xl font-black tracking-[-.065em] sm:text-6xl">We standardize the food. You choose the outcome.</h1><p className="mt-5 text-lg leading-8 text-[var(--ink-muted)]">A short intake recommends a starting plan and portion without turning every customer into a custom kitchen order.</p></div>
    <div className="mt-10"><MealOnboarding /></div>
  </main><SiteFooter /></>;
}
