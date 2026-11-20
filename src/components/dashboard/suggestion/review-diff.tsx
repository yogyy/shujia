import { cn } from "cn";

import type { SuggestionChanges } from "#/db/schema/index.ts";

type BookEditChanges = Extract<SuggestionChanges, { type: "book_edit" }>;
type EditableField = Exclude<keyof BookEditChanges, "type">;
type ReviewBook = Partial<Record<EditableField, unknown>>;
type ResolvedGenre = { id: number; name: string | null };

const FIELD_LABELS: Record<EditableField, string> = {
  title: "Title",
  author: "Author",
  coverUrl: "Cover",
  totalPages: "Total pages",
  description: "Description",
  bookFormat: "Format",
};
const FIELDS = Object.keys(FIELD_LABELS) as EditableField[];

function DiffRow({
  label,
  before,
  after,
  image,
  stacked,
}: {
  label: string;
  before: unknown;
  after: unknown;
  image?: boolean;
  stacked?: boolean;
}) {
  const show = (value: unknown) =>
    image && typeof value === "string" && value ? (
      <img src={value} alt="" className="h-24 w-auto rounded border object-cover" />
    ) : (
      <span className="min-w-0 wrap-break-word whitespace-pre-wrap">
        {value === null || value === undefined || value === "" ? "—" : String(value)}
      </span>
    );

  return (
    <div className="max-w-full min-w-0 overflow-x-auto border-b px-2 last:border-b-0">
      <div
        className={cn(
          "grid min-w-0 gap-2 py-3",
          stacked ? "grid-cols-1" : "min-w-xl grid-cols-[9rem_minmax(0,1fr)_minmax(0,1fr)] gap-4",
        )}
      >
        <div className="text-muted-foreground min-w-0 text-sm font-medium">{label}</div>
        <div className="bg-info/10 text-foreground min-w-0 rounded px-3 py-2 text-sm">
          <div className="text-info mb-1 text-xs">Current</div>
          {show(before)}
        </div>
        <div className="bg-success/10 text-foreground min-w-0 rounded px-3 py-2 text-sm">
          <div className="text-success mb-1 text-xs">Proposed</div>
          {show(after)}
        </div>
      </div>
    </div>
  );
}

function BookEditDiff({
  changes,
  book,
}: {
  changes: BookEditChanges;
  book: ReviewBook | null;
}) {
  const rows = FIELDS.filter((field) => changes[field] !== undefined);

  if (rows.length === 0) {
    return <p className="text-muted-foreground text-sm">This suggestion contains no changes.</p>;
  }

  return (
    <div>
      {rows.map((field) => (
        <DiffRow
          key={field}
          label={FIELD_LABELS[field]}
          before={book?.[field]}
          after={changes[field]}
          image={field === "coverUrl"}
          stacked={field === "description"}
        />
      ))}
    </div>
  );
}

function Chips({ items, tone }: { items: string[]; tone: "add" | "remove" | "new" }) {
  const { className, prefix } = {
    add: { className: "bg-success/10 text-success", prefix: "+" },
    remove: { className: "bg-destructive/10 text-destructive", prefix: "−" },
    new: { className: "bg-info/10 text-info", prefix: "✦" },
  }[tone];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className={cn("rounded-full px-3 py-1 text-sm", className)}>
          <span aria-hidden="true" className="mr-1">
            {prefix}
          </span>
          {item}
        </span>
      ))}
    </div>
  );
}

function GenresDiff({
  changes,
  genreChanges,
}: {
  changes: Extract<SuggestionChanges, { type: "book_genres" }>;
  genreChanges: { added: ResolvedGenre[]; removed: ResolvedGenre[] } | null;
}) {
  const add = changes.addGenreIds ?? [];
  const remove = changes.removeGenreIds ?? [];
  const proposed = changes.newGenres ?? [];
  const addedGenres = genreChanges?.added ?? add.map((id) => ({ id, name: null }));
  const removedGenres = genreChanges?.removed ?? remove.map((id) => ({ id, name: null }));

  if (add.length + remove.length + proposed.length === 0) {
    return <p className="text-muted-foreground text-sm">This suggestion contains no changes.</p>;
  }

  return (
    <div className="flex flex-col gap-4 p-2">
      {add.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-medium">Add genres</h3>
          <Chips items={addedGenres.map((genre) => genre.name ?? `#${genre.id}`)} tone="add" />
        </section>
      )}
      {remove.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-medium">Remove genres</h3>
          <Chips items={removedGenres.map((genre) => genre.name ?? `#${genre.id}`)} tone="remove" />
        </section>
      )}
      {proposed.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-medium">Proposed new genres</h3>
          <Chips items={proposed.map((genre) => genre.name)} tone="new" />
        </section>
      )}
    </div>
  );
}

export function ChangesView({
  changes,
  book,
  genreChanges,
}: {
  changes: SuggestionChanges;
  book: ReviewBook | null;
  genreChanges: { added: ResolvedGenre[]; removed: ResolvedGenre[] } | null;
}) {
  switch (changes.type) {
    case "book_edit":
      return <BookEditDiff changes={changes} book={book} />;
    case "book_genres":
      return <GenresDiff changes={changes} genreChanges={genreChanges} />;
    default: {
      const _exhaustive: never = changes;
      return _exhaustive;
    }
  }
}
