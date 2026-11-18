import type { books } from "./db/schema";
import type { SuggestionChanges } from "./db/schema/suggestion.schema";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type Book = InferSelectModel<typeof books>;
export type NewBook = InferInsertModel<typeof books>;

export type SuggestionStatus = "pending" | "approved" | "rejected";
export type SuggestionType = "book_edit" | "book_genres";

export type GenreLite = { id: number; name: string; slug: string };

/** A suggestion row joined with its book, submitter and reviewer. */
export type SuggestionRow = {
  id: string;
  bookId: string | null;
  type: SuggestionType;
  changes: SuggestionChanges;
  note: string | null;
  status: SuggestionStatus;
  reviewNote: string | null;
  reviewedAt: Date | string | null;
  createdAt: Date | string;

  bookSlug: string | null;
  bookTitle: string | null;
  bookAuthor: string | null;
  bookCoverUrl: string | null;
  bookTotalPages: number | null;
  bookDescription: string | null;
  bookFormat: "physical" | "ebook" | "audiobook" | null;

  submitterId: string | null;
  submitterName: string | null;
  reviewerName: string | null;
};

export type SuggestionListResult = {
  suggestions: SuggestionRow[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  stats: Record<SuggestionStatus, number>;
  /** Every genre, keyed by id — used to resolve add/remove genre names. */
  genresById: Record<string, GenreLite>;
  /** The book's genres as they exist right now, keyed by book id. */
  currentGenresByBook: Record<string, GenreLite[]>;
};
