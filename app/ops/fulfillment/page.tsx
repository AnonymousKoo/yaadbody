import type { Metadata } from "next";
import Link from "next/link";
import { FulfillmentManifestWorkbench } from "@/components/fulfillment-manifest-workbench";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Fulfillment Manifests" };

export default function FulfillmentPage() {
  return <><SiteHeader /><main className="mx-auto max-w-[var(--page-width)] px-5 py-10 lg:px-8 lg:py-14">
    <div className="flex flex-wrap items-end justify-between gap-5"><div className="max-w-3xl"><p className="eyebrow">Internal · fulfillment handoff</p><h1 className="mt-3 text-5xl font-black tracking-[-.065em]">Reconcile every packed meal before it leaves the kitchen.</h1><p className="mt-4 text-lg leading-8 text-[var(--ink-muted)]">Assign traceable units back to locked orders, catch shortages and overages, and create pickup/delivery manifests without exposing customer PII in the kitchen workflow.</p></div><div className="flex gap-2"><Link href="/ops/packing" className="rounded-full border border-[var(--line)] bg-white px-5 py-2.5 text-sm font-black">Packing</Link><Link href="/ops" className="rounded-full border border-[var(--line)] bg-white px-5 py-2.5 text-sm font-black">Kitchen board</Link></div></div>
    <div className="mt-10"><FulfillmentManifestWorkbench /></div>
  </main></>;
}
