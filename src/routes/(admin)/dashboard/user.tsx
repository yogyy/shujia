import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowsDownUpIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { FlexRender, useTable } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import {
  userColumns,
  userFeatures,
  type UserRow,
} from "#/components/dashboard/user/user-columns.tsx";
import { Button } from "#/components/ui/button.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table.tsx";
import { getAllUser } from "#/utils/admin/index.functions.ts";

export const Route = createFileRoute("/(admin)/dashboard/user")({
  component: UserDashboard,
  loader: async () => await getAllUser(),
});

function SortIcon({ isSorted }: { isSorted: false | "asc" | "desc" }) {
  if (isSorted === "asc") return <ArrowUpIcon className="ml-1 inline size-3" />;
  if (isSorted === "desc") return <ArrowDownIcon className="ml-1 inline size-3" />;
  return <ArrowsDownUpIcon className="text-muted-foreground/50 ml-1 inline size-3" />;
}

function UserDashboard() {
  const loaderData = Route.useLoaderData();

  const allUsers: UserRow[] = useMemo(
    () =>
      (loaderData?.users ?? []).map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role ?? "user",
        banned: u.banned ?? false,
        banReason: u.banReason ?? "Reason not set",
        createdAt: u.createdAt,
        image: u.image ?? null,
      })),
    [loaderData],
  );

  const [search, setSearch] = useState("");

  // Client-side filter (no globalFilteringFeature needed)
  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return allUsers;
    return allUsers.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }, [allUsers, search]);

  const table = useTable({
    features: userFeatures,
    columns: userColumns,
    data: filteredUsers,
  });

  const headerGroups = table.getHeaderGroups();
  const rows = table.getRowModel().rows;

  const canPrevPage = table.getCanPreviousPage();
  const canNextPage = table.getCanNextPage();
  const pageCount = table.getPageCount();
  const pageIndex = table.state.pagination.pageIndex;

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
            Users
          </h1>
          <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-7">
            View and manage all registered users.
          </p>
          <div className="mt-8 flex flex-wrap gap-6">
            <div className="border-border border px-5 py-3">
              <p className="text-muted-foreground text-xs tracking-widest uppercase">Total users</p>
              <p className="text-primary mt-1 font-serif text-3xl">{allUsers.length}</p>
            </div>
            <div className="border-border border px-5 py-3">
              <p className="text-muted-foreground text-xs tracking-widest uppercase">Admins</p>
              <p className="text-primary mt-1 font-serif text-3xl">
                {allUsers.filter((u) => u.role === "admin").length}
              </p>
            </div>
            <div className="border-border border px-5 py-3">
              <p className="text-muted-foreground text-xs tracking-widest uppercase">Banned</p>
              <p className="text-primary mt-1 font-serif text-3xl">
                {allUsers.filter((u) => u.banned).length}
              </p>
            </div>
          </div>
        </section>
      </div>

      <Outlet />

      <section className="mx-auto w-full max-w-7xl px-5 py-10 md:px-10">
        <div className="mb-6 flex items-center gap-3">
          <input
            type="search"
            placeholder="Filter by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring w-full max-w-sm border px-3 py-2 text-sm outline-none focus:ring-1"
          />
          <span className="text-muted-foreground ml-auto hidden text-xs md:block">
            {filteredUsers.length} / {allUsers.length} users
          </span>
        </div>

        <div className="border-border border">
          <Table>
            <TableHeader>
              {headerGroups.map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sorted = header.column.getIsSorted();
                    return (
                      <TableHead
                        key={header.id}
                        className="text-muted-foreground py-3 text-xs tracking-widest uppercase"
                      >
                        {canSort ? (
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            className="hover:[&>svg]:text-accent flex cursor-pointer items-center px-2 select-none"
                          >
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
              {rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={userColumns.length}
                    className="text-muted-foreground py-16 text-center text-xs"
                  >
                    No users match your filter.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((row) => (
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

        {pageCount >= 1 && (
          <div className="mt-6 flex items-center justify-between gap-4">
            <span className="text-muted-foreground text-xs">
              Page {pageIndex + 1} of {pageCount}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!canPrevPage}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!canNextPage}
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
