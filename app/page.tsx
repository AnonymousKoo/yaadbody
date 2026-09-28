import Image from "next/image";
import Link from "next/link";
import { meals } from "@/fixtures/demo";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const ways = [
  {
    eyebrow: "Handle my week",
    title: "Meal Prep",
    body: "Fresh, flavorful meals built around your goals and how much of the week you want handled.",
    cta: "Build my week",
    href: "/start",
    image: "/food/yaad-jerk-chicken.jpg",
  },
  {
    eyebrow: "Feed the gathering",
    title: "Party Trays",
    body: "A simpler way to feed smaller gatherings when you want great food without a full catering process.",
    cta: "Explore party trays",
    href: "/catering",
    image: "/food/party-tray.jpg",
  },
  {
    eyebrow: "Plan the occasion",
    title: "Catering",
    body: "Full-flavor food for events, with drop-off first and higher-touch service when the moment needs it.",
    cta: "Plan an event",
    href: "/catering",
    image: "/food/catering-spread.jpg",
  },
] as const;

const steps = [
  ["01", "Tell us what you need", "Choose your goal, how many meals you want handled, preferences, and pickup or delivery."],
  ["02", "Build your week", "Choose from the weekly menu and fill the exact number of meals in your plan."],
  ["03", "We cook + pack", "YaadBody batches the food, portions each meal, and prepares your order for fulfillment."],
  ["04", "Pick up or get it delivered", "Your week is ready. Heat, eat, and spend your time somewhere else."],
] as const;

const featured = meals.slice(0, 4);

const mealImageById: Record<string, string> = {
  "yaad-jerk-chicken": "/food/yaad-jerk-chicken.jpg",
  "island-curry-chicken": "/food/island-curry-chicken.jpg",
  "garlic-shrimp-bowl": "/food/garlic-shrimp-bowl.jpg",
  "beef-sweet-potato": "/food/beef-sweet-potato.jpg",
  "escovitch-cod-plate": "/food/escovitch-cod-plate.jpg",
};

const featuredCopyById: Record<string, { name: string; description: string }> = {
  "island-curry-chicken": {
    name: "Jamaican Curry Chicken",
    description: "Rich Jamaican curry chicken served with classic island-style sides.",
  },
};

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="overflow-hidden">
        <section className="relative bg-[var(--background)]">
          <div className="absolute inset-x-0 top-0 h-px bg-black/5" />
          <div className="mx-auto grid min-h-[740px] max-w-[var(--page-width)] items-center gap-12 px-5 py-12 lg:grid-cols-[.86fr_1.14fr] lg:px-8 lg:py-16">
            <div className="relative z-10 py-8 lg:py-0">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-3.5 py-2 text-[11px] font-black uppercase tracking-[.16em] text-[var(--leaf-deep)] backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" />
                Jamaican roots · made fresh
              </div>

              <h1 className="max-w-[11ch] text-balance text-[clamp(3.8rem,8vw,7.6rem)] font-black leading-[.86] tracking-[-.075em]">
                Food that fits <span className="text-[var(--brand)]">real life.</span>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-8 text-[var(--ink-muted)] sm:text-xl">
                Flavor-first meal prep for the week. Full-flavor food for the gathering. One kitchen built around how you actually eat.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/start" className="premium-button premium-button-primary">
                  Build my week <span aria-hidden>→</span>
                </Link>
                <Link href="/catering" className="premium-button premium-button-light">
                  Plan an event
                </Link>
              </div>

              <div className="mt-12 grid max-w-xl grid-cols-3 border-y border-black/10 py-5">
                {[
                  ["Meal Prep", "For your routine"],
                  ["Party Trays", "For the table"],
                  ["Catering", "For the occasion"],
                ].map(([title, label], index) => (
                  <div key={title} className={index === 0 ? "" : "border-l border-black/10 pl-4 sm:pl-6"}>
                    <p className="text-sm font-black tracking-[-.02em] sm:text-base">{title}</p>
                    <p className="mt-1 text-[11px] font-bold uppercase tracking-[.1em] text-[var(--ink-muted)]">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-h-[560px] lg:min-h-[650px]">
              <div className="absolute inset-x-0 top-0 bottom-10 overflow-hidden rounded-[2rem] bg-[var(--leaf-deep)] shadow-[0_35px_90px_rgba(29,36,30,.18)] sm:rounded-[2.5rem]">
                <Image
                  src="/food/yaad-jerk-chicken.jpg"
                  alt="Illustrative YaadBody jerk chicken presentation"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,20,14,.04),rgba(12,20,14,.08)_45%,rgba(12,20,14,.68))]" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <p className="max-w-lg text-[clamp(2rem,5vw,4.6rem)] font-black leading-[.88] tracking-[-.065em] text-white">
                    Healthy weeks.
                    <br />
                    <span className="text-[var(--warm)]">Bolder gatherings.</span>
                  </p>
                </div>
              </div>

              <div className="absolute -bottom-1 -left-3 z-10 hidden w-[44%] overflow-hidden rounded-[1.7rem] border-8 border-[var(--background)] bg-white shadow-[0_24px_60px_rgba(31,35,31,.18)] sm:block lg:-left-8">
                <div className="relative aspect-[4/3]">
                  <Image src="/food/island-curry-chicken.jpg" alt="Illustrative Jamaican curry chicken presentation" fill sizes="28vw" className="object-cover" />
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm font-black">Jamaican Curry</span>
                  <span className="text-[10px] font-black uppercase tracking-[.12em] text-[var(--brand-deep)]">This week</span>
                </div>
              </div>

              <div className="absolute right-4 top-5 rounded-full border border-white/20 bg-black/25 px-4 py-2 text-[10px] font-black uppercase tracking-[.18em] text-white backdrop-blur-md sm:right-6 sm:top-6">
                YaadBody
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[var(--ink)] text-white">
          <div className="mx-auto max-w-[var(--page-width)] px-5 py-16 lg:px-8 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
              <div>
                <p className="eyebrow eyebrow-warm">Choose your lane</p>
                <h2 className="mt-4 max-w-xl text-5xl font-black leading-[.92] tracking-[-.06em] sm:text-6xl">
                  One kitchen.
                  <br />
                  Three ways to eat.
                </h2>
              </div>
              <p className="max-w-xl text-lg leading-8 text-white/60 lg:justify-self-end">
                Start with the outcome you need. YaadBody handles the food, structure, and experience from there.
              </p>
            </div>

            <div className="mt-12 grid gap-4 lg:grid-cols-3">
              {ways.map((way, index) => (
                <article
                  id={way.title === "Party Trays" ? "party-trays" : undefined}
                  key={way.title}
                  className="group relative min-h-[460px] overflow-hidden rounded-[1.8rem] bg-white/5"
                >
                  <Image
                    src={way.image}
                    alt={"Illustrative " + way.title + " presentation"}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,13,10,.05),rgba(10,13,10,.18)_40%,rgba(10,13,10,.92))]" />
                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-[.16em] text-white/60">{way.eyebrow}</span>
                      <span className="text-[10px] font-black text-white/40">0{index + 1}</span>
                    </div>
                    <h3 className="mt-3 text-4xl font-black tracking-[-.05em]">{way.title}</h3>
                    <p className="mt-3 max-w-sm leading-7 text-white/65">{way.body}</p>
                    <Link href={way.href} className="mt-6 inline-flex items-center gap-2 border-b border-white/35 pb-1 text-sm font-black">
                      {way.cta} <span className="transition group-hover:translate-x-1">→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[var(--surface-soft)]">
          <div className="mx-auto max-w-[var(--page-width)] px-5 py-16 lg:px-8 lg:py-24">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-3xl">
                <p className="eyebrow">This week at YaadBody</p>
                <h2 className="mt-4 text-balance text-5xl font-black leading-[.94] tracking-[-.06em] sm:text-6xl">
                  The kind of food you actually look forward to.
                </h2>
              </div>
              <Link href="/menu" className="premium-link">
                Explore the full menu <span aria-hidden>→</span>
              </Link>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((meal, index) => {
                const copy = featuredCopyById[meal.id] ?? meal;
                return (
                  <article key={meal.id} className={"meal-card group " + (index === 0 ? "lg:col-span-2 lg:grid lg:grid-cols-[1.1fr_.9fr]" : "")}>
                    <div className={"relative overflow-hidden " + (index === 0 ? "min-h-[300px] lg:min-h-full" : "h-64")}>
                      <Image
                        src={mealImageById[meal.id]}
                        alt={"Illustrative " + copy.name + " presentation"}
                        fill
                        sizes={index === 0 ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 640px) 100vw, 25vw"}
                        className="object-cover transition duration-700 group-hover:scale-[1.035]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                      <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.14em] text-[var(--ink)] backdrop-blur">
                        {meal.core ? "Core favorite" : "Rotation"}
                      </span>
                    </div>
                    <div className={"bg-white p-5 " + (index === 0 ? "flex flex-col justify-end sm:p-7" : "")}>
                      {index === 0 && <p className="eyebrow">Featured favorite</p>}
                      <h3 className={(index === 0 ? "mt-3 text-4xl" : "text-2xl") + " font-black leading-[1] tracking-[-.045em]"}>{copy.name}</h3>
                      <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">{copy.description}</p>
                      {index === 0 && (
                        <Link href="/menu" className="mt-7 inline-flex items-center gap-2 text-sm font-black text-[var(--brand-deep)]">
                          See this week&apos;s menu <span aria-hidden>→</span>
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[var(--background)]">
          <div className="mx-auto max-w-[var(--page-width)] px-5 py-16 lg:px-8 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
              <div>
                <p className="eyebrow">How meal prep works</p>
                <h2 className="mt-4 max-w-lg text-5xl font-black leading-[.93] tracking-[-.06em] sm:text-6xl">
                  Less deciding.
                  <br />
                  More eating well.
                </h2>
                <p className="mt-5 max-w-md text-lg leading-8 text-[var(--ink-muted)]">
                  Your week should feel easier, not like another project to manage.
                </p>
                <Link href="/start" className="premium-button premium-button-dark mt-8">
                  Start my week <span aria-hidden>→</span>
                </Link>
              </div>

              <div className="divide-y divide-black/10 border-y border-black/10">
                {steps.map(([number, title, body]) => (
                  <article key={number} className="grid gap-4 py-6 sm:grid-cols-[4rem_1fr_1.2fr] sm:items-start sm:py-7">
                    <span className="text-sm font-black text-[var(--brand)]">{number}</span>
                    <h3 className="text-xl font-black tracking-[-.035em]">{title}</h3>
                    <p className="text-sm leading-6 text-[var(--ink-muted)]">{body}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="relative overflow-hidden bg-[var(--leaf-deep)] text-white">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border border-white/5" />
          <div className="absolute -right-12 top-16 h-64 w-64 rounded-full border border-white/5" />
          <div className="mx-auto grid max-w-[var(--page-width)] gap-12 px-5 py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-28">
            <div>
              <p className="eyebrow eyebrow-warm">Jamaican roots. Made fresh.</p>
              <h2 className="mt-5 max-w-3xl text-balance text-5xl font-black leading-[.9] tracking-[-.065em] sm:text-7xl">
                Healthy doesn&apos;t have to taste like a compromise.
              </h2>
            </div>
            <div className="self-end lg:pb-1">
              <p className="text-xl leading-9 text-white/72">
                YaadBody is built around real food, serious flavor, controlled portions, and a weekly experience that is easier to stick with.
              </p>
              <p className="mt-6 text-base leading-7 text-white/55">
                The menu can travel beyond Jamaican food. The roots stay in the seasoning, the hospitality, and the expectation that food should actually be enjoyable.
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                {["Real ingredients", "Serious flavor", "Made fresh", "Built for real life"].map((item) => (
                  <span key={item} className="rounded-full border border-white/12 px-4 py-2 text-xs font-bold text-white/70">{item}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[var(--background)] px-5 py-16 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-[var(--page-width)]">
            <div className="relative min-h-[620px] overflow-hidden rounded-[2rem] bg-black sm:rounded-[2.5rem]">
              <Image src="/food/catering-spread.jpg" alt="Illustrative catering spread" fill sizes="100vw" className="object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,14,12,.93)_0%,rgba(11,14,12,.74)_45%,rgba(11,14,12,.18)_78%)]" />
              <div className="relative flex min-h-[620px] max-w-3xl flex-col justify-end p-7 text-white sm:p-10 lg:p-14">
                <p className="eyebrow eyebrow-warm">Catering + events</p>
                <h2 className="mt-5 text-balance text-5xl font-black leading-[.9] tracking-[-.065em] sm:text-7xl">
                  Bring the flavor.
                  <br />
                  We&apos;ll handle the table.
                </h2>
                <p className="mt-6 max-w-xl text-lg leading-8 text-white/65">
                  Office lunches, family gatherings, celebrations, and the moments that deserve food people remember.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/catering" className="premium-button premium-button-primary">
                    Plan my event <span aria-hidden>→</span>
                  </Link>
                  <a href="#party-trays" className="premium-button premium-button-ghost">
                    See party trays
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[var(--brand)] text-white">
          <div className="mx-auto grid max-w-[var(--page-width)] gap-8 px-5 py-14 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8 lg:py-16">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.18em] text-white/65">Take food off your plate</p>
              <h2 className="mt-2 max-w-3xl text-4xl font-black leading-[.95] tracking-[-.055em] sm:text-5xl">
                Let YaadBody put great food on it.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/start" className="premium-button bg-white text-[var(--brand-deep)] hover:bg-[#fff8f1]">
                Build my week <span aria-hidden>→</span>
              </Link>
              <Link href="/catering" className="premium-button premium-button-ghost">
                Plan my event
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
