import { Link } from "@tanstack/react-router";
import { authClient } from "#/lib/auth-client.ts";
import { LoginModal } from "../form/login";
import { NewBookForm } from "../form/new-book";
import { DropdownMenuAvatar } from "../user-menu";

export function Navbar() {
  const { data } = authClient.useSession();
  return (
    <header className="border-border mx-auto flex w-full max-w-7xl items-center justify-between border-b px-5 py-5 md:px-10">
      <Link to="/" className="text-primary flex-1 font-serif text-2xl tracking-tight">
        unbound<span className="text-accent">.</span>
      </Link>
      <nav className="text-muted-foreground hidden flex-1 items-center gap-8 text-sm *:p-1 md:flex">
        <a href="#collection" className="text-foreground">
          Collection
        </a>
        <a href="#about">About</a>
        <a href="#notes">Reading notes</a>
      </nav>

      <div className="flex flex-1 items-center justify-end">
        {data ? (
          <div className="flex gap-3">
            <NewBookForm />
            <DropdownMenuAvatar />
          </div>
        ) : (
          <LoginModal>Log in to Add a Book</LoginModal>
        )}
      </div>
    </header>
  );
}
