import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SupplierComparisonWorkbench } from "@/components/supplier-comparison-workbench";

export const metadata: Metadata = { title: "Procurement Comparison" };

export default function ProcurementPage() {
  return <><SiteHeader /><main className="mx-auto max-w-[var(--page-width)] px-5 py-10 lg:px-8 lg:py-14">
    <div className="flex flex-wrap items-end justify-between gap-5"><div className="max-w-3xl"><p className="eyebrow">Internal · procurement intelligence</p><h1 className="mt-3 text-5xl font-black tracking-[-.065em]">Buy the best usable product, not the cheapest sticker.</h1><p className="mt-4 text-lg leading-8 text-[var(--ink-muted)]">Normalize supplier packages by usable yield, landed cost, quality approval, availability, and whole-package demand. Demo rows below are placeholders until real quotes or receipts are entered.</p></div><div className="flex gap-2"><Link href="/ops/costing" className="rounded-full border border-[var(--line)] bg-white px-5 py-2.5 text-sm font-black">Meal costing</Link><Link href="/ops" className="rounded-full border border-[var(--line)] bg-white px-5 py-2.5 text-sm font-black">Kitchen board</Link></div></div>
    <div className="mt-10"><SupplierComparisonWorkbench /></div>
  </main></>;
}
