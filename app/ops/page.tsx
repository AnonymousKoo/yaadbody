import type { Metadata } from "next";
import Link from "next/link";
import { calculateWasteSummary } from "@/lib/domain/calculations";
import { aggregateMealPrepDemand } from "@/lib/domain/production";
import { components, demoOrders, meals, wasteEntries, weeklyMenu } from "@/fixtures/demo";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Operations Prototype" };

export default function OpsPage() {
  const demand = aggregateMealPrepDemand(demoOrders, weeklyMenu, meals);
  const waste = calculateWasteSummary(wasteEntries, 25_000);
  const componentMap = new Map(components.map((component) => [component.id, component]));
  const mealCount = demoOrders.flatMap((order) => order.selections).reduce((sum, selection) => sum + selection.quantity, 0);

  return <><SiteHeader /><main className="mx-auto max-w-[var(--page-width)] px-5 py-10 lg:px-8">
    <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">Internal prototype</p><h1 className="mt-3 text-4xl font-black tracking-[-.06em] sm:text-5xl">Kitchen control board</h1><p className="mt-3 text-[var(--ink-muted)]">Demo demand, waste, and production signals. No production data is connected.</p></div><div className="flex flex-wrap items-center gap-3"><Link href="/ops/recipes" className="rounded-full bg-[var(--leaf-deep)] px-4 py-2 text-xs font-black uppercase tracking-[.12em] text-white">Validate a batch</Link><span className="rounded-full bg-[#fff0e8] px-4 py-2 text-xs font-black uppercase tracking-[.12em] text-[var(--brand-deep)]">Local fixture data</span></div></div>
    <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Locked meals" value={mealCount.toString()} detail="Across demo orders" /><Metric label="Waste" value={`$${(waste.totalWasteCents / 100).toFixed(2)}`} detail={`${waste.wasteRatePercent}% of demo food spend`} /><Metric label="Avoidable waste" value={`$${(waste.avoidableWasteCents / 100).toFixed(2)}`} detail="Production overage" /><Metric label="Menu items" value={weeklyMenu.length.toString()} detail="Core + rotating" /></section>
    <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
      <article className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] p-6"><div className="flex items-center justify-between"><div><p className="eyebrow">Production demand</p><h2 className="mt-2 text-2xl font-black tracking-[-.04em]">Batch first. Individualize at packing.</h2></div></div><div className="mt-6 divide-y divide-[var(--line)]">{demand.map((item) => <div key={item.componentId} className="flex items-center justify-between py-4"><div><p className="font-black">{componentMap.get(item.componentId)?.name ?? item.componentId}</p><p className="text-sm text-[var(--ink-muted)]">{componentMap.get(item.componentId)?.category}</p></div><p className="text-xl font-black">{(item.totalGrams / 1000).toFixed(2)} kg</p></div>)}</div></article>
      <article className="rounded-[1.6rem] bg-[var(--leaf-deep)] p-6 text-white"><p className="text-xs font-black uppercase tracking-[.16em] text-[var(--warm)]">Operating loop</p><ol className="mt-6 space-y-4">{["Orders lock", "Aggregate component demand", "Subtract usable inventory", "Generate purchasing requirements", "Batch cook", "Pack + label", "Record yield + waste", "Review actual margin"].map((step, index) => <li key={step} className="flex gap-4"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/20 text-[10px] font-black">{index + 1}</span><span className="text-white/75">{step}</span></li>)}</ol></article>
    </section>
  <div className="mt-8 flex flex-wrap justify-end gap-2"><Link href="/ops/recipes" className="rounded-full bg-[var(--leaf-deep)] px-5 py-3 text-sm font-black text-white">Open recipe validation →</Link><Link href="/ops/costing" className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-black">Open costing + pricing →</Link><Link href="/ops/purchasing" className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-black">Build purchasing requirements →</Link><Link href="/ops/procurement" className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-black">Compare suppliers →</Link></div></main></>;
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) { return <article className="rounded-[1.4rem] border border-[var(--line)] bg-[var(--surface)] p-5"><p className="text-xs font-black uppercase tracking-[.12em] text-[var(--ink-muted)]">{label}</p><p className="mt-3 text-3xl font-black tracking-[-.05em]">{value}</p><p className="mt-2 text-sm text-[var(--ink-muted)]">{detail}</p></article>; }
