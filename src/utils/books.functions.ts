import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm/pg-core/expressions";
import { createInsertSchema, createUpdateSchema } from "drizzle-orm/zod";
import * as z from "zod";
import { createDb } from "../db";
import { bookGenres, bookSuggestions, books } from "../db/schema/bookshelf.schema";

const genresSchema = z.array(z.number());

export const InsertBookGenreSchema = createInsertSchema(bookGenres);
const InsertBookSchema = createInsertSchema(books).extend({
  genres: genresSchema,
});
const updateBookSchema = createUpdateSchema(books).extend({
  genres: genresSchema.optional(),
});
const InsertSuggestionSchema = createInsertSchema(bookSuggestions);

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

export const addNewBook = createServerFn({ method: "POST" })
  .validator(InsertBookSchema)
  .handler(async ({ data }) => {
    const db = createDb(env.DATABASE_URL);
    const { genres, ...bookData } = data;

    return db.transaction(async (tx) => {
      const [book] = await tx.insert(books).values(bookData).returning({ id: books.id });

      await tx.insert(bookGenres).values(
        genres.map((genreId) => ({
          bookId: book.id,
          genreId,
        })),
      );

      return book;
    });
  });

export const updateBook = createServerFn({ method: "POST" })
  .validator(updateBookSchema)
  .handler(async ({ data }) => {
    const db = createDb(env.DATABASE_URL);

    await db.update(books).set(data).where(eq(books.id, data.id!));
    return { success: true };
  });

export const suggestBookEdit = createServerFn({ method: "POST" })
  .validator(InsertSuggestionSchema)
  .handler(async ({ data }) => {
    const db = createDb(env.DATABASE_URL);
    const result = await db.insert(bookSuggestions).values(data);
    return result;
  });
