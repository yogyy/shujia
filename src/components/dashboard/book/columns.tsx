import { BookOpenIcon } from "@phosphor-icons/react";
import {
  createColumnHelper,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
} from "@tanstack/react-table";
import { formatDate } from "#/lib/utils.ts";
import { FormatBadge } from "../sub.tsx";
import { BookRowActions } from "./menu-button";

import type { Book } from "#/types.ts";

export type BookRow = {
  id: string;
  slug: string;
  title: string;
  author: string | null;
  coverUrl: string | null;
  bookFormat: Book["bookFormat"];
  status: Book["status"];
  createdAt: Date | string;
  creatorId: string;
  creatorName: string | null;
};

export const bookFeatures = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
});

export const bookColumnHelper = createColumnHelper<typeof bookFeatures, BookRow>();

const statusStyles: Record<Book["status"], string> = {
  pending: "border-accent/40 text-accent",
  published: "border-border text-muted-foreground",
  rejected: "border-destructive/40 text-destructive",
};

const statusLabels: Record<Book["status"], string> = {
  pending: "Pending",
  published: "Published",
  rejected: "Rejected",
};

export const bookColumns = bookColumnHelper.columns([
  bookColumnHelper.accessor("title", {
    header: "Title",
    cell: ({ row, getValue }) => (
      <div className="flex items-center gap-3">
        {row.original.coverUrl ? (
          <img
            src={row.original.coverUrl}
            alt={getValue()}
            className="border-border h-10 w-7 shrink-0 border object-cover"
          />
        ) : (
          <div className="border-border bg-muted flex h-10 w-7 shrink-0 items-center justify-center border">
            <BookOpenIcon className="text-muted-foreground size-3.5" />
          </div>
        )}
        <span className="text-foreground truncate font-medium">{getValue()}</span>
      </div>
    ),
  }),
  bookColumnHelper.accessor("author", {
    header: "Author",
    cell: ({ getValue }) => (
      <span className="text-muted-foreground truncate">{getValue() ?? "—"}</span>
    ),
  }),
  bookColumnHelper.accessor("bookFormat", {
    header: "Format",
    enableSorting: false,
    cell: ({ getValue }) => <FormatBadge format={getValue()} />,
  }),
  bookColumnHelper.accessor("status", {
    header: "Status",
    enableSorting: false,
    cell: ({ getValue }) => {
      const status = getValue();
      return (
        <span
          className={`rounded-sm border px-2 py-0.5 font-mono text-[10px] tracking-widest uppercase ${statusStyles[status]}`}
        >
          {statusLabels[status]}
        </span>
      );
    },
  }),
  bookColumnHelper.accessor("creatorName", {
    header: "Added by",
    enableSorting: false,
    cell: ({ row, getValue }) => (
      <span className="text-muted-foreground truncate text-xs">
        {getValue() ?? row.original.creatorId.slice(0, 8)}
      </span>
    ),
  }),
  bookColumnHelper.accessor("createdAt", {
    header: "Created At",
    cell: ({ getValue }) => (
      <span className="text-muted-foreground text-xs">{formatDate(getValue())}</span>
    ),
  }),
  bookColumnHelper.display({
    id: "action",
    cell: (info) => <BookRowActions book={info.row.original} />,
  }),
]);
