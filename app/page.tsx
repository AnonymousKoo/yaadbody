import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const pillars = [
  ["Meal Prep", "Healthy, portioned meals with clear nutrition and a rotating weekly menu."],
  ["Catering", "Full-flavor packages for events, designed around drop-off first for speed and leverage."],
  ["Party Trays", "The easy middle ground for smaller gatherings that do not need a custom catering process."],
];

export default function Home() {
  return (
    <><SiteHeader /><main>
      <section className="overflow-hidden border-b border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto grid max-w-[var(--page-width)] gap-12 px-5 py-16 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-24">
          <div className="self-center">
            <p className="eyebrow">Fresh weekly meals · Full-flavor events</p>
            <h1 className="text-balance mt-5 max-w-3xl text-5xl font-black leading-[.95] tracking-[-.07em] sm:text-6xl lg:text-7xl">Healthy food you actually look forward to eating.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--ink-muted)]">YaadBody handles the week with macro-aware meal prep and handles the occasion with full-flavor catering — one kitchen, one operating standard.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/start" className="rounded-full bg-[var(--brand)] px-6 py-3 font-black text-white">Find my plan</Link>
              <Link href="/catering" className="rounded-full border border-[var(--line)] bg-white px-6 py-3 font-black">Plan an event</Link>
            </div>
          </div>
          <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] bg-[var(--leaf-deep)] p-7 text-white shadow-[0_30px_80px_rgba(35,40,24,.18)]">
            <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_25%_20%,#f3c36d_0,transparent_25%),radial-gradient(circle_at_70%_70%,#e56c2f_0,transparent_35%)]" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-center justify-between"><span className="rounded-full border border-white/20 px-3 py-1 text-xs font-bold">WEEKLY DROP</span><span className="text-5xl">🌿</span></div>
              <div><p className="text-sm font-bold uppercase tracking-[.16em] text-[var(--warm)]">Yaad flavor</p><p className="mt-3 text-5xl font-black tracking-[-.06em]">Built for your week.</p><p className="mt-4 max-w-md text-white/65">Standardized food. Personalized portions. Less decision fatigue.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--page-width)] px-5 py-16 lg:px-8 lg:py-24">
        <p className="eyebrow">One company, three ways to order</p>
        <h2 className="text-balance mt-4 max-w-3xl text-4xl font-black tracking-[-.055em] sm:text-5xl">The food changes. The operating backbone stays shared.</h2>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {pillars.map(([title, body], index) => <article key={title} className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-6"><span className="text-xs font-black text-[var(--brand-deep)]">0{index + 1}</span><h3 className="mt-5 text-2xl font-black tracking-[-.04em]">{title}</h3><p className="mt-3 leading-7 text-[var(--ink-muted)]">{body}</p></article>)}
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-[var(--leaf-deep)] text-white">
        <div className="mx-auto grid max-w-[var(--page-width)] gap-8 px-5 py-16 lg:grid-cols-2 lg:px-8">
          <div><p className="text-xs font-black uppercase tracking-[.17em] text-[var(--warm)]">The YaadBody rule</p><h2 className="mt-4 text-4xl font-black tracking-[-.055em]">Rotate the experience, not the entire kitchen.</h2></div>
          <div className="space-y-4 text-white/70"><p>Core meals create familiarity. Rotating meals keep the menu fresh. Shared components protect purchasing, prep time, and waste.</p><p>Customer flexibility comes from standardized portions and controlled substitutions — not unlimited custom cooking.</p></div>
        </div>
      </section>
    </main><SiteFooter /></>
  );
}
