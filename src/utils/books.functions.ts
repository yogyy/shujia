import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm/pg-core/expressions";
import { createInsertSchema, createUpdateSchema } from "drizzle-orm/zod";
import * as z from "zod";
import { createDb } from "../db";
import { bookGenres, books } from "../db/schema/bookshelf.schema";
import { suggestions } from "../db/schema/suggestion.schema";
import { ensureSession } from "./auth.functions";

import type { InferSelectModel } from "drizzle-orm";

const genresSchema = z.array(z.number());

export type Book = InferSelectModel<typeof books>;

// ── Suggestion changes: discriminated union matching SuggestionChanges type ──
const BookEditChangesSchema = z.object({
  type: z.literal("book_edit"),
  title: z.string().min(1).optional(),
  author: z.string().nullable().optional(),
  coverUrl: z.string().nullable().optional(),
  totalPages: z.number().int().positive().nullable().optional(),
  description: z.string().nullable().optional(),
  bookFormat: z.enum(["physical", "ebook", "audiobook"]).optional(),
});

const BookGenresChangesSchema = z.object({
  type: z.literal("book_genres"),
  addGenreIds: z.array(z.number().int()).optional(),
  removeGenreIds: z.array(z.number().int()).optional(),
  newGenres: z
    .array(z.object({ name: z.string().min(1), slug: z.string().min(1).optional() }))
    .optional(),
});

const NewGenreChangesSchema = z.object({
  type: z.literal("new_genre"),
  name: z.string().min(1),
  slug: z.string().min(1),
});

const SuggestionChangesSchema = z.discriminatedUnion("type", [
  BookEditChangesSchema,
  BookGenresChangesSchema,
  NewGenreChangesSchema,
]);

const InsertSuggestionSchema = createInsertSchema(suggestions)
  .extend({ changes: SuggestionChangesSchema })
  .refine((d) => d.changes.type === "new_genre" || d.bookId != null, {
    message: "bookId is required for book_edit and book_genres",
    path: ["bookId"],
  });

export const InsertBookGenreSchema = createInsertSchema(bookGenres);
const InsertBookSchema = createInsertSchema(books).extend({
  genres: genresSchema,
});
const updateBookSchema = createUpdateSchema(books).extend({
  genres: genresSchema.optional(),
});

const getBookSchema = z.object({
  query: z.string().min(3),
});

export const insertBookGenres = createServerFn({ method: "POST" })
  .validator(z.array(InsertBookGenreSchema))
  .handler(async ({ data }) => {
    try {
      const db = createDb(env.DATABASE_URL);
      const result = await db.insert(bookGenres).values(data);
      return result;
    } catch (error) {
      console.error(error);
    }
  });

export const getLatestBooks = createServerFn({ method: "GET" }).handler(async () => {
  const db = createDb(env.DATABASE_URL);
  const books = (
    await db.query.books.findMany({
      orderBy: { createdAt: "desc" },
      with: {
        genres: {
          with: { genre: true },
        },
      },
      columns: { description: false },
      limit: 12,
    })
  ).map(({ genres, ...book }) => ({
    ...book,
    genres: genres.map(({ genre }) => genre),
  }));

  return books;
});

export const getBookByTitle = createServerFn({ method: "GET" })
  .validator(getBookSchema)
  .handler(async ({ data }) => {
    const db = createDb(env.DATABASE_URL);
    const books = await db.query.books.findMany({
      where: { title: { ilike: `%${data.query}%` } },
      columns: { description: false },
    });

    return books;
  });

export const getBookByAuthor = createServerFn({ method: "GET" })
  .validator(getBookSchema)
  .handler(async ({ data }) => {
    const db = createDb(env.DATABASE_URL);
    const books = await db.query.books.findMany({
      where: {
        author: {
          ilike: `%${data.query}%`,
        },
      },
    });
    return books;
  });

export const addNewBook = createServerFn({ method: "POST" })
  .validator(InsertBookSchema)
  .handler(async ({ data }) => {
    const db = createDb(env.DATABASE_URL);
    const { genres, ...bookData } = data;

    return db.transaction(async (tx) => {
      const [book] = await tx
        .insert(books)
        .values(bookData)
        .returning({ id: books.id, title: books.title })
        .onConflictDoNothing();

      if (!book) {
        setResponseStatus(409);
        throw new Error("Book already exists");
      }

      if (genres.length > 0) {
        await tx.insert(bookGenres).values(
          genres.map((genreId) => ({
            bookId: book.id,
            genreId,
          })),
        );
      }

      return Response.json({ success: true, data: book });
    });
  });

export const updateBook = createServerFn({ method: "POST" })
  .validator(updateBookSchema)
  .handler(async ({ data }) => {
    const db = createDb(env.DATABASE_URL);

    const { user } = await ensureSession();
    if (user.role !== "admin") throw new Error("Unauthorized");

    await db.update(books).set(data).where(eq(books.id, data.id!));
    return { success: true };
  });

export const deleteBook = createServerFn({ method: "POST" })
  .validator((bookId: string) => bookId)
  .handler(async ({ data }) => {
    const db = createDb(env.DATABASE_URL);

    const { user } = await ensureSession();
    if (user.role !== "admin") throw new Error("Unauthorized");

    await db.delete(books).where(eq(books.id, data));
    return { success: true };
  });

export const getBookDetails = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data }) => {
    const db = createDb(env.DATABASE_URL);
    const book = await db.query.books.findFirst({
      where: { slug: data },
      with: {
        genres: {
          with: { genre: true },
        },
      },
    });

    if (!book) throw notFound();

    const { genres, ...rest } = book;
    return { ...rest, genres: genres.map(({ genre }) => genre).filter((g) => g !== null) };
  });

export const createSuggestion = createServerFn({ method: "POST" })
  .validator(InsertSuggestionSchema)
  .handler(async ({ data }) => {
    const db = createDb(env.DATABASE_URL);
    const result = await db.insert(suggestions).values(data);
    return result;
  });
