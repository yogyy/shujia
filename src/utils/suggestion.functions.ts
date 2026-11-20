import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { and, count, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { createDb } from "#/db/index.ts";
import {
  bookGenres,
  books,
  genres,
  suggestions,
  suggestionStatusEnum,
  suggestionTypeEnum,
  user,
} from "#/db/schema/index.ts";
import { slugify } from "#/lib/utils.ts";
import { requireAuth, requireReviewer } from "./auth.functions";

const MAX_PENDING_PER_USER = 10;

const bookEditChanges = z.object({
  type: z.literal("book_edit"),
  title: z.string().min(1).max(255).optional(),
  author: z.string().max(255).nullable().optional(),
  coverUrl: z.url().nullable().optional(),
  totalPages: z.number().int().positive().nullable().optional(),
  description: z.string().max(5000).nullable().optional(),
  bookFormat: z.enum(["physical", "ebook", "audiobook"]).optional(),
});

const bookGenresChanges = z.object({
  type: z.literal("book_genres"),
  addGenreIds: z.array(z.number().int()).optional(),
  removeGenreIds: z.array(z.number().int()).optional(),
  // Slug is derived server-side at approval time; the client only proposes names.
  newGenres: z.array(z.object({ name: z.string().min(1).max(120) })).optional(),
});

export const suggestionChangesSchema = z.discriminatedUnion("type", [
  bookEditChanges,
  bookGenresChanges,
]);

const createSuggestionInput = z
  .object({
    bookId: z.uuid(),
    changes: suggestionChangesSchema,
    note: z.string().max(1000).optional(),
  })
  .superRefine((value, ctx) => {
    const changes = value.changes;

    if (changes.type === "book_edit") {
      const { type: _type, ...patch } = changes;
      if (Object.keys(patch).length === 0) {
        ctx.addIssue({
          code: "custom",
          message: "Suggestion has no field changes",
          path: ["changes"],
        });
      }
      return;
    }

    const added = changes.addGenreIds ?? [];
    const removed = changes.removeGenreIds ?? [];
    const proposed = changes.newGenres ?? [];

    if (added.length + removed.length + proposed.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Suggestion has no genre changes",
        path: ["changes"],
      });
    }

    if (added.some((id) => removed.includes(id))) {
      ctx.addIssue({
        code: "custom",
        message: "A genre cannot be added and removed in the same suggestion",
        path: ["changes"],
      });
    }
  });

const listInput = z.object({
  status: z.enum(suggestionStatusEnum.enumValues).optional(),
  type: z.enum(suggestionTypeEnum.enumValues).optional(),
  bookId: z.uuid().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

const idInput = z.object({ id: z.uuid() });

async function queryPage(input: z.infer<typeof listInput>, suggestedBy?: string) {
  const where = and(
    input.status ? eq(suggestions.status, input.status) : undefined,
    input.type ? eq(suggestions.type, input.type) : undefined,
    input.bookId ? eq(suggestions.bookId, input.bookId) : undefined,
    suggestedBy ? eq(suggestions.suggestedBy, suggestedBy) : undefined,
  );
  const db = createDb(env.DATABASE_URL);

  const [items, total] = await Promise.all([
    db
      .select({
        id: suggestions.id,
        type: suggestions.type,
        status: suggestions.status,
        changes: suggestions.changes,
        note: suggestions.note,
        reviewNote: suggestions.reviewNote,
        reviewedAt: suggestions.reviewedAt,
        createdAt: suggestions.createdAt,
        // The current row is returned alongside the proposal so reviewers can see
        // the before/after in the approve dialog without a second round trip.
        book: {
          id: books.id,
          title: books.title,
          coverUrl: books.coverUrl,
          author: books.author,
          totalPages: books.totalPages,
          description: books.description,
          bookFormat: books.bookFormat,
        },
        suggester: { id: user.id, name: user.name },
      })
      .from(suggestions)
      .leftJoin(books, eq(books.id, suggestions.bookId))
      .leftJoin(user, eq(user.id, suggestions.suggestedBy))
      .where(where)
      .orderBy(desc(suggestions.createdAt), desc(suggestions.id))
      .limit(input.limit)
      .offset((input.page - 1) * input.limit),
    db.$count(suggestions, where),
  ]);

  // Genre suggestions only carry ids; resolve names here so the UI never has to
  // thread a genre lookup table through the tree.
  const referencedGenreIds = new Set<number>();
  for (const item of items) {
    if (item.changes.type !== "book_genres") continue;
    for (const id of item.changes.addGenreIds ?? []) referencedGenreIds.add(id);
    for (const id of item.changes.removeGenreIds ?? []) referencedGenreIds.add(id);
  }

  const genreRows =
    referencedGenreIds.size > 0
      ? await db
          .select({ id: genres.id, name: genres.name })
          .from(genres)
          .where(inArray(genres.id, [...referencedGenreIds]))
      : [];

  const genreNames = new Map(genreRows.map((genre) => [genre.id, genre.name]));
  const resolveGenre = (id: number) => ({ id, name: genreNames.get(id) ?? null });

  const itemsWithGenres = items.map((item) => ({
    ...item,
    // null for book_edit; every genre id is resolved, with `name: null` when the
    // genre was deleted after submission.
    genreChanges:
      item.changes.type === "book_genres"
        ? {
            added: (item.changes.addGenreIds ?? []).map(resolveGenre),
            removed: (item.changes.removeGenreIds ?? []).map(resolveGenre),
          }
        : null,
  }));

  return {
    items: itemsWithGenres,
    total,
    page: input.page,
    limit: input.limit,
    totalPages: Math.max(1, Math.ceil(total / input.limit)),
  };
}

async function queryReviewQueuePage(input: z.infer<typeof listInput>) {
  const where = and(
    input.status ? eq(suggestions.status, input.status) : undefined,
    input.type ? eq(suggestions.type, input.type) : undefined,
    input.bookId ? eq(suggestions.bookId, input.bookId) : undefined,
  );
  const db = createDb(env.DATABASE_URL);

  const [rows, total] = await Promise.all([
    db
      .select({
        id: suggestions.id,
        type: suggestions.type,
        status: suggestions.status,
        changes: suggestions.changes,
        reviewedAt: suggestions.reviewedAt,
        createdAt: suggestions.createdAt,
        book: { title: books.title, coverUrl: books.coverUrl },
        suggester: { name: user.name },
      })
      .from(suggestions)
      .leftJoin(books, eq(books.id, suggestions.bookId))
      .leftJoin(user, eq(user.id, suggestions.suggestedBy))
      .where(where)
      .orderBy(desc(suggestions.createdAt), desc(suggestions.id))
      .limit(input.limit)
      .offset((input.page - 1) * input.limit),
    db.$count(suggestions, where),
  ]);

  const items = rows.map(({ changes, ...item }) => ({
    ...item,
    changeSummary:
      changes.type === "book_edit"
        ? { type: "book_edit" as const, fields: Object.keys(changes).filter((key) => key !== "type") }
        : {
            type: "book_genres" as const,
            added: changes.addGenreIds?.length ?? 0,
            removed: changes.removeGenreIds?.length ?? 0,
            proposed: changes.newGenres?.map((genre) => genre.name) ?? [],
          },
  }));

  return {
    items,
    total,
    page: input.page,
    limit: input.limit,
    totalPages: Math.max(1, Math.ceil(total / input.limit)),
  };
}

// ── Contributor ────────────────────────────────────────────────────────

export const createSuggestion = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator(createSuggestionInput)
  .handler(async ({ data, context }) => {
    const db = createDb(env.DATABASE_URL);

    const [{ pending }] = await db
      .select({ pending: count() })
      .from(suggestions)
      .where(and(eq(suggestions.suggestedBy, context.user.id), eq(suggestions.status, "pending")));

    if (pending >= MAX_PENDING_PER_USER) {
      throw new Error("Terlalu banyak saran yang masih menunggu review");
    }

    const [book] = await db
      .select({ id: books.id })
      .from(books)
      .where(eq(books.id, data.bookId))
      .limit(1);

    if (!book) throw new Error("Buku tidak ditemukan");

    const [row] = await db
      .insert(suggestions)
      .values({
        bookId: data.bookId,
        suggestedBy: context.user.id,
        // The column always mirrors the payload discriminator.
        type: data.changes.type,
        changes: data.changes,
        note: data.note,
      })
      .returning({ id: suggestions.id });

    return row;
  });

export const listMySuggestions = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .validator(listInput.omit({ bookId: true }))
  .handler(({ data, context }) => queryPage(data, context.user.id));

export const getSuggestion = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .validator(idInput)
  .handler(async ({ data, context }) => {
    const db = createDb(env.DATABASE_URL);
    const [row] = await db
      .select({
        suggestion: suggestions,
        book: { id: books.id, title: books.title, coverUrl: books.coverUrl },
      })
      .from(suggestions)
      .leftJoin(books, eq(books.id, suggestions.bookId))
      .where(and(eq(suggestions.id, data.id), eq(suggestions.suggestedBy, context.user.id)))
      .limit(1);

    if (!row) throw new Error("Suggestion not found");

    return row;
  });

export const withdrawSuggestion = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator(idInput)
  .handler(async ({ data, context }) => {
    const db = createDb(env.DATABASE_URL);

    const deleted = await db
      .delete(suggestions)
      .where(
        and(
          eq(suggestions.id, data.id),
          eq(suggestions.suggestedBy, context.user.id),
          eq(suggestions.status, "pending"),
        ),
      )
      .returning({ id: suggestions.id });

    if (deleted.length === 0) throw new Error("Saran tidak bisa ditarik");
    return { id: data.id };
  });

// ── Reviewer ───────────────────────────────────────────────────────────

export const listSuggestions = createServerFn({ method: "GET" })
  .middleware([requireReviewer])
  .validator(listInput)
  .handler(({ data }) => queryReviewQueuePage(data));

export const getPendingSuggestionCount = createServerFn({ method: "GET" })
  .middleware([requireReviewer])
  .handler(() => {
    const db = createDb(env.DATABASE_URL);

    return db.$count(suggestions, eq(suggestions.status, "pending"));
  });

export const getSuggestionForReview = createServerFn({ method: "GET" })
  .middleware([requireReviewer])
  .validator(idInput)
  .handler(async ({ data }) => {
    const db = createDb(env.DATABASE_URL);

    const [row] = await db
      .select({
        suggestion: suggestions,
        book: books, // kondisi buku saat ini, untuk diff
        suggester: { id: user.id, name: user.name },
      })
      .from(suggestions)
      .leftJoin(books, eq(books.id, suggestions.bookId))
      .leftJoin(user, eq(user.id, suggestions.suggestedBy))
      .where(eq(suggestions.id, data.id))
      .limit(1);

    if (!row) throw new Error("Suggestion not found");

    const { changes, ...suggestion } = row.suggestion;
    const referencedGenreIds =
      changes.type === "book_genres"
        ? [...new Set([...(changes.addGenreIds ?? []), ...(changes.removeGenreIds ?? [])])]
        : [];
    const genreRows =
      referencedGenreIds.length > 0
        ? await db
            .select({ id: genres.id, name: genres.name })
            .from(genres)
            .where(inArray(genres.id, referencedGenreIds))
        : [];
    const genreNames = new Map(genreRows.map((genre) => [genre.id, genre.name]));
    const resolveGenre = (id: number) => ({ id, name: genreNames.get(id) ?? null });

    return {
      ...row,
      suggestion,
      changes,
      genreChanges:
        changes.type === "book_genres"
          ? {
              added: (changes.addGenreIds ?? []).map(resolveGenre),
              removed: (changes.removeGenreIds ?? []).map(resolveGenre),
            }
          : null,
      // buku berubah setelah saran dibuat → diff mungkin basi
      isStale: !!row.book && row.book.updatedAt > row.suggestion.createdAt,
    };
  });

export const approveSuggestion = createServerFn({ method: "POST" })
  .middleware([requireReviewer])
  .validator(idInput.extend({ reviewNote: z.string().max(1000).optional() }))
  .handler(({ data, context }) => {
    const db = createDb(env.DATABASE_URL);

    return db.transaction(async (tx) => {
      // Klaim atomik: cegah double-approve / race condition
      const [s] = await tx
        .update(suggestions)
        .set({
          status: "approved",
          reviewedBy: context.user.id,
          reviewedAt: new Date(),
          reviewNote: data.reviewNote,
        })
        .where(and(eq(suggestions.id, data.id), eq(suggestions.status, "pending")))
        .returning();

      if (!s) throw new Error("Saran tidak ditemukan atau sudah direview");
      if (!s.bookId) throw new Error("Saran ini tidak terhubung ke buku mana pun");

      const c = s.changes;
      switch (c.type) {
        case "book_edit": {
          const { type: _type, ...patch } = c;
          // drizzle melempar error kalau set() kosong
          if (Object.keys(patch).length > 0) {
            await tx.update(books).set(patch).where(eq(books.id, s.bookId));
          }
          break;
        }
        case "book_genres": {
          const { addGenreIds = [], removeGenreIds = [], newGenres = [] } = c;

          const toAttach = new Set(addGenreIds.filter((id) => !removeGenreIds.includes(id)));

          // Get-or-create proposed genres, then attach them in the same transaction
          // so approving never leaves an orphan genre behind.
          for (const proposed of newGenres) {
            const name = proposed.name.trim();
            const slug = slugify(name) || name.toLowerCase();

            const [genre] = await tx
              .insert(genres)
              .values({ name, slug })
              .onConflictDoUpdate({ target: genres.slug, set: { name } })
              .returning({ id: genres.id });

            toAttach.add(genre.id);
          }

          if (removeGenreIds.length > 0) {
            await tx
              .delete(bookGenres)
              .where(
                and(eq(bookGenres.bookId, s.bookId), inArray(bookGenres.genreId, removeGenreIds)),
              );
          }

          if (toAttach.size > 0) {
            const ids = [...toAttach];
            // Skip ids whose genre was deleted after submission (avoids FK failure).
            const existing = await tx
              .select({ id: genres.id })
              .from(genres)
              .where(inArray(genres.id, ids));

            if (existing.length > 0) {
              await tx
                .insert(bookGenres)
                .values(existing.map(({ id }) => ({ bookId: s.bookId!, genreId: id })))
                .onConflictDoNothing();
            }
          }
          break;
        }
        default: {
          const _exhaustive: never = c;
          throw new Error(`Tipe saran tidak dikenal: ${String(_exhaustive)}`);
        }
      }

      return { id: s.id, status: s.status };
    });
  });

export const rejectSuggestion = createServerFn({ method: "POST" })
  .middleware([requireReviewer])
  .validator(idInput.extend({ reviewNote: z.string().min(1).max(1000) }))
  .handler(async ({ data, context }) => {
    const db = createDb(env.DATABASE_URL);
    const [s] = await db
      .update(suggestions)
      .set({
        status: "rejected",
        reviewedBy: context.user.id,
        reviewedAt: new Date(),
        reviewNote: data.reviewNote,
      })
      .where(and(eq(suggestions.id, data.id), eq(suggestions.status, "pending")))
      .returning({ id: suggestions.id, status: suggestions.status });

    if (!s) throw new Error("Saran tidak ditemukan atau sudah direview");
    return s;
  });
