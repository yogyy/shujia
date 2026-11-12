import { BookOpenIcon, ShieldCheckIcon, UserIcon, CalendarBlankIcon } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { DeleteButton } from "#/components/dashboard/delete-button.tsx";
import { AdminError } from "#/components/dashboard/error.tsx";
import { FormatBadge, Stat, TableData, TableHeader } from "#/components/dashboard/sub.tsx";
import { formatDate } from "#/lib/utils.ts";
import { getAllBooksAdmin, deleteBookAdmin } from "#/utils/admin/index.functions.ts";

export const Route = createFileRoute("/(admin)/dashboard/book")({
  loader: async () => getAllBooksAdmin(),
  component: BookDashboard,
  errorComponent: AdminError,
});

function BookDashboard() {
  const books = Route.useLoaderData();
  const [search, setSearch] = useState("");
  const { queryClient } = Route.useRouteContext();

  const filtered = books.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      (b.author ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const deleteMutation = useMutation({
    mutationFn: (bookId: string) => deleteBookAdmin({ data: { bookId } }),
    onSuccess: () => {
      toast.success("Book deleted");
      queryClient.invalidateQueries();
    },
    onError: () => toast.error("Failed to delete book"),
  });

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
            Manage the collection — view all submitted books and remove entries as needed.
          </p>

          {/* Stats row */}
          <div className="mt-8 flex flex-wrap gap-6">
            <Stat label="Total books" value={books.length} />
            <Stat
              label="Authors"
              value={new Set(books.map((b) => b.author).filter(Boolean)).size}
            />
          </div>
        </section>
      </div>

      {/* Table */}
      <section className="mx-auto max-w-7xl px-5 py-10 md:px-10">
        {/* Search */}
        <div className="mb-6 flex items-center gap-3">
          <input
            id="admin-book-search"
            type="search"
            placeholder="Filter by title or author…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring w-full max-w-sm border px-3 py-2 text-sm outline-none focus:ring-1"
          />
          <span className="text-muted-foreground ml-auto hidden text-xs md:block">
            {filtered.length} / {books.length} entries
          </span>
        </div>

        {/* Desktop table */}
        <div className="border-border hidden overflow-x-auto border md:block">
          <table className="w-full table-fixed text-sm">
            <thead>
              <tr className="border-border border-b">
                <TableHeader className="w-[35%]">Title</TableHeader>
                <TableHeader className="w-[18%]">Author</TableHeader>
                <TableHeader className="w-[15%]">Format</TableHeader>
                <TableHeader className="w-[18%]">Added by</TableHeader>
                <TableHeader className="w-[10%]">Date</TableHeader>
                <TableHeader className="w-[4%]" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-muted-foreground py-16 text-center text-xs">
                    No books match your filter.
                  </td>
                </tr>
              )}
              {filtered.map((book) => (
                <tr
                  key={book.id}
                  className="border-border hover:bg-muted/30 border-b transition-colors"
                >
                  <TableData>
                    <div className="flex items-center gap-3">
                      {book.coverUrl ? (
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="border-border h-10 w-7 shrink-0 border object-cover"
                        />
                      ) : (
                        <div className="border-border bg-muted flex h-10 w-7 shrink-0 items-center justify-center border">
                          <BookOpenIcon className="text-muted-foreground size-3.5" />
                        </div>
                      )}
                      <span className="text-foreground truncate font-medium">{book.title}</span>
                    </div>
                  </TableData>
                  <TableData className="text-muted-foreground truncate">
                    {book.author ?? "—"}
                  </TableData>
                  <TableData>
                    <FormatBadge format={book.bookFormat} />
                  </TableData>
                  <TableData className="text-muted-foreground truncate">
                    {book.creatorName ?? book.createdById.slice(0, 8)}
                  </TableData>
                  <TableData className="text-muted-foreground text-xs">
                    {formatDate(book.createdAt)}
                  </TableData>
                  <TableData>
                    <DeleteButton
                      bookTitle={book.title}
                      isPending={deleteMutation.isPending}
                      onConfirm={() => deleteMutation.mutate(book.id)}
                    />
                  </TableData>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="space-y-3 md:hidden">
          {filtered.length === 0 && (
            <p className="text-muted-foreground py-10 text-center text-xs">
              No books match your filter.
            </p>
          )}
          {filtered.map((book) => (
            <div key={book.id} className="border-border border p-4">
              <div className="flex gap-3">
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="border-border h-16 w-11 shrink-0 border object-cover"
                  />
                ) : (
                  <div className="border-border bg-muted flex h-16 w-11 shrink-0 items-center justify-center border">
                    <BookOpenIcon className="text-muted-foreground size-4" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate font-medium">{book.title}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">{book.author ?? "—"}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <FormatBadge format={book.bookFormat} />
                    <span className="text-muted-foreground flex items-center gap-1 text-xs">
                      <UserIcon className="size-3" />
                      {book.creatorName ?? book.createdById.slice(0, 8)}
                    </span>
                    <span className="text-muted-foreground flex items-center gap-1 text-xs">
                      <CalendarBlankIcon className="size-3" />
                      {formatDate(book.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="shrink-0">
                  <DeleteButton
                    bookTitle={book.title}
                    isPending={deleteMutation.isPending}
                    onConfirm={() => deleteMutation.mutate(book.id)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
