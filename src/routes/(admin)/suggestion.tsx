import {
  ArrowClockwiseIcon,
  CaretLeftIcon,
  CaretRightIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { cn } from "cn";
import { useState } from "react";
import { toast } from "sonner";
import { Stat } from "#/components/dashboard/sub.tsx";
import { SuggestionCard } from "#/components/dashboard/suggestion/card.tsx";
import { PAGE_SIZE, STATUS_TABS, TYPE_OPTIONS } from "#/components/dashboard/suggestion/meta.ts";
import { EmptyQueue, SuggestionListSkeleton } from "#/components/dashboard/suggestion/states.tsx";
import { Button } from "#/components/ui/button.tsx";
import { NativeSelect, NativeSelectOption } from "#/components/ui/native-select.tsx";
import { Tabs, TabsList, TabsTrigger } from "#/components/ui/tabs.tsx";
import {
  approveSuggestion,
  getPendingSuggestionCount,
  listSuggestions,
  rejectSuggestion,
} from "#/utils/suggestion.functions.ts";

import type {
  ReviewAction,
  StatusFilter,
  TypeFilter,
} from "#/components/dashboard/suggestion/meta.ts";

export const Route = createFileRoute("/(admin)/suggestion")({
  component: SuggestionQueue,
});

function SuggestionQueue() {
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<StatusFilter>("pending");
  const [type, setType] = useState<TypeFilter>("all");
  const [page, setPage] = useState(1);

  const { data, isPending, isError, error, isPlaceholderData, isFetching, refetch } = useQuery({
    queryKey: ["admin", "suggestions", status, type, page],
    queryFn: () =>
      listSuggestions({
        data: {
          status: status === "all" ? undefined : status,
          type: type === "all" ? undefined : type,
          page,
          limit: PAGE_SIZE,
        },
      }),
    placeholderData: keepPreviousData,
  });

  const { data: pendingCount } = useQuery({
    queryKey: ["admin", "suggestions", "pending-count"],
    queryFn: () => getPendingSuggestionCount(),
  });

  const approve = useMutation({
    mutationFn: (id: string) => approveSuggestion({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "suggestions"] }),
  });

  const reject = useMutation({
    mutationFn: (input: { id: string; reviewNote: string }) => rejectSuggestion({ data: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "suggestions"] }),
  });

  const isMutating = approve.isPending || reject.isPending;

  async function handleReview(id: string, action: ReviewAction, reviewNote?: string) {
    try {
      if (action === "approve") {
        await approve.mutateAsync(id);
        toast.success("Suggestion approved.");
      } else {
        await reject.mutateAsync({ id, reviewNote: reviewNote ?? "" });
        toast.success("Suggestion rejected.");
      }
      return true;
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Something went wrong.");
      return false;
    }
  }

  return (
    <>
      <div className="border-border border-b">
        <section className="mx-auto max-w-7xl px-5 py-10 md:px-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-accent/10 text-accent border-accent/20 flex items-center gap-1.5 border px-2 py-1 text-xs font-medium tracking-widest uppercase">
              <ShieldCheckIcon weight="fill" className="size-3" />
              Admin
            </span>
            <span className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase">
              Review queue
            </span>
          </div>
          <h1 className="text-primary mt-4 font-serif text-4xl tracking-tight md:text-6xl">
            Suggestions
          </h1>
          <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-7">
            Community edits and genre changes. Approving a suggestion writes it to the collection
            immediately.
          </p>

          <div className="mt-8 flex flex-wrap gap-6">
            <Stat label="Pending review" value={pendingCount ?? 0} />
            <Stat label="In this view" value={data?.total ?? 0} />
          </div>
        </section>
      </div>

      <section className="mx-auto w-full max-w-7xl px-5 py-10 md:px-10">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Tabs
            value={status}
            onValueChange={(value) => {
              setStatus(value as StatusFilter);
              setPage(1);
            }}
          >
            <TabsList variant="line" aria-label="Filter suggestions by status">
              {STATUS_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <label htmlFor="suggestion-type" className="sr-only">
              Filter suggestions by type
            </label>
            <NativeSelect
              id="suggestion-type"
              size="sm"
              value={type}
              className="w-40"
              onChange={(event) => {
                setType(event.target.value as TypeFilter);
                setPage(1);
              }}
            >
              {TYPE_OPTIONS.map((option) => (
                <NativeSelectOption key={option.value} value={option.value}>
                  {option.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>

            <Button
              variant="outline"
              size="sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["admin", "suggestions"] })}
              disabled={isFetching}
            >
              <ArrowClockwiseIcon
                data-icon="inline-start"
                className={cn(isFetching && "animate-spin")}
              />
              Refresh
            </Button>
          </div>
        </div>

        {isPending ? (
          <SuggestionListSkeleton />
        ) : isError ? (
          <div className="border-destructive/30 bg-destructive/5 border px-6 py-12 text-center">
            <p className="text-destructive font-mono text-[10px] tracking-widest uppercase">
              Could not load suggestions
            </p>
            <p className="text-muted-foreground mt-2 text-sm">
              {error instanceof Error ? error.message : "Unknown error."}
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        ) : data && data.items.length > 0 ? (
          <>
            <div
              className={cn(
                "border-border divide-border divide-y border transition-opacity",
                isPlaceholderData && "opacity-60",
              )}
            >
              {data.items.map((item) => (
                <SuggestionCard
                  key={item.id}
                  item={item}
                  isMutating={isMutating}
                  onReview={handleReview}
                />
              ))}
            </div>

            {/* debug */}
            <pre>{JSON.stringify(data, null, 4)}</pre>

            {data.totalPages > 1 ? (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <span className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase">
                  Page {data.page} / {data.totalPages} · {data.total} total
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={data.page <= 1 || isPlaceholderData}
                  >
                    <CaretLeftIcon data-icon="inline-start" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((current) => Math.min(data.totalPages, current + 1))}
                    disabled={data.page >= data.totalPages || isPlaceholderData}
                  >
                    Next
                    <CaretRightIcon data-icon="inline-end" />
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <EmptyQueue
            status={status}
            onShowAll={() => {
              setStatus("all");
              setPage(1);
            }}
          />
        )}
      </section>
    </>
  );
}
