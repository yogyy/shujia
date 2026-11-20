import { ArrowUpIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";

const links = [
  { label: "Collection", to: "/", hash: "collection" },
  { label: "Reading notes", to: "/", hash: "notes" },
  { label: "Search", to: "/search" },
] as const;

export function Footer() {
  return (
    <footer id="about" className="border-border mt-16 border-t">
      <div className="mx-auto max-w-7xl px-5 pt-12 pb-10 md:px-10 md:pt-14 md:pb-12">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between sm:gap-16">
          <div className="max-w-xs">
            <p className="text-muted-foreground mt-3 text-sm leading-6 text-pretty">
              Every contribution makes this library better. A book suggested, a detail corrected, a
              line worth keeping.
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="text-muted-foreground flex flex-wrap gap-x-8 gap-y-1 text-sm sm:justify-end sm:gap-x-10"
          >
            {links.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                hash={"hash" in link ? link.hash : undefined}
                className="focus-visible:ring-ring/50 hover:text-foreground active:text-foreground rounded-xs py-1 tracking-[0.01em] transition-colors duration-150 focus-visible:ring-1 focus-visible:outline-none"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="border-border text-muted-foreground mt-12 flex flex-col gap-3 border-t pt-5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <span className="tracking-[0.01em]">&copy; {new Date().getFullYear()} shūjià</span>
          <BackToTop />
        </div>
      </div>
    </footer>
  );
}

function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      }}
      className="group text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 -mx-1 inline-flex cursor-pointer items-center gap-1.5 self-start rounded-xs px-1 py-1 tracking-[0.01em] transition-colors duration-150 focus-visible:ring-1 focus-visible:outline-none active:translate-y-px sm:self-auto"
    >
      Back to top
      <ArrowUpIcon
        aria-hidden="true"
        weight="bold"
        className="size-3 transition-transform duration-200 ease-out group-hover:-translate-y-0.5"
      />
    </button>
  );
}
