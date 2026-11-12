import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { createDb } from "#/db/index.ts";
import { user } from "#/db/schema/auth.schema.ts";
import { books } from "#/db/schema/bookshelf.schema.ts";
import { auth } from "#/lib/auth.ts";
import { ensureSession } from "../auth.functions";

async function requireAdmin() {
  const session = await ensureSession();

  if (session.user.role !== "admin") {
    throw new Error("Forbidden");
  }

  return session.user;
}

export const changeUserRole = createServerFn({ method: "POST" }).handler(async () => {
  const hasPermission = await auth(env).api.userHasPermission({
    body: {
      role: "admin",
      permissions: {
        user: ["set-role"],
      },
    },
  });
  console.log(hasPermission);
  return { success: true };
});

export const getAllUser = createServerFn({ method: "GET" }).handler(async () => {
  const headers = getRequestHeaders();
  const data = await auth(env).api.listUsers({
    query: {
      sortBy: "createdAt",
      sortDirection: "desc",
    },
    headers,
  });

  return data;
});

export const getAllBooksAdmin = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();

  const db = createDb(env.DATABASE_URL);

  const rows = await db
    .select({
      id: books.id,
      slug: books.slug,
      title: books.title,
      author: books.author,
      coverUrl: books.coverUrl,
      bookFormat: books.bookFormat,
      totalPages: books.totalPages,
      createdAt: books.createdAt,
      createdById: books.createdBy,
      creatorName: user.name,
      creatorEmail: user.email,
    })
    .from(books)
    .leftJoin(user, eq(books.createdBy, user.id))
    .orderBy(books.createdAt)
    .limit(20);

  return rows;
});

export const deleteBookAdmin = createServerFn({ method: "POST" })
  .validator((data: { bookId: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();

    const db = createDb(env.DATABASE_URL);
    await db.delete(books).where(eq(books.id, data.bookId));

    return { success: true };
  });
