import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  user: {
    books: r.many.userBooks({
      from: r.user.id,
      to: r.userBooks.id,
    }),
  },

  books: {
    genres: r.many.bookGenres({
      from: r.books.id,
      to: r.bookGenres.bookId,
    }),
    userBooks: r.many.userBooks({
      from: r.books.id,
      to: r.userBooks.bookId,
    }),
  },

  bookGenres: {
    genre: r.one.genres({
      from: r.bookGenres.genreId,
      to: r.genres.id,
    }),
    book: r.one.books({
      from: r.bookGenres.bookId,
      to: r.books.id,
    }),
  },

  userBooks: {
    user: r.one.user({
      from: r.userBooks.userId,
      to: r.user.id,
    }),
    book: r.one.books({
      from: r.userBooks.bookId,
      to: r.books.id,
    }),
    tags: r.many.tags({
      from: r.userBooks.id,
      to: r.tags.userId,
    }),
  },
}));
