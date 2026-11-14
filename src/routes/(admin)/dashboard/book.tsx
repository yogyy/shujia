import { ShieldCheckIcon } from "@phosphor-icons/react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  FlexRender,
  useTable,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import { bookColumns, bookFeatures } from "#/components/dashboard/book/columns.tsx";
import { AdminError } from "#/components/dashboard/error.tsx";
import { Stat } from "#/components/dashboard/sub.tsx";
import { SortIcon } from "#/components/sort-icon.tsx";
import { Button } from "#/components/ui/button.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table.tsx";
import { useDebounce } from "#/hooks/useDebounce.ts";
import { getAllBooksAdmin } from "#/utils/admin/index.functions.ts";

export type AdminBooksResult = Awaited<ReturnType<typeof getAllBooksAdmin>>;
export type AdminBookRow = AdminBooksResult["books"][number];

export const Route = createFileRoute("/(admin)/dashboard/book")({
  component: BookDashboard,
  errorComponent: AdminError,
});

const EMPTY: AdminBookRow[] = [];

function BookDashboard() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const sort = sorting[0];
  const { data, isPlaceholderData } = useQuery({
    queryKey: [
      "admin",
      "books",
      pagination.pageIndex,
      pagination.pageSize,
      sorting,
      debouncedSearch,
    ],
    queryFn: () =>
      getAllBooksAdmin({
        data: {
          page: pagination.pageIndex + 1,
          pageSize: pagination.pageSize,
          search: debouncedSearch,
          sortBy: sort?.id as "title" | "author" | "createdAt" | undefined,
          sortDir: sort ? (sort.desc ? "desc" : "asc") : undefined,
        },
      }),
    placeholderData: keepPreviousData, // data halaman lama tetap tampil saat fetch halaman baru
  });

  const table = useTable({
    features: bookFeatures,
    columns: bookColumns,
    data: data?.books ?? EMPTY,

    manualPagination: true,
    manualSorting: true,
    rowCount: data?.total ?? 0,
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: (updater) => {
      setSorting(updater);
      setPagination((p) => ({ ...p, pageIndex: 0 })); // balik ke halaman 1
    },
  });

  const from = data && data.total > 0 ? (data.page - 1) * data.pageSize + 1 : 0;
  const to = data ? Math.min(data.page * data.pageSize, data.total) : 0;

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
            <Stat label="Total books" value={table.getRowCount()} />
          </div>
        </section>
      </div>
      {/* Table */}
      <section className="mx-auto w-full max-w-7xl px-5 py-10 md:px-10">
        <div className="mb-6 flex items-center gap-3">
          <label htmlFor="admin-book-search" className="sr-only">
            Filter books by title
          </label>
          <input
            id="admin-book-search"
            type="search"
            placeholder="Filter by title…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              // balik ke halaman 1 setiap search berubah
              setPagination((p) => ({ ...p, pageIndex: 0 }));
            }}
            className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring w-full max-w-sm border px-3 py-2 text-sm outline-none focus:ring-1"
          />
          <span className="text-muted-foreground ml-auto hidden text-xs md:block">
            {data?.total ? `${from}-${to} of ${data.total} entries` : "No entries"}
          </span>
        </div>

        <div className="border-border w-full border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sorted = header.column.getIsSorted();
                    return (
                      <TableHead
                        key={header.id}
                        className="text-muted-foreground py-3 text-xs tracking-widest first:pl-10"
                      >
                        {canSort ? (
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            className="hover:[&>svg]:text-accent flex cursor-pointer items-center px-2 select-none"
                          >
                            {header.isPlaceholder}
                            <FlexRender header={header} />
                            <SortIcon isSorted={sorted} />
                          </button>
                        ) : (
                          <FlexRender header={header} />
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot=table-cell]:last:w-10">
              {table.getRowModel().rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={bookColumns.length}
                    className="text-muted-foreground py-16 text-center text-xs"
                  >
                    No books match your filter.
                  </TableCell>
                </TableRow>
              )}
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {data?.pageCount && data?.pageCount >= 1 && (
          <div className="mt-6 flex items-center justify-between gap-4">
            <span className="text-muted-foreground text-xs">
              Page {data.page} of {data.pageCount}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage() || isPlaceholderData}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
