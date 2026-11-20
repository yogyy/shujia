import { ArrowRightIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { formatDate } from "#/lib/utils.ts";
import { ChangesSummary } from "./changes.tsx";
import { STATUS_META, TYPE_META } from "./meta.ts";

import type { SuggestionItem } from "./meta.ts";

export function SuggestionCard({ item }: { item: SuggestionItem }) {
  const typeMeta = TYPE_META[item.type];
  const statusMeta = STATUS_META[item.status];
  const TypeIcon = typeMeta.icon;
  const StatusIcon = statusMeta.icon;

  const heading = item.book?.title ?? "Deleted book";

  return (
    <article className="group bg-background hover:bg-muted/20 transition-colors">
      <div className="flex gap-4 p-4 md:p-5">
        <div className="hidden shrink-0 sm:block">
          <div className="border-border bg-muted relative aspect-2/3 w-11 overflow-hidden border">
            {item.book?.coverUrl ? (
              <img
                src={item.book.coverUrl}
                alt=""
                className="size-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <TypeIcon className="text-muted-foreground/50 size-4" />
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-1 border px-1.5 py-0.5 text-xs",
                typeMeta.className,
              )}
            >
              <TypeIcon className="size-3" />
              {typeMeta.label}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 border px-1.5 py-0.5 text-xs",
                statusMeta.className,
              )}
            >
              <StatusIcon className="size-3" />
              {statusMeta.label}
            </span>
            <span className="text-muted-foreground ml-auto font-mono text-[10px] tracking-wider tabular-nums">
              {formatDate(item.createdAt)}
            </span>
          </div>

          <h2 className="text-primary mt-2 font-serif text-xl leading-tight tracking-tight text-balance md:text-2xl">
            {heading}
          </h2>
          <p className="text-muted-foreground mt-1 text-xs">
            Submitted by{" "}
            <span className="text-foreground/80">{item.suggester?.name ?? "a deleted user"}</span>
          </p>

          <div className="mt-3">
            <ChangesSummary item={item} />
          </div>
        </div>
      </div>

      <footer className="border-border/70 flex flex-wrap items-center justify-between gap-3 border-t px-4 py-2.5 md:px-5">
        {item.status === "pending" ? (
          <Link
            to="/suggestion/$slug"
            params={{ slug: item.id }}
            resetScroll={false}
            className="text-primary inline-flex items-center gap-1.5 text-xs font-medium hover:underline"
          >
            Review suggestion
            <ArrowRightIcon aria-hidden="true" />
          </Link>
        ) : (
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <StatusIcon className="size-3 shrink-0" />
              {item.status === "approved" ? "Approved" : "Rejected"}
              {item.reviewedAt ? ` on ${formatDate(item.reviewedAt)}` : ""}
            </p>
          </div>
        )}
      </footer>
    </article>
  );
}
