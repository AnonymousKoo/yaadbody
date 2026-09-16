import type { Metadata } from "next";
import Link from "next/link";
import { PurchasingRequirementsWorkbench } from "@/components/purchasing-requirements-workbench";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Purchasing Requirements" };

export default function PurchasingPage() {
  return <><SiteHeader /><main className="mx-auto max-w-[var(--page-width)] px-5 py-10 lg:px-8 lg:py-14">
    <div className="flex flex-wrap items-end justify-between gap-5"><div className="max-w-3xl"><p className="eyebrow">Internal · demand & purchasing</p><h1 className="mt-3 text-5xl font-black tracking-[-.065em]">Know what to buy before anybody goes shopping.</h1><p className="mt-4 text-lg leading-8 text-[var(--ink-muted)]">Convert locked meal demand into raw ingredient requirements, account for real cooked yield, subtract usable inventory and reservations, preserve safety stock, then hand the remaining demand to supplier comparison.</p></div><div className="flex gap-2"><Link href="/ops/procurement" className="rounded-full border border-[var(--line)] bg-white px-5 py-2.5 text-sm font-black">Supplier comparison</Link><Link href="/ops/packing" className="rounded-full border border-[var(--line)] bg-white px-5 py-2.5 text-sm font-black">Packing</Link><Link href="/ops" className="rounded-full border border-[var(--line)] bg-white px-5 py-2.5 text-sm font-black">Kitchen board</Link></div></div>
    <div className="mt-10"><PurchasingRequirementsWorkbench /></div>
  </main></>;
}
