import { ShieldCheckIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminError } from "#/components/dashboard/error.tsx";

export const Route = createFileRoute("/(admin)/dashboard/")({
  component: AdminDashboard,
  errorComponent: AdminError,
});

function AdminDashboard() {
  return (
    <>
      <div className="border-border border-b">
        <section className="mx-auto max-w-7xl px-5 py-10 md:px-10">
          <div className="flex items-center gap-3">
            <span className="bg-accent/10 text-accent border-accent/20 flex items-center gap-1.5 border px-2 py-1 text-xs font-medium tracking-widest uppercase">
              <ShieldCheckIcon weight="fill" className="size-3" />
              Admin
            </span>
          </div>
          <h1 className="text-primary mt-4 font-serif text-4xl tracking-tight md:text-6xl">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-7">
            Manage the collection.
          </p>
        </section>
      </div>
    </>
  );
}
