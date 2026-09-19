import type { Metadata } from "next";
import { cateringPackages } from "@/fixtures/demo";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CateringInquiryForm } from "@/components/catering-inquiry-form";

export const metadata: Metadata = { title: "Catering" };

const flow = ["Event details", "Choose package", "Build your menu", "Review quote", "Confirm headcount", "Cook + deliver"];

export default function CateringPage() {
  return <><SiteHeader /><main>
    <section className="border-b border-[var(--line)] bg-[var(--surface)]"><div className="mx-auto max-w-[var(--page-width)] px-5 py-16 lg:px-8"><p className="eyebrow">YaadBody Catering</p><h1 className="text-balance mt-4 max-w-4xl text-5xl font-black tracking-[-.065em] sm:text-6xl">Great food for the occasion. Service that fits the moment.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--ink-muted)]">Keep it simple with drop-off, add buffet setup when you need it, or choose full service for events that call for on-site support.</p></div></section>
    <section className="mx-auto max-w-[var(--page-width)] px-5 py-14 lg:px-8"><div className="grid gap-5 lg:grid-cols-2">{cateringPackages.map((pkg) => <article key={pkg.id} className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] p-7"><p className="eyebrow">From {pkg.minimumGuests} guests</p><h2 className="mt-4 text-3xl font-black tracking-[-.05em]">{pkg.name}</h2><p className="mt-4 leading-7 text-[var(--ink-muted)]">{pkg.description}</p><div className="mt-6 grid grid-cols-2 gap-3"><Fact label="Proteins" value={pkg.proteinChoices} /><Fact label="Sides" value={pkg.sideChoices} /></div><p className="mt-6 rounded-2xl bg-[#fff0e8] p-4 text-sm font-bold text-[var(--brand-deep)]">Final pricing is based on your menu, guest count, service level, and delivery needs.</p></article>)}</div></section>
    <section className="mx-auto max-w-[var(--page-width)] px-5 pb-16 lg:px-8"><div className="mb-8 max-w-3xl"><p className="eyebrow">Start with the event</p><h2 className="mt-3 text-4xl font-black tracking-[-.055em]">Tell us what you&apos;re planning and we&apos;ll guide you to the right fit.</h2></div><CateringInquiryForm /></section>
    <section className="border-y border-[var(--line)] bg-[var(--leaf-deep)] text-white"><div className="mx-auto max-w-[var(--page-width)] px-5 py-14 lg:px-8"><p className="text-xs font-black uppercase tracking-[.16em] text-[var(--warm)]">How catering works</p><div className="mt-7 grid gap-3 md:grid-cols-3 lg:grid-cols-6">{flow.map((step, index) => <div key={step} className="rounded-2xl border border-white/15 bg-white/5 p-4"><span className="text-xs font-black text-[var(--warm)]">0{index + 1}</span><p className="mt-3 font-bold">{step}</p></div>)}</div></div></section>
  </main><SiteFooter /></>;
}

function Fact({ label, value }: { label: string; value: number }) { return <div className="rounded-2xl bg-[var(--surface-soft)] p-4"><p className="text-2xl font-black">{value}</p><p className="text-xs font-bold uppercase tracking-[.1em] text-[var(--ink-muted)]">{label}</p></div>; }
