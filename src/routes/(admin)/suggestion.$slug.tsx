import { WarningCircleIcon } from "@phosphor-icons/react";
import { queryOptions, useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { cn } from "cn";
import { useState } from "react";
import { z } from "zod";
import { ChangesView } from "#/components/dashboard/suggestion/review-diff";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "#/components/ui/alert-dialog";
import { Button } from "#/components/ui/button";
import { Textarea } from "#/components/ui/textarea";
import { formatDate } from "#/lib/utils";
import {
  approveSuggestion,
  getSuggestionForReview,
  rejectSuggestion,
} from "#/utils/suggestion.functions";

const IdSchema = z.uuid();

export const Route = createFileRoute("/(admin)/suggestion/$slug")({
  params: {
    parse: (raw) => {
      const result = IdSchema.safeParse(raw.slug);
      // console.log(result);
      if (!result.success) throw notFound();
      return { slug: result.data };
    },
  },
  loader: ({ context, params }) => context.queryClient.query(reviewQuery(params.slug)),
  component: RouteComponent,
});

function RouteComponent() {
  const data = Route.useLoaderData();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      // Allow the close animation to finish before unmounting.
      setTimeout(() => navigate({ to: "/suggestion", resetScroll: false }), 150);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-4xl flex-col gap-0 overflow-hidden p-0 motion-reduce:duration-0 lg:min-w-fit">
        <AlertDialogHeader className="grid-cols-[1fr_auto] grid-rows-1 place-items-start gap-4 border-b px-5 py-4 text-left sm:px-7 sm:py-5">
          <AlertDialogTitle className="text-base leading-tight font-semibold tracking-tight sm:text-lg">
            {data.book?.title ?? "Suggestion review"}
          </AlertDialogTitle>
          <AlertDialogCancel variant="ghost" size="sm" className="text-destructive -mt-1 -mr-2">
            Close
          </AlertDialogCancel>
        </AlertDialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">
          <ReviewPage />
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const reviewQuery = (id: string) =>
  queryOptions({
    queryKey: ["suggestions", "review", id],
    queryFn: () => getSuggestionForReview({ data: { id } }),
  });

const TYPE_LABELS = {
  book_edit: "Edit book details",
  book_genres: "Edit book genres",
} as const;

const STATUS_STYLES = {
  pending: "bg-accent/10 text-accent",
  approved: "bg-primary/10 text-primary",
  rejected: "bg-destructive/10 text-destructive",
} as const;

const STATUS_LABELS = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
} as const;

function ReviewPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(reviewQuery(slug));
  const { suggestion: s, book, suggester, isStale, changes, genreChanges } = data;

  const { queryClient: qc } = Route.useRouteContext();
  const navigate = useNavigate();
  const [note, setNote] = useState("");

  const done = async () => {
    await qc.invalidateQueries({ queryKey: ["suggestions"] });
    await navigate({ to: "/suggestion" });
  };

  const approve = useMutation({
    mutationFn: () =>
      approveSuggestion({ data: { id: slug, reviewNote: note.trim() || undefined } }),
    onSuccess: done,
  });
  const reject = useMutation({
    mutationFn: () => rejectSuggestion({ data: { id: slug, reviewNote: note.trim() } }),
    onSuccess: done,
  });

  const busy = approve.isPending || reject.isPending;
  const error = approve.error ?? reject.error;
  const isPending = s.status === "pending";

  const onApprove = () => {
    if (
      isStale &&
      !window.confirm(
        "The book has changed since this suggestion was made. Approving may overwrite newer changes. Approve anyway?",
      )
    ) {
      return;
    }
    approve.mutate();
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-xl leading-tight font-semibold tracking-tight sm:text-2xl">
            {TYPE_LABELS[s.type]}
          </h1>
          <span
            className={cn("rounded-full px-2.5 py-1 text-xs font-medium", STATUS_STYLES[s.status])}
          >
            {STATUS_LABELS[s.status]}
          </span>
        </div>
        <p className="text-muted-foreground text-sm">
          Submitted by {suggester?.name ?? "a deleted user"} on {formatDate(s.createdAt)}
        </p>
        <p className="text-sm leading-6">
          Book: <span className="font-medium">{book?.title}</span>
        </p>
      </header>

      {isStale && isPending && (
        <div
          role="alert"
          className="border-accent/40 bg-accent/10 text-foreground flex gap-3 rounded-md border px-4 py-3 text-sm leading-6"
        >
          <WarningCircleIcon aria-hidden="true" className="text-accent mt-0.5 size-4 shrink-0" />
          <p>
            This book changed after the suggestion was made. Check the current values before
            approving, since newer changes may be overwritten.
          </p>
        </div>
      )}

      {s.note && (
        <section className="bg-muted/50 flex flex-col gap-1.5 rounded-md border px-4 py-3">
          <h2 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Submitter note
          </h2>
          <p className="text-sm leading-6 wrap-break-word whitespace-pre-wrap">{s.note}</p>
        </section>
      )}

      <section className="bg-card overflow-hidden rounded-md border">
        <h2 className="border-b px-4 py-3 text-sm font-semibold tracking-tight">Changes</h2>
        <ChangesView changes={changes} book={book} genreChanges={genreChanges} />
      </section>

      {isPending ? (
        <section className="flex flex-col gap-3">
          <label htmlFor="reviewNote" className="text-sm font-medium">
            Review note{" "}
            <span className="text-muted-foreground font-normal">(required to reject)</span>
          </label>
          <Textarea
            id="reviewNote"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="Add a reason to reject; optional for approval"
            className="bg-background min-h-24 resize-y rounded-md leading-6"
          />

          {error && (
            <p role="alert" className="text-destructive text-sm">
              {error.message}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              onClick={onApprove}
              disabled={busy}
              className="active:scale-[0.98] motion-reduce:active:scale-100"
            >
              {approve.isPending ? "Approving..." : "Approve suggestion"}
            </Button>
            <Button
              type="button"
              onClick={() => reject.mutate()}
              disabled={busy || note.trim().length === 0}
              variant="destructive"
              className="active:scale-[0.98] motion-reduce:active:scale-100"
            >
              {reject.isPending ? "Rejecting..." : "Reject suggestion"}
            </Button>
          </div>
        </section>
      ) : (
        <section className="bg-muted/50 flex flex-col gap-1 rounded-md border px-4 py-3 text-sm">
          <h2 className="font-medium">Review result</h2>
          <p className="text-muted-foreground">Reviewed on {formatDate(s.reviewedAt!)}</p>
          {s.reviewNote && <p className="mt-2 whitespace-pre-wrap">{s.reviewNote}</p>}
        </section>
      )}
    </div>
  );
}
