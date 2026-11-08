import { createFileRoute, useLocation } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { useEffect } from "react";
import { toast } from "sonner";
import { Footer } from "#/components/section/footer.tsx";
import { Navbar } from "#/components/section/navbar.tsx";
import { NewBookCollection } from "#/components/section/new-book-collection.tsx";
import { authClient } from "#/lib/auth-client.ts";
import { createDb } from "../db";

export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => getBooks(),
});

function Home() {
  const { data: session } = authClient.useSession();
  const loc = useLocation();
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    if (loc.searchStr === "?signIn=true") {
      toast.success("Login successful");
    }
  }, [loc.searchStr === "?signIn=true"]);

  return (
    <main className="bg-background text-foreground min-h-screen">
      <Navbar />

      <section id="top" className="mx-auto max-w-7xl px-5 pt-16 pb-16 md:px-10 md:pt-24 md:pb-20">
        <div className="max-w-3xl">
          <p className="text-accent mb-5 text-xs font-medium tracking-[0.25em] uppercase">
            A considered collection
          </p>
          <h1 className="text-primary font-serif text-5xl leading-[0.95] tracking-tight md:text-8xl">
            Books for the
            <br />
            <em className="text-accent font-normal">in-between.</em>
          </h1>
          <p className="text-muted-foreground mt-7 max-w-md text-base leading-7">
            A quiet shelf of novels, essays, and poems for long afternoons, late trains, and the
            spaces between one thought and the next.
          </p>
        </div>
      </section>
      <NewBookCollection />

      <section
        id="notes"
        className="border-border mx-auto mt-8 max-w-7xl border-t px-5 py-16 md:px-10"
      >
        <div className="grid gap-8 md:grid-cols-[1fr_2fr] md:items-end">
          <div>
            <p className="text-accent text-xs tracking-[0.25em] uppercase">From the margins</p>
            <h2 className="text-primary mt-4 font-serif text-4xl">Reading notes</h2>
          </div>
          <p className="text-muted-foreground max-w-xl text-base leading-7">
            Small observations from a life spent reading: the books that stay with us, the sentences
            worth underlining, and the authors we return to when we need a different way of seeing.
          </p>
        </div>
      </section>

      <section className="border-border mx-auto mt-8 max-w-7xl border-t px-5 py-16 md:px-10"></section>

      <Footer />
    </main>
  );
}

const getBooks = createServerFn({ method: "GET" }).handler(async () => {
  const db = createDb(env.DATABASE_URL);
  const books = await db.query.books.findFirst();
  return { books };
});
