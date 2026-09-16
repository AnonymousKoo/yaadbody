import type { Metadata } from "next";
import Link from "next/link";
import { RecipeValidationWorkspace } from "@/components/recipe-validation-workspace";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Recipe Validation" };

export default function RecipeValidationPage() {
  return <><SiteHeader /><main className="mx-auto max-w-[var(--page-width)] px-5 py-10 lg:px-8 lg:py-14">
    <div className="flex flex-wrap items-end justify-between gap-5"><div className="max-w-3xl"><p className="eyebrow">Internal · physical validation</p><h1 className="mt-3 text-5xl font-black tracking-[-.065em]">Turn a cooked batch into evidence.</h1><p className="mt-4 text-lg leading-8 text-[var(--ink-muted)]">Recipe math becomes trustworthy only after YaadBody measures actual input, cooked output, and batch cost. This is the bridge between the kitchen and the operating model.</p></div><Link href="/ops" className="rounded-full border border-[var(--line)] bg-white px-5 py-2.5 text-sm font-black">← Kitchen board</Link></div>
    <div className="mt-10"><RecipeValidationWorkspace /></div>
  </main></>;
}
