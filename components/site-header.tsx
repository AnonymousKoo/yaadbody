import Image from "next/image";
import Link from "next/link";

const nav = [
  ["Meal Prep", "/start"],
  ["This Week's Menu", "/menu"],
  ["Party Trays", "/#party-trays"],
  ["Catering", "/catering"],
  ["About", "/#about"],
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[#fffdf8]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[var(--page-width)] items-center justify-between gap-5 px-5 py-3 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="YaadBody home">
          <Image src="/yaadbody-logo.webp" alt="YaadBody" width={58} height={58} priority className="h-12 w-12 rounded-full object-cover sm:h-14 sm:w-14" />
          <span className="hidden sm:block">
            <span className="block text-xl font-black tracking-[-.045em]">YaadBody</span>
            <span className="block text-[9px] font-black uppercase tracking-[.2em] text-[var(--ink-muted)]">Meal Prep · Catering</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-bold lg:flex" aria-label="Primary navigation">
          {nav.map(([label, href]) => <Link key={label} href={href} className="transition hover:text-[var(--brand-deep)]">{label}</Link>)}
        </nav>
        <Link href="/start" className="rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-black text-white shadow-[0_10px_30px_rgba(229,108,47,.18)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-deep)]">
          Build my week <span aria-hidden>→</span>
        </Link>
      </div>      <nav className="flex gap-5 overflow-x-auto border-t border-black/5 px-5 py-2.5 text-xs font-black lg:hidden" aria-label="Mobile primary navigation">
        {nav.slice(0, 4).map(([label, href]) => <Link key={label} href={href} className="shrink-0">{label}</Link>)}
      </nav>
    </header>
  );
}
