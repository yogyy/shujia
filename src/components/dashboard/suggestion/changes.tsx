import { cn } from "cn";
import { BOOK_EDIT_FIELDS } from "./meta.ts";

import type { SuggestionItem } from "./meta.ts";

export function ChangesSummary({ item }: { item: SuggestionItem }) {
  const summary = item.changeSummary;

  if (summary.type === "book_edit") {
    if (summary.fields.length === 0) {
      return <p className="text-muted-foreground text-xs">No field changes in this suggestion.</p>;
    }

    return (
      <p className="text-muted-foreground text-xs">
        Fields: {summary.fields
          .map((key) => BOOK_EDIT_FIELDS.find((field) => field.key === key)?.label ?? key)
          .join(" · ")}
      </p>
    );
  }

  if (summary.type === "book_genres") {
    const { added, removed, proposed } = summary;

    if (added + removed + proposed.length === 0) {
      return <p className="text-muted-foreground text-xs">No genre changes in this suggestion.</p>;
    }

    return (
      <div className="flex flex-wrap items-center gap-1.5">
        {removed > 0 ? <Chip tone="remove">−{plural(removed, "genre")}</Chip> : null}
        {added > 0 ? <Chip tone="add">+{plural(added, "genre")}</Chip> : null}
        {proposed.map((name) => (
          <Chip key={name} tone="new">
            + {name}
          </Chip>
        ))}
      </div>
    );
  }

  return null;
}

function Chip({ tone, children }: { tone: "add" | "remove" | "new"; children: React.ReactNode }) {
  const tones = {
    add: "border-success/40 bg-success/5 text-success",
    remove: "border-destructive/40 bg-destructive/5 text-destructive",
    new: "border-info/40 bg-info/5 text-info",
  } as const;

  return <span className={cn("border px-1.5 py-0.5 text-xs", tones[tone])}>{children}</span>;
}

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}
