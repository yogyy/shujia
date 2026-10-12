import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryState } from "nuqs";
import { BookCard, BookCardSkeleton } from "#/components/book/card.tsx";
import { DisplayModeSetting } from "#/components/display-mode-setting.tsx";
import { SearchBar } from "#/components/search-bar.tsx";
import { Footer } from "#/components/section/footer.tsx";
import { Navbar } from "#/components/section/navbar.tsx";
import { getBookByTitle, getLatestBooks } from "#/utils/books.functions.ts";

export const Route = createFileRoute("/search")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: books, isLoading: latestBookLoading } = useQuery({
    queryKey: ["books"],
    queryFn: getLatestBooks,
  });

  const [query, _] = useQueryState("q", {
    defaultValue: "",
  });

  const { data: searchedBooks, isLoading } = useQuery({
    queryFn: () => getBookByTitle({ data: { query } }),
    queryKey: ["search", query],
    enabled: query?.length >= 3,
  });

  const hasQuery = query.trim().length >= 3;
  const hasBooks = (searchedBooks?.length ?? 0) > 0;

  return (
    <main className="bg-background text-foreground">
      <Navbar />
      <div className="mx-auto min-h-svh max-w-7xl border-t">
        <section className="px-5 pt-8 md:px-10">
          <div className="flex items-center gap-3 place-self-end">
            <div className="border-border flex items-center gap-2 rounded-lg border p-0.5">
              <SearchBar autoFocus />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-x-4 gap-y-10 sm:grid-cols-4 md:grid-cols-6">
            {isLoading ? (
              Array.from({ length: 3 }, (_, i) => <BookCardSkeleton key={i} />)
            ) : hasBooks ? (
              searchedBooks!.map((book) => <BookCard book={book} key={book.id} />)
            ) : hasQuery ? (
              <div className="col-span-full flex w-full items-center justify-center">
                <div className="bg-background flex aspect-[1/1.6] max-w-70 items-center justify-center">
                  <p className="text-accent animate-pulse text-xl font-medium">No books found.</p>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="px-5 py-8 md:px-10">
          <div className="mt-10 flex items-center justify-between">
            <h2 className="text-primary font-serif text-2xl">Recommendation</h2>
            <DisplayModeSetting />
          </div>
          <div className="mt-7 grid grid-cols-3 gap-x-4 gap-y-10 sm:grid-cols-4 md:grid-cols-6">
            {latestBookLoading
              ? Array.from({ length: 12 }, (_, i) => <BookCardSkeleton key={i} />)
              : null}
            {books?.map((book) => (
              <BookCard book={book} key={book.title} />
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
