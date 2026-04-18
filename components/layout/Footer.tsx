export function Footer() {
  const links = ["Product", "Pricing", "API", "Blog", "Careers"] as const;

  return (
    <footer className="border-t border-white/[0.06] bg-[#080810] px-10 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 md:flex-row md:justify-between">
        <a
          href="/"
          className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-lg font-bold text-transparent"
        >
          ✦ Nexflow
        </a>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 md:flex-1">
          {links.map((label) => (
            <a
              key={label}
              href={
                label === "Pricing"
                  ? "/pricing"
                  : label === "Product"
                    ? "/#features"
                    : "#"
              }
              className="text-sm text-white/35 transition-colors hover:text-white/70"
            >
              {label}
            </a>
          ))}
        </nav>

        <p className="text-center text-xs text-white/20 md:text-right">
          © 2026 Nexflow · All rights reserved
        </p>
      </div>
    </footer>
  );
}
