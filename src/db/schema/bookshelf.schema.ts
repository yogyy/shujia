import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth.schema";

// Enums
export const bookStatusEnum = pgEnum("shujia_book_status", [
  "want_to_read",
  "reading",
  "finished",
  "dnf",
]);

export const bookFormatEnum = pgEnum("shujia_book_format", ["physical", "ebook", "audiobook"]);

export const visibilityEnum = pgEnum("shujia_visibility", ["private", "public", "unlisted"]);

export const suggestionStatusEnum = pgEnum("shujia_suggestion_status", [
  "pending",
  "approved",
  "rejected",
]);

const pgTable = pgTableCreator((name) => `shujia_${name}`);

export const books = pgTable(
  "books",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    slug: text("slug").notNull().unique(),
    bookFormat: bookFormatEnum("book_format").default("ebook"),

    title: text("title").notNull(),
    author: text("author"),
    coverUrl: text("cover_url"),
    totalPages: integer("total_pages"),
    description: text("description"),

    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, {
        onDelete: "restrict",
      }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("books_title_idx").on(table.title)],
);

export const genres = pgTable(
  "genres",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
  },
  (table) => [unique("genres_slug_unique").on(table.slug)],
);

export const bookGenres = pgTable(
  "book_genres",
  {
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, {
        onDelete: "cascade",
      }),

    genreId: integer("genre_id")
      .notNull()
      .references(() => genres.id, {
        onDelete: "cascade",
      }),
  },
  (table) => [
    primaryKey({
      columns: [table.bookId, table.genreId],
    }),
    index("book_genres_genre_id_idx").on(table.genreId),
  ],
);

export const userBooks = pgTable(
  "user_books",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, {
        onDelete: "cascade",
      }),

    status: bookStatusEnum("status").notNull().default("want_to_read"),

    visibility: visibilityEnum("visibility").notNull().default("private"),

    currentPage: integer("current_page").notNull().default(0),

    startedAt: timestamp("started_at"),
    finishedAt: timestamp("finished_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    unique("user_books_user_book_unique").on(table.userId, table.bookId),
    index("user_books_user_id_idx").on(table.userId),
    index("user_books_book_id_idx").on(table.bookId),
  ],
);

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    userBookId: uuid("user_book_id")
      .notNull()
      .references(() => userBooks.id, {
        onDelete: "cascade",
      }),

    page: integer("page"),
    content: text("content").notNull(),

    visibility: visibilityEnum("visibility").notNull().default("private"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("notes_user_id_idx").on(table.userId),
    index("notes_user_book_id_idx").on(table.userBookId),
  ],
);

export const tags = pgTable(
  "tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    name: text("name").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    unique("tags_user_name_unique").on(table.userId, table.name),
    index("tags_user_id_idx").on(table.userId),
  ],
);

export const userBookTags = pgTable(
  "user_book_tags",
  {
    userBookId: uuid("user_book_id")
      .notNull()
      .references(() => userBooks.id, {
        onDelete: "cascade",
      }),

    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, {
        onDelete: "cascade",
      }),
  },
  (table) => [primaryKey({ columns: [table.userBookId, table.tagId] })],
);

export const bookSuggestions = pgTable(
  "book_suggestions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, {
        onDelete: "cascade",
      }),
    suggestedBy: text("suggested_by").references(() => user.id, {
      onDelete: "set null",
    }),

    changes: jsonb("changes").notNull(),
    note: text("note"),
    status: suggestionStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("book_suggestions_book_id_idx").on(table.bookId)],
);
