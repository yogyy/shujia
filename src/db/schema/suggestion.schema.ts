import { index, jsonb, pgEnum, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth.schema.ts";
import { books } from "./bookshelf.schema.ts";
import { shujiaTable } from "./table.ts";

export const suggestionStatusEnum = pgEnum("shujia_suggestion_status", [
  "pending",
  "approved",
  "rejected",
]);

export const suggestionTypeEnum = pgEnum("shujia_suggestion_type", [
  "book_edit",
  "book_genres",
  "new_genre",
]);

// ── Changes payload (discriminated by `type`) ──────────────────────────
//
// book_edit   → patch scalar fields on `books`
// book_genres → attach existing genres (and optionally propose new ones)
// new_genre   → propose a brand-new genre entry
export type SuggestionChanges =
  | {
      type: "book_edit";
      title?: string;
      author?: string | null;
      coverUrl?: string | null;
      totalPages?: number | null;
      description?: string | null;
      bookFormat?: "physical" | "ebook" | "audiobook";
    }
  | {
      type: "book_genres";
      addGenreIds?: number[];
      removeGenreIds?: number[];
      newGenres?: { name: string; slug?: string }[];
    }
  | {
      type: "new_genre";
      name: string;
      slug: string;
    };

export const suggestions = shujiaTable(
  "suggestions",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    // Required for book_edit / book_genres, optional context for new_genre
    bookId: uuid("book_id").references(() => books.id, {
      onDelete: "cascade",
    }),

    suggestedBy: text("suggested_by").references(() => user.id, {
      onDelete: "set null",
    }),

    type: suggestionTypeEnum("type").notNull(),
    changes: jsonb("changes").$type<SuggestionChanges>().notNull(),

    // User's note / reason for the suggestion
    note: text("note"),

    status: suggestionStatusEnum("status").notNull().default("pending"),

    // Reviewer feedback (e.g. rejection reason)
    reviewNote: text("review_note"),
    reviewedBy: text("reviewed_by").references(() => user.id, {
      onDelete: "set null",
    }),
    reviewedAt: timestamp("reviewed_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("suggestions_book_id_idx").on(table.bookId),
    index("suggestions_status_idx").on(table.status),
    index("suggestions_type_idx").on(table.type),
    index("suggestions_suggested_by_idx").on(table.suggestedBy),
  ],
);
