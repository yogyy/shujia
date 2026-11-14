import { WarningCircleIcon } from "@phosphor-icons/react";
import { Footer } from "../section/footer";
import { Navbar } from "../section/navbar";

export function AdminError() {
  return (
    <main className="bg-background text-foreground flex min-h-screen flex-col">
      <Navbar />
      <div className="mx-auto flex flex-1 flex-col items-center justify-center px-5 py-24 text-center">
        <span className="bg-destructive/10 text-destructive border-destructive/20 mb-6 inline-flex items-center gap-1.5 border px-2.5 py-1 text-xs font-medium tracking-widest uppercase">
          <WarningCircleIcon weight="fill" className="size-3.5" />
          403 — Forbidden
        </span>
        <h1 className="text-primary font-serif text-4xl tracking-tight md:text-6xl">
          Access denied.
        </h1>
        <p className="text-muted-foreground mt-5 max-w-sm text-sm leading-7">
          This page is restricted to administrators only. If you believe this is an error, please
          contact the site owner.
        </p>
      </div>
      <Footer />
    </main>
  );
}
