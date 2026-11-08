import { Link } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { authClient } from "#/lib/auth-client.ts";
import { DropdownMenuAvatar } from "../user-menu";

const LoginModal = lazy(() => import("../form/login").then((m) => ({ default: m.LoginModal })));

const NewBookForm = lazy(() =>
  import("../form/new-book").then((m) => ({ default: m.NewBookForm })),
);

export function Navbar() {
  const { data } = authClient.useSession();
  return (
    <header className="bg-background flex w-full items-center border-b">
      <div className="mx-auto flex h-(--header-height) w-full max-w-7xl items-center justify-between gap-2 px-4 py-4">
        <Link to="/" className="text-primary font-serif text-2xl tracking-tight">
          shūjià<span className="text-accent">.</span>
        </Link>
        <nav className="text-muted-foreground hidden items-center gap-8 text-sm *:p-1 *:text-nowrap md:flex">
          <a href="#collection" className="text-foreground">
            Collection
          </a>
          <a href="#about">About</a>
          <a href="#notes">Reading notes</a>
        </nav>

        <div className="flex items-center justify-end">
          <Suspense>
            {data ? (
              <div className="flex gap-3">
                <NewBookForm />
                <DropdownMenuAvatar />
              </div>
            ) : (
              <LoginModal>Log in to Add a Book</LoginModal>
            )}
          </Suspense>
        </div>
      </div>
    </header>
  );
}
