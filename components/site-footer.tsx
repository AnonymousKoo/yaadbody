import Image from "next/image";
import Link from "next/link";

const links = [
  ["Meal Prep", "/start"],
  ["Weekly Menu", "/menu"],
  ["Party Trays", "/#party-trays"],
  ["Catering", "/catering"],
] as const;

export function SiteFooter() {
  return (
    <footer className="bg-[#101410] text-white">
      <div className="mx-auto max-w-[var(--page-width)] px-5 py-14 lg:px-8 lg:py-16">
        <div className="grid gap-12 border-b border-white/10 pb-12 md:grid-cols-[1.15fr_.85fr] md:items-end">
          <div>
            <div className="flex items-center gap-4">
              <Image src="/yaadbody-logo.webp" alt="YaadBody" width={72} height={72} className="h-16 w-16 rounded-full object-cover ring-1 ring-white/10" />
              <div>
                <p className="text-2xl font-black tracking-[-.05em]">YaadBody</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[.16em] text-[var(--warm)]">Jamaican roots · made fresh</p>
              </div>
            </div>
            <p className="mt-6 max-w-lg text-sm leading-7 text-white/55">
              Flavor-first meal prep for the week. Full-flavor food for the gathering.
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm font-bold md:justify-self-end md:text-right" aria-label="Footer navigation">
            {links.map(([label, href]) => (
              <Link key={label} href={href} className="text-white/65 transition hover:text-white">
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-3 pt-7 text-[11px] font-bold uppercase tracking-[.12em] text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 YaadBody. All rights reserved.</p>
          <p>Real food. Serious flavor.</p>
        </div>
      </div>
    </footer>
  );
}
