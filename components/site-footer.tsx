export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--leaf-deep)] text-white">
      <div className="mx-auto grid max-w-[var(--page-width)] gap-6 px-5 py-10 sm:grid-cols-2 lg:px-8">
        <div>
          <p className="text-2xl font-black tracking-[-.04em]">YaadBody</p>
          <p className="mt-2 max-w-md text-sm text-white/65">Healthy meal prep with Yaad flavor. Full-flavor catering for the moments that matter.</p>
        </div>
        <p className="sm:text-right text-sm text-white/50">Prototype data is not approved for production nutrition labels, pricing, or purchasing.</p>
      </div>
    </footer>
  );
}
