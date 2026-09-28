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
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[#f7f1e7]/92 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[var(--page-width)] items-center justify-between gap-5 px-5 py-3 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="YaadBody home">
          <Image
            src="/yaadbody-logo.webp"
            alt="YaadBody"
            width={58}
            height={58}
            priority
            className="h-12 w-12 rounded-full object-cover ring-1 ring-black/5 sm:h-13 sm:w-13"
          />
          <span className="hidden sm:block">
            <span className="block text-[1.08rem] font-black tracking-[-.045em]">YaadBody</span>
            <span className="mt-0.5 block text-[8px] font-black uppercase tracking-[.2em] text-[var(--ink-muted)]">Meal Prep · Party Trays · Catering</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-[13px] font-extrabold lg:flex" aria-label="Primary navigation">
          {nav.map(([label, href]) => (
            <Link key={label} href={href} className="relative py-2 transition hover:text-[var(--brand-deep)]">
              {label}
            </Link>
          ))}
        </nav>

        <Link href="/start" className="premium-button premium-button-primary !px-5 !py-3 text-sm">
          Build my week <span aria-hidden>→</span>
        </Link>
      </div>

      <nav className="flex gap-5 overflow-x-auto border-t border-black/5 px-5 py-2.5 text-[11px] font-black lg:hidden" aria-label="Mobile primary navigation">
        {nav.slice(0, 4).map(([label, href]) => (
          <Link key={label} href={href} className="shrink-0 whitespace-nowrap">
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
