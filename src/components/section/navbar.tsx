import { ListIcon } from "@phosphor-icons/react";
import { Link, useLocation } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { Button } from "#/components/ui/button.tsx";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "#/components/ui/sheet.tsx";
import { Skeleton } from "#/components/ui/skeleton.tsx";
import { authClient } from "#/lib/auth-client.ts";
import { DropdownMenuAvatar } from "../user-menu";

const LoginModal = lazy(() => import("../form/login").then((m) => ({ default: m.LoginModal })));

const NewBookForm = lazy(() =>
  import("../form/new-book").then((m) => ({ default: m.NewBookForm })),
);

const links = [
  { label: "Collection", hash: "collection" },
  { label: "About", hash: "about" },
  { label: "Reading notes", hash: "notes" },
] as const;

const linkClass =
  "rounded-xs px-1 py-1.5 transition-colors duration-150 hover:text-foreground active:text-foreground focus-visible:ring-1 focus-visible:ring-ring/50 focus-visible:outline-none";

function AuthSkeleton() {
  return (
    <div className="flex items-center gap-2" aria-hidden>
      <Skeleton className="h-8 w-26 rounded-none motion-reduce:animate-none" />
      <Skeleton className="size-8 rounded-full motion-reduce:animate-none" />
    </div>
  );
}

export function Navbar() {
  const { data: session, isPending } = authClient.useSession();
  const { pathname, hash } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const currentHash = hash.replace(/^#/, "");
  const isHome = pathname === "/";
  // On the home page with no hash, the shelf itself is the current section.
  const activeHash = isHome ? currentHash || "collection" : null;

  return (
    <header className="bg-background sticky top-0 z-40 border-b">
      <div className="mx-auto flex h-(--header-height) w-full max-w-7xl items-center justify-between gap-2 px-4">
        <Link
          to="/"
          className="text-primary focus-visible:ring-ring/50 rounded-xs font-serif text-2xl tracking-tight transition-opacity duration-150 focus-visible:ring-1 focus-visible:outline-none active:opacity-70"
        >
          shūjià<span className="text-accent">.</span>
        </Link>

        <nav
          aria-label="Primary"
          className="text-muted-foreground hidden items-center gap-8 text-sm md:flex"
        >
          {links.map((link) => {
            const active = activeHash === link.hash;

            return (
              <Link
                key={link.hash}
                to="/"
                hash={link.hash}
                aria-current={active ? "location" : undefined}
                className={`${linkClass} ${active ? "text-foreground" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <Suspense fallback={<AuthSkeleton />}>
            {isPending ? (
              <AuthSkeleton />
            ) : session ? (
              <>
                <NewBookForm />
                <DropdownMenuAvatar />
              </>
            ) : (
              <LoginModal>Log in</LoginModal>
            )}
          </Suspense>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Open menu" className="md:hidden" />
              }
            >
              <ListIcon />
            </SheetTrigger>
            <SheetContent side="right" className="bg-background">
              <SheetHeader>
                <SheetTitle className="text-accent text-xs tracking-[0.25em] uppercase">
                  Menu
                </SheetTitle>
              </SheetHeader>
              <nav aria-label="Primary" className="mt-2 flex flex-col px-4">
                {links.map((link) => {
                  const active = activeHash === link.hash;

                  return (
                    <Link
                      key={link.hash}
                      to="/"
                      hash={link.hash}
                      onClick={() => setMenuOpen(false)}
                      aria-current={active ? "location" : undefined}
                      className={`border-border active:text-foreground border-b py-4 text-sm transition-colors duration-150 ${
                        active ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
