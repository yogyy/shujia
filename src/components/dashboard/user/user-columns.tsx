import { InfoIcon, ShieldCheckIcon, UsersIcon } from "@phosphor-icons/react";
import {
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
} from "@tanstack/react-table";
import { Tooltip, TooltipContent, TooltipTrigger } from "#/components/ui/tooltip";
import { formatDate } from "#/lib/utils.ts";
import { UserRowActions } from "./menu-button";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  banReason: string;
  createdAt: string | Date;
  image: string | null;
};

export const userFeatures = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
});

export const userColumnHelper = createColumnHelper<typeof userFeatures, UserRow>();

export const userColumns = userColumnHelper.columns([
  userColumnHelper.accessor("name", {
    header: "Name",
    cell: ({ row, getValue }) => (
      <div className="flex items-center gap-2.5">
        {row.original.image ? (
          <img
            src={row.original.image}
            alt={getValue()}
            className="border-border size-7 shrink-0 rounded-full border object-cover"
          />
        ) : (
          <div className="border-border bg-muted flex size-7 shrink-0 items-center justify-center rounded-full border">
            <UsersIcon className="text-muted-foreground size-3.5" />
          </div>
        )}
        <span className="text-foreground truncate font-medium">{getValue()}</span>
      </div>
    ),
  }),
  userColumnHelper.accessor("email", {
    header: "Email",
    cell: (info) => <span className="text-muted-foreground truncate">{info.getValue()}</span>,
  }),
  userColumnHelper.accessor("role", {
    header: "Role",
    enableSorting: false,
    cell: (info) => <RoleBadge role={info.getValue()} />,
  }),
  userColumnHelper.accessor("banned", {
    header: "Status",
    enableSorting: false,
    cell: (info) =>
      info.getValue() ? (
        <p className="flex items-center gap-1">
          <span className="border-destructive/40 text-destructive bg-destructive/5 border px-1.5 py-0.5 text-xs">
            Banned
          </span>

          <Tooltip>
            <TooltipTrigger render={<button type="button" aria-label="Ban reason" />}>
              <InfoIcon size={14} className="text-foreground/70" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{info.row.original.banReason}</p>
            </TooltipContent>
          </Tooltip>
        </p>
      ) : (
        <span className="border border-emerald-500/40 bg-emerald-500/5 px-1.5 py-0.5 text-xs text-emerald-600 dark:text-emerald-400">
          Active
        </span>
      ),
  }),
  userColumnHelper.accessor("createdAt", {
    header: "Joined",
    cell: (info) => (
      <span className="text-muted-foreground text-xs">{formatDate(info.getValue())}</span>
    ),
  }),
  userColumnHelper.display({
    id: "action",
    cell: (info) => <UserRowActions user={info.row.original} />,
  }),
]);

export function RoleBadge({ role }: { role: string }) {
  if (role === "admin") {
    return (
      <span className="border-accent/40 text-accent bg-accent/5 flex w-fit items-center gap-1 border px-1.5 py-0.5 text-xs">
        <ShieldCheckIcon weight="fill" className="size-3" />
        Admin
      </span>
    );
  }
  if (role === "editor") {
    return (
      <span className="w-fit border border-amber-500/40 bg-amber-500/5 px-1.5 py-0.5 text-xs text-amber-600 dark:text-amber-400">
        Editor
      </span>
    );
  }
  return (
    <span className="border-border text-muted-foreground w-fit border px-1.5 py-0.5 text-xs capitalize">
      {role}
    </span>
  );
}
