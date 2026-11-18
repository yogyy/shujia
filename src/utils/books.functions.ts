import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm/pg-core/expressions";
import { createInsertSchema, createUpdateSchema } from "drizzle-orm/zod";
import * as z from "zod";
import { createDb } from "../db";
import { bookGenres, books } from "../db/schema/bookshelf.schema";
import { ensureSessionFn } from "./auth.functions";

const genresSchema = z.array(z.number());

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

    const { user } = await ensureSessionFn();
    if (user.role !== "admin") throw new Error("Unauthorized");

    await db.update(books).set(data).where(eq(books.id, data.id!));
    return { success: true };
  });

export const deleteBook = createServerFn({ method: "POST" })
  .validator((bookId: string) => bookId)
  .handler(async ({ data }) => {
    const db = createDb(env.DATABASE_URL);

    const { user } = await ensureSessionFn();
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
