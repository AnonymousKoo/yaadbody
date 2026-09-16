import Image from "next/image";
import Link from "next/link";
import { meals } from "@/fixtures/demo";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const ways = [
  { eyebrow: "Handle my week", title: "Meal Prep", body: "Fresh, flavorful meals built around your goals and how much of the week you want handled.", cta: "Build my week", href: "/start" },
  { eyebrow: "Feed the gathering", title: "Party Trays", body: "A simpler way to feed smaller gatherings when you want great food without a full catering process.", cta: "Explore party trays", href: "/catering" },
  { eyebrow: "Plan the occasion", title: "Catering", body: "Full-flavor food for events, with drop-off first and higher-touch service when the moment needs it.", cta: "Plan an event", href: "/catering" },
] as const;

const steps = [
  ["01", "Tell us what you need", "Choose your goal, how many meals you want handled, preferences, and pickup or delivery."],
  ["02", "Build your week", "Choose from the weekly menu and fill the exact number of meals in your plan."],
  ["03", "We cook + pack", "YaadBody batches the food, portions each meal, and prepares your order for fulfillment."],
  ["04", "Pick up or get it delivered", "Your week is ready. Heat, eat, and spend your time somewhere else."],
] as const;

const featured = meals.slice(0, 4);
const cardTones = ["from-[#21382a] to-[#55765f]", "from-[#b84716] to-[#ed8a4d]", "from-[#292622] to-[#665d52]", "from-[#34543c] to-[#d17a36]"];
export default function Home() {
  return (
    <><SiteHeader /><main className="overflow-hidden">
      <section className="relative border-b border-black/5 bg-[var(--surface)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(229,108,47,.12),transparent_30%),radial-gradient(circle_at_70%_80%,rgba(52,84,60,.10),transparent_32%)]" />
        <div className="relative mx-auto grid max-w-[var(--page-width)] gap-12 px-5 py-16 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-24">
          <div className="self-center">
            <p className="eyebrow">Meal prep · Party trays · Catering</p>
            <h1 className="text-balance mt-5 max-w-3xl text-5xl font-black leading-[.94] tracking-[-.07em] sm:text-6xl lg:text-7xl">Great food, handled. <span className="text-[var(--brand)]">For your week or your event.</span></h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--ink-muted)]">Healthy meal prep that makes eating well easier. Full-flavor catering when it’s time to bring people together.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/start" className="rounded-full bg-[var(--brand)] px-6 py-3.5 font-black text-white shadow-[0_14px_34px_rgba(229,108,47,.2)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-deep)]">Build my week →</Link>
              <Link href="/catering" className="rounded-full border border-[var(--line)] bg-white px-6 py-3.5 font-black transition hover:border-[var(--brand)]">Plan an event</Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold text-[var(--ink-muted)]"><span>Jamaican roots.</span><span>Made fresh.</span><span>Built for real life.</span></div>
          </div>
          <div className="relative min-h-[430px] overflow-hidden rounded-[2.25rem] bg-[var(--leaf-deep)] p-6 text-white shadow-[0_32px_90px_rgba(33,56,42,.22)] sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_18%,rgba(244,199,108,.28),transparent_24%),radial-gradient(circle_at_20%_85%,rgba(229,108,47,.34),transparent_34%)]" />
            <div className="relative flex h-full flex-col justify-between gap-12">
              <div className="flex items-start justify-between gap-4">
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.18em] text-white/75">YaadBody</span>
                <Image src="/yaadbody-logo.webp" alt="YaadBody logo" width={180} height={180} priority className="h-36 w-36 rounded-full border-4 border-white/10 object-cover shadow-2xl sm:h-44 sm:w-44" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[.17em] text-[var(--warm)]">One kitchen. Three ways to eat.</p>
                <p className="mt-3 max-w-md text-4xl font-black leading-[1] tracking-[-.055em] sm:text-5xl">Healthy weeks. Full-flavor moments.</p>
                <div className="mt-6 grid gap-2 sm:grid-cols-3">
                  {['Meal Prep', 'Party Trays', 'Catering'].map((label) => <div key={label} className="rounded-2xl border border-white/10 bg-white/[.07] px-4 py-3 text-sm font-black">{label}</div>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--page-width)] px-5 py-16 lg:px-8 lg:py-24">
        <div className="max-w-3xl"><p className="eyebrow">Choose what you need</p><h2 className="text-balance mt-4 text-4xl font-black tracking-[-.055em] sm:text-5xl">The right path without the extra back-and-forth.</h2><p className="mt-4 text-lg leading-8 text-[var(--ink-muted)]">Start with the outcome. YaadBody routes you into the right experience from there.</p></div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {ways.map((way, index) => <article id={way.title === "Party Trays" ? "party-trays" : undefined} key={way.title} className="group rounded-[1.7rem] border border-[var(--line)] bg-[var(--surface)] p-6 transition hover:-translate-y-1 hover:border-[var(--brand)] hover:shadow-[0_20px_55px_rgba(45,43,38,.08)]">
            <div className="flex items-center justify-between"><span className="text-xs font-black uppercase tracking-[.14em] text-[var(--brand-deep)]">{way.eyebrow}</span><span className="text-xs font-black text-[var(--ink-muted)]">0{index + 1}</span></div>
            <h3 className="mt-8 text-3xl font-black tracking-[-.045em]">{way.title}</h3>
            <p className="mt-3 min-h-20 leading-7 text-[var(--ink-muted)]">{way.body}</p>
            <Link href={way.href} className="mt-7 inline-flex items-center gap-2 font-black text-[var(--brand-deep)]">{way.cta} <span className="transition group-hover:translate-x-1">→</span></Link>
          </article>)}
        </div>
      </section>

      <section className="border-y border-black/5 bg-[#efe8dc]">
        <div className="mx-auto max-w-[var(--page-width)] px-5 py-16 lg:px-8 lg:py-24">
          <div className="flex flex-wrap items-end justify-between gap-5"><div className="max-w-3xl"><p className="eyebrow">A taste of YaadBody</p><h2 className="mt-4 text-4xl font-black tracking-[-.055em] sm:text-5xl">Flavor first. Structure behind it.</h2><p className="mt-4 max-w-2xl text-[var(--ink-muted)]">Menu examples shown here are food concepts from the current build. Weekly availability changes by cycle.</p></div><Link href="/menu" className="font-black text-[var(--brand-deep)]">See the weekly menu →</Link></div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((meal, index) => <article key={meal.id} className="overflow-hidden rounded-[1.55rem] border border-black/5 bg-white shadow-[0_18px_40px_rgba(47,43,36,.07)]">
              <div className={`relative h-44 bg-gradient-to-br ${cardTones[index]}`}><div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,.22),transparent_24%)]" /><span className="absolute bottom-4 left-4 rounded-full border border-white/15 bg-black/15 px-3 py-1 text-[10px] font-black uppercase tracking-[.15em] text-white">{meal.core ? 'Core favorite' : 'Rotation'}</span></div>
              <div className="p-5"><h3 className="text-xl font-black tracking-[-.035em]">{meal.name}</h3><p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">{meal.description}</p></div>
            </article>)}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-[var(--page-width)] px-5 py-16 lg:px-8 lg:py-24">
        <div className="max-w-3xl"><p className="eyebrow">How meal prep works</p><h2 className="mt-4 text-4xl font-black tracking-[-.055em] sm:text-5xl">Less deciding. More eating well.</h2></div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {steps.map(([number, title, body]) => <article key={number} className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-6"><span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--brand)] text-xs font-black text-white">{number}</span><h3 className="mt-6 text-xl font-black tracking-[-.03em]">{title}</h3><p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">{body}</p></article>)}
        </div>
        <div className="mt-8"><Link href="/start" className="inline-flex rounded-full bg-[var(--leaf-deep)] px-6 py-3.5 font-black text-white transition hover:bg-[var(--leaf)]">Start my week →</Link></div>
      </section>

      <section id="about" className="border-y border-black/5 bg-[var(--leaf-deep)] text-white">
        <div className="mx-auto grid max-w-[var(--page-width)] gap-10 px-5 py-16 lg:grid-cols-[.9fr_1.1fr] lg:px-8 lg:py-24">
          <div><p className="text-xs font-black uppercase tracking-[.17em] text-[var(--warm)]">Jamaican roots. Made fresh.</p><h2 className="mt-4 text-4xl font-black leading-[1] tracking-[-.055em] sm:text-5xl">Healthy doesn’t have to taste like a compromise.</h2></div>
          <div className="self-end space-y-5 text-lg leading-8 text-white/70"><p>YaadBody is built around simple standards: real food, serious flavor, controlled portions, and a weekly experience that is easier to stick with.</p><p>The menu can travel beyond Jamaican food. The roots stay in the seasoning, the hospitality, and the expectation that food should actually be enjoyable.</p></div>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--page-width)] px-5 py-16 lg:px-8 lg:py-24">
        <div className="overflow-hidden rounded-[2rem] bg-[#191d1a] text-white shadow-[0_28px_80px_rgba(23,27,24,.18)]">
          <div className="grid lg:grid-cols-[1.05fr_.95fr]">
            <div className="p-7 sm:p-10 lg:p-12"><p className="text-xs font-black uppercase tracking-[.17em] text-[var(--warm)]">Catering + events</p><h2 className="mt-4 max-w-xl text-4xl font-black leading-[1] tracking-[-.055em] sm:text-5xl">Good food brings people together.</h2><p className="mt-5 max-w-xl text-lg leading-8 text-white/65">From office lunches and family gatherings to bigger celebrations, YaadBody brings the same full-flavor standard to the table.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/catering" className="rounded-full bg-[var(--brand)] px-6 py-3.5 font-black text-white">Plan my event →</Link><a href="#party-trays" className="rounded-full border border-white/15 px-6 py-3.5 font-black text-white">See party trays</a></div></div>
            <div className="relative min-h-[340px] bg-[linear-gradient(140deg,#34543c,#21382a_48%,#b84716)] p-7 sm:p-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(244,199,108,.3),transparent_22%),radial-gradient(circle_at_30%_78%,rgba(255,255,255,.12),transparent_30%)]" />
              <div className="relative flex h-full flex-col justify-end"><p className="text-xs font-black uppercase tracking-[.17em] text-white/55">Built for</p><div className="mt-4 flex flex-wrap gap-2">{['Corporate lunches','Private parties','Family gatherings','Celebrations'].map((item) => <span key={item} className="rounded-full border border-white/15 bg-white/[.06] px-4 py-2 text-sm font-bold">{item}</span>)}</div><p className="mt-8 max-w-sm text-3xl font-black leading-[1.05] tracking-[-.045em]">Same YaadBody standard. Bigger table.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-black/5 bg-[var(--brand)] text-white">
        <div className="mx-auto flex max-w-[var(--page-width)] flex-col gap-7 px-5 py-12 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div><p className="text-xs font-black uppercase tracking-[.17em] text-white/70">Take food off your plate</p><h2 className="mt-2 text-3xl font-black tracking-[-.045em] sm:text-4xl">Let YaadBody put great food on it.</h2></div>
          <div className="flex flex-wrap gap-3"><Link href="/start" className="rounded-full bg-white px-6 py-3.5 font-black text-[var(--brand-deep)]">Build my week →</Link><Link href="/catering" className="rounded-full border border-white/35 px-6 py-3.5 font-black">Plan my event</Link></div>
        </div>
      </section>
    </main><SiteFooter /></>
  );
}
