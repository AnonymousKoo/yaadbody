import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--line)] bg-[color:var(--surface)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-[var(--page-width)] items-center justify-between px-5 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="YaadBody home">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--brand)] text-lg font-black text-white">YB</span>
          <span>
            <span className="block text-xl font-black tracking-[-.04em]">YaadBody</span>
            <span className="block text-[10px] font-bold uppercase tracking-[.19em] text-[var(--ink-muted)]">Meal Prep & Catering</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-bold md:flex" aria-label="Primary navigation">
          <Link href="/menu" className="hover:text-[var(--brand-deep)]">Weekly Menu</Link>
          <Link href="/catering" className="hover:text-[var(--brand-deep)]">Catering</Link>
          <Link href="/ops" className="text-[var(--ink-muted)] hover:text-[var(--brand-deep)]">Ops Prototype</Link>
        </nav>
        <Link href="/menu" className="rounded-full bg-[var(--leaf-deep)] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--leaf)]">
          Build my week
        </Link>
      </div>
    </header>
  );
}
