import type { Metadata } from "next";
import Link from "next/link";
import { PackingLabelWorkbench } from "@/components/packing-label-workbench";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Packing & Labels" };

export default function PackingPage() {
  return <><SiteHeader /><main className="mx-auto max-w-[var(--page-width)] px-5 py-10 lg:px-8 lg:py-14">
    <div className="flex flex-wrap items-end justify-between gap-5"><div className="max-w-3xl"><p className="eyebrow">Internal · packing & traceability</p><h1 className="mt-3 text-5xl font-black tracking-[-.065em]">Turn locked orders into traceable packed meals.</h1><p className="mt-4 text-lg leading-8 text-[var(--ink-muted)]">Packing tasks come directly from locked demand. Each unit receives a batch trace code, ingredient/allergen record, packed/use-by dates, and nutrition data — while production readiness stays blocked until the evidence gates are satisfied.</p></div><div className="flex gap-2"><Link href="/ops/purchasing" className="rounded-full border border-[var(--line)] bg-white px-5 py-2.5 text-sm font-black">Purchasing</Link><Link href="/ops" className="rounded-full border border-[var(--line)] bg-white px-5 py-2.5 text-sm font-black">Kitchen board</Link></div></div>
    <div className="mt-10"><PackingLabelWorkbench /></div>
  </main></>;
}
