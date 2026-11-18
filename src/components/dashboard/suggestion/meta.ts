import {
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  TagIcon,
  XCircleIcon,
} from "@phosphor-icons/react";

import type { SuggestionStatus, SuggestionType } from "#/types.ts";
import type { listSuggestions } from "#/utils/suggestion.functions.ts";
import type { Icon } from "@phosphor-icons/react";

export const PAGE_SIZE = 10;

export type SuggestionListResult = Awaited<ReturnType<typeof listSuggestions>>;
export type SuggestionItem = SuggestionListResult["items"][number];

export type StatusFilter = SuggestionStatus | "all";
export type TypeFilter = SuggestionType | "all";
export type ReviewAction = "approve" | "reject";

export const STATUS_TABS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
] as const satisfies ReadonlyArray<{ value: StatusFilter; label: string }>;

export const TYPE_OPTIONS = [
  { value: "all", label: "All types" },
  { value: "book_edit", label: "Book edits" },
  { value: "book_genres", label: "Genre changes" },
] as const satisfies ReadonlyArray<{ value: TypeFilter; label: string }>;

export const TYPE_META: Record<
  SuggestionType,
  { label: string; verb: string; icon: Icon; className: string }
> = {
  book_edit: {
    label: "Book edit",
    verb: "book edit",
    icon: BookOpenIcon,
    className: "border-border bg-muted/40 text-muted-foreground",
  },
  book_genres: {
    label: "Genres",
    verb: "genre change",
    icon: TagIcon,
    className: "border-border bg-muted/40 text-muted-foreground",
  },
};

export const STATUS_META: Record<
  SuggestionStatus,
  { label: string; icon: Icon; className: string }
> = {
  pending: {
    label: "Pending",
    icon: ClockIcon,
    className: "border-accent/40 bg-accent/5 text-accent",
  },
  approved: {
    label: "Approved",
    icon: CheckCircleIcon,
    className: "border-emerald-500/40 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400",
  },
  rejected: {
    label: "Rejected",
    icon: XCircleIcon,
    className: "border-destructive/40 bg-destructive/5 text-destructive",
  },
};

export const BOOK_EDIT_FIELDS = [
  { key: "title", label: "Title" },
  { key: "author", label: "Author" },
  { key: "coverUrl", label: "Cover" },
  { key: "totalPages", label: "Pages" },
  // { key: "description", label: "Description" },
  { key: "bookFormat", label: "Format" },
] as const;

export type BookEditField = (typeof BOOK_EDIT_FIELDS)[number]["key"];
