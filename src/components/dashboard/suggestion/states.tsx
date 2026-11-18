import { ChatCenteredIcon } from "@phosphor-icons/react";
import { Button } from "#/components/ui/button.tsx";
import { Skeleton } from "#/components/ui/skeleton.tsx";

import type { StatusFilter } from "./meta.ts";

export function EmptyQueue({ status, onShowAll }: { status: StatusFilter; onShowAll: () => void }) {
  return (
    <div className="border-border flex flex-col items-center justify-center border px-6 py-20 text-center">
      <span className="border-border text-muted-foreground/60 mb-4 flex size-12 items-center justify-center border">
        <ChatCenteredIcon className="size-5" weight="duotone" />
      </span>
      <h2 className="text-primary font-serif text-2xl tracking-tight">All clear.</h2>
      <p className="text-muted-foreground mt-2 max-w-xs text-sm leading-6">
        {status === "pending"
          ? "Nothing is waiting for review right now."
          : `No ${status === "all" ? "" : `${status} `}suggestions match this filter.`}
      </p>
      {status !== "all" ? (
        <Button variant="outline" size="sm" className="mt-5" onClick={onShowAll}>
          View all suggestions
        </Button>
      ) : null}
    </div>
  );
}

export function SuggestionListSkeleton() {
  return (
    <div className="border-border divide-border divide-y border">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex gap-4 p-4 md:p-5">
          <Skeleton className="hidden aspect-2/3 w-11 shrink-0 rounded-none sm:block" />
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20 rounded-none" />
              <Skeleton className="h-5 w-16 rounded-none" />
            </div>
            <Skeleton className="h-6 w-2/3 rounded-none" />
            <Skeleton className="h-3 w-1/3 rounded-none" />
            <Skeleton className="h-16 w-full rounded-none" />
          </div>
        </div>
      ))}
    </div>
  );
}
