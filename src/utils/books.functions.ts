import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { createInsertSchema } from "drizzle-orm/zod";
import * as z from "zod/mini";
import { createDb } from "../db";
import { bookGenres, bookSuggestions, books } from "../db/schema/bookshelf.schema";

const InsertSuggestionSchema = createInsertSchema(bookSuggestions);
export const InsertBookGenreSchema = createInsertSchema(bookGenres);
const InsertBookSchema = createInsertSchema(books).extend({
  genres: z.array(z.number()),
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

export const suggestBookEdit = createServerFn({ method: "POST" })
  .validator(InsertSuggestionSchema)
  .handler(async ({ data }) => {
    const db = createDb(env.DATABASE_URL);
    const result = await db.insert(bookSuggestions).values(data);
    return result;
  });
