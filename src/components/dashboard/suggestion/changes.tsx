import { ArrowRightIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { FormatBadge } from "../sub.tsx";
import { BOOK_EDIT_FIELDS } from "./meta.ts";

import type { BookEditField, SuggestionItem } from "./meta.ts";

export function ChangesSummary({ item }: { item: SuggestionItem }) {
  const { changes } = item;

  if (changes.type === "book_edit") {
    const rows = BOOK_EDIT_FIELDS.filter(({ key }) => changes[key] !== undefined);

    if (rows.length === 0) {
      return <p className="text-muted-foreground text-xs">No field changes in this suggestion.</p>;
    }

    return (
      <dl className="border-border divide-border divide-y border">
        {rows.map(({ key, label }) => (
          <div key={key} className="grid gap-1 px-3 py-2 sm:grid-cols-[7rem_1fr] sm:items-center">
            <dt className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase">
              {label}
            </dt>
            <dd className="min-w-0">
              <BookEditValue field={key} value={changes[key]} />
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  if (changes.type === "book_genres") {
    const added = changes.addGenreIds?.length ?? 0;
    const removed = changes.removeGenreIds?.length ?? 0;
    const proposed = changes.newGenres ?? [];

    if (added + removed + proposed.length === 0) {
      return <p className="text-muted-foreground text-xs">No genre changes in this suggestion.</p>;
    }

    return (
      <div className="flex flex-wrap items-center gap-1.5">
        {removed > 0 ? <Chip tone="remove">−{plural(removed, "genre")}</Chip> : null}
        {added > 0 ? <Chip tone="add">+{plural(added, "genre")}</Chip> : null}
        {proposed.map((genre) => (
          <Chip key={genre.name} tone="new">
            + {genre.name}
          </Chip>
        ))}
      </div>
    );
  }

  return null;
}

export function ReviewChanges({ item }: { item: SuggestionItem }) {
  const { changes } = item;

  if (changes.type === "book_edit") {
    const rows = BOOK_EDIT_FIELDS.filter(({ key }) => changes[key] !== undefined);

    if (rows.length === 0) {
      return <p className="text-muted-foreground text-xs">No field changes in this suggestion.</p>;
    }

    return (
      <dl className="border-border divide-border divide-y border">
        {rows.map(({ key, label }) => (
          <div key={key} className="grid gap-1.5 px-3 py-2">
            <dt className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase">
              {label}
            </dt>
            <dd className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <BookEditValue field={key} value={item.book?.[key]} />
              </div>
              <ArrowRightIcon className="text-muted-foreground size-3 shrink-0" />
              <div className="min-w-0 flex-1">
                <BookEditValue field={key} value={changes[key]} />
              </div>
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  if (changes.type === "book_genres") {
    const removed = item.genreChanges?.removed ?? [];
    const added = item.genreChanges?.added ?? [];
    const proposed = changes.newGenres ?? [];

    if (removed.length + added.length + proposed.length === 0) {
      return <p className="text-muted-foreground text-xs">No genre changes in this suggestion.</p>;
    }

    const hasMissing = [...removed, ...added].some((genre) => genre.name === null);

    return (
      <div className="flex flex-col gap-2 p-1">
        <pre>{JSON.stringify(item.genreChanges, null, 4)}</pre>
        {removed.length > 0 ? (
          <GenreGroup label="Remove">
            {removed.map((genre) => (
              <Chip key={`remove-${genre.id}`} tone="remove">
                − {genre.name ?? `#${genre.id}`}
              </Chip>
            ))}
          </GenreGroup>
        ) : null}
        {added.length > 0 ? (
          <GenreGroup label="Add">
            {added.map((genre) => (
              <Chip key={`add-${genre.id}`} tone="add">
                + {genre.name ?? `#${genre.id}`}
              </Chip>
            ))}
          </GenreGroup>
        ) : null}
        {proposed.length > 0 ? (
          <GenreGroup label="Create">
            {proposed.map((genre) => (
              <Chip key={`new-${genre.name}`} tone="new">
                + {genre.name}
              </Chip>
            ))}
          </GenreGroup>
        ) : null}
        {hasMissing ? (
          <p className="text-muted-foreground text-xs">
            A genre in this suggestion no longer exists and will be skipped.
          </p>
        ) : null}
      </div>
    );
  }

  return null;
}

function GenreGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-muted-foreground w-14 shrink-0 font-mono text-[10px] tracking-widest uppercase">
        {label}
      </span>
      {children}
    </div>
  );
}

function BookEditValue({
  field,
  value,
}: {
  field: BookEditField;
  value: string | number | null | undefined;
}) {
  if (value === undefined) return null;

  if (value === null || value === "") {
    return (
      <span className="text-muted-foreground/70 font-mono text-[10px] tracking-widest uppercase">
        Cleared
      </span>
    );
  }

  if (field === "coverUrl") {
    return (
      <img
        src={String(value)}
        alt="Proposed cover"
        className="border-border h-16 w-11 border object-cover"
        loading="lazy"
      />
    );
  }

  if (field === "bookFormat") return <FormatBadge format={String(value)} />;

  // if (field === "description") {
  //   return <p className="text-foreground/80 line-clamp-3 text-sm leading-6">{String(value)}</p>;
  // }

  if (field === "totalPages") {
    return <span className="text-sm">{String(value)} pages</span>;
  }

  return <span className="text-sm">{String(value)}</span>;
}

function Chip({ tone, children }: { tone: "add" | "remove" | "new"; children: React.ReactNode }) {
  const tones = {
    add: "border-emerald-500/40 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400",
    remove: "border-destructive/40 bg-destructive/5 text-destructive",
    new: "border-accent/40 bg-accent/5 text-accent",
  } as const;

  return <span className={cn("border px-1.5 py-0.5 text-xs", tones[tone])}>{children}</span>;
}

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}
