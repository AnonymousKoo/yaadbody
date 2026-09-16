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
    <footer className="bg-[#171b18] text-white">
      <div className="mx-auto grid max-w-[var(--page-width)] gap-10 px-5 py-12 md:grid-cols-[1.2fr_.8fr] lg:px-8">
        <div className="flex items-start gap-4">
          <Image src="/yaadbody-logo.webp" alt="YaadBody" width={72} height={72} className="h-16 w-16 rounded-full object-cover" />
          <div>
            <p className="text-2xl font-black tracking-[-.045em]">YaadBody</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-white/60">Healthy meal prep for the week. Full-flavor food for the gathering. Jamaican roots, made fresh.</p>
          </div>
        </div>
        <div className="md:text-right">
          <nav className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-bold md:justify-end" aria-label="Footer navigation">
            {links.map(([label, href]) => <Link key={label} href={href} className="text-white/75 transition hover:text-white">{label}</Link>)}
          </nav>          <p className="mt-6 text-xs text-white/40">© 2026 YaadBody. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
