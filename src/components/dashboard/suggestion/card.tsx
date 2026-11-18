import { ChatCenteredIcon, CheckIcon, XIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "#/components/ui/button.tsx";
import { Textarea } from "#/components/ui/textarea.tsx";
import { formatDate } from "#/lib/utils.ts";
import { ConfirmationDialog } from "../confirmation-dialog.tsx";
import { ChangesSummary, ReviewChanges } from "./changes.tsx";
import { STATUS_META, TYPE_META } from "./meta.ts";

import type { ReviewAction, SuggestionItem } from "./meta.ts";

export function SuggestionCard({
  item,
  isMutating,
  onReview,
}: {
  item: SuggestionItem;
  isMutating: boolean;
  onReview: (id: string, action: ReviewAction, reviewNote?: string) => Promise<boolean>;
}) {
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState("");

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

          {item.note ? (
            <blockquote className="border-accent/40 text-muted-foreground mt-3 border-l-2 pl-3 text-sm leading-6 italic">
              {item.note}
            </blockquote>
          ) : null}
        </div>
      </div>

      <footer className="border-border/70 flex flex-wrap items-center justify-between gap-3 border-t px-4 py-2.5 md:px-5">
        {item.status === "pending" ? (
          <>
            <p className="text-muted-foreground text-xs">
              Approving applies this change to the live collection.
            </p>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setRejectOpen(true)}
                disabled={isMutating}
              >
                <XIcon data-icon="inline-start" />
                Reject
              </Button>
              <Button size="sm" onClick={() => setApproveOpen(true)} disabled={isMutating}>
                <CheckIcon data-icon="inline-start" />
                Approve
              </Button>
            </div>
          </>
        ) : (
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <StatusIcon className="size-3 shrink-0" />
              {item.status === "approved" ? "Approved" : "Rejected"}
              {item.reviewedAt ? ` on ${formatDate(item.reviewedAt)}` : ""}
            </p>
            {item.reviewNote ? (
              <p className="text-muted-foreground flex items-start gap-1.5 text-xs italic">
                <ChatCenteredIcon className="mt-px size-3 shrink-0" />
                {item.reviewNote}
              </p>
            ) : null}
          </div>
        )}
      </footer>

      <ConfirmationDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        title="Approve suggestion?"
        description={`This applies the ${typeMeta.verb} to "${heading}" right away. It cannot be undone from here.`}
        isPending={isMutating}
        actionLabel={isMutating ? "Applying…" : "Approve"}
        contentClassName="data-[size=default]:sm:max-w-md"
        actionFn={async () => {
          const ok = await onReview(item.id, "approve");
          if (ok) setApproveOpen(false);
        }}
      >
        <div className="border-border max-h-72 overflow-y-auto border">
          <ReviewChanges item={item} />
        </div>
      </ConfirmationDialog>

      <ConfirmationDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title="Reject suggestion?"
        description="The suggestion is kept for reference, but the collection is left untouched."
        isPending={isMutating}
        actionLabel={isMutating ? "Rejecting…" : "Reject"}
        actionFn={async () => {
          if (!rejectNote.trim()) {
            toast.error("Add a short reason before rejecting.");
            return;
          }

          const ok = await onReview(item.id, "reject", rejectNote.trim());
          if (ok) {
            setRejectNote("");
            setRejectOpen(false);
          }
        }}
      >
        <Textarea
          value={rejectNote}
          onChange={(event) => setRejectNote(event.target.value)}
          placeholder="Why is this suggestion being rejected?"
          rows={3}
          maxLength={500}
          aria-label="Rejection reason"
        />
      </ConfirmationDialog>
    </article>
  );
}
