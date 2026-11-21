import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import { count, desc, eq } from "drizzle-orm";
import { asc, ilike } from "drizzle-orm/pg-core/expressions";
import { z } from "zod";
import { createDb } from "#/db/index.ts";
import { user } from "#/db/schema/auth.schema.ts";
import { books } from "#/db/schema/bookshelf.schema.ts";
import { auth } from "#/lib/auth.ts";
import { requireAdmin } from "../auth.functions";

export const getAllUser = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const data = await auth(env).api.listUsers({
      query: {
        sortBy: "createdAt",
        sortDirection: "desc",
      },
      headers: getRequestHeaders(),
    });

    return data;
  });

const inputSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(100).optional(),
  sortBy: z.enum(["title", "author", "createdAt"]).default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

// di handler
const sortColumns = {
  title: books.title,
  author: books.author,
  createdAt: books.createdAt,
} as const;

export const getAllBooksAdmin = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .validator(inputSchema)
  .handler(async ({ data: { page, pageSize, search, sortBy, sortDir } }) => {
    const db = createDb(env.DATABASE_URL);
    const dir = sortDir === "asc" ? asc : desc;

    const where = search ? ilike(books.title, `%${search}%`) : undefined;

    const [rows, [{ total }]] = await Promise.all([
      db
        .select({
          id: books.id,
          slug: books.slug,
          title: books.title,
          author: books.author,
          coverUrl: books.coverUrl,
          bookFormat: books.bookFormat,
          status: books.status,
          createdAt: books.createdAt,
          creatorId: books.createdBy,
          creatorName: user.name,
        })
        .from(books)
        .leftJoin(user, eq(books.createdBy, user.id))
        .where(where)
        .orderBy(dir(sortColumns[sortBy]), dir(books.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      db.select({ total: count() }).from(books),
    ]);

    return {
      books: rows,
      total,
      page,
      pageSize,
      pageCount: Math.ceil(total / pageSize),
    };
  });
