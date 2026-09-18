import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  user: {
    books: r.many.userBooks({ from: r.user.id, to: r.userBooks.userId }),
  },

  books: {
    genres: r.many.bookGenres({ from: r.books.id, to: r.bookGenres.bookId }),
    userBooks: r.many.userBooks({ from: r.books.id, to: r.userBooks.bookId }),
  },

  bookGenres: {
    genre: r.one.genres({ from: r.bookGenres.genreId, to: r.genres.id }),
    book: r.one.books({ from: r.bookGenres.bookId, to: r.books.id }),
  },

  userBooks: {
    user: r.one.user({ from: r.userBooks.userId, to: r.user.id }),
    book: r.one.books({ from: r.userBooks.bookId, to: r.books.id }),
    tags: r.many.userBookTags({ from: r.userBooks.id, to: r.userBookTags.userBookId }),
  },

  userBookTags: {
    userBook: r.one.userBooks({ from: r.userBookTags.userBookId, to: r.userBooks.id }),
    tag: r.one.tags({ from: r.userBookTags.tagId, to: r.tags.id }),
  },

  suggestions: {
    book: r.one.books({ from: r.suggestions.bookId, to: r.books.id }),
    suggestor: r.one.user({ from: r.suggestions.suggestedBy, to: r.user.id }),
    reviewer: r.one.user({ from: r.suggestions.reviewedBy, to: r.user.id }),
  },

  comments: {
    book: r.one.books({ from: r.comments.bookId, to: r.books.id }),
    author: r.one.user({ from: r.comments.userId, to: r.user.id }),
    parent: r.one.comments({ from: r.comments.parentId, to: r.comments.id }),
    replies: r.many.comments({ from: r.comments.id, to: r.comments.parentId }),
  },
}));
