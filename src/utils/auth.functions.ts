import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import * as z from "zod/mini";
import { auth } from "@/lib/auth";

const TurnstileSchema = z.object({ token: z.string() });

/**
 * Verifies a Cloudflare Turnstile token server-side.
 * Throws if the token is invalid so callers can abort early.
 */
export const verifyTurnstile = createServerFn({ method: "POST" })
  .validator(TurnstileSchema)
  .handler(async ({ data }) => {
    const body = new FormData();
    body.append("secret", env.TURNSTILE_SECRET_KEY);
    body.append("response", data.token);

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
    });

    const result = (await res.json()) as { success: boolean; "error-codes"?: string[] };

    if (!result.success) {
      throw new Error(`CAPTCHA verification failed: ${(result["error-codes"] ?? []).join(", ")}`);
    }

    return { success: true };
  });

export const getSessionFn = createServerFn({ method: "GET" }).handler(async () => {
  const headers = getRequestHeaders();
  const session = await auth(env).api.getSession({ headers });

  return session;
});

export const ensureSessionFn = createServerFn({ method: "GET" }).handler(async () => {
  const headers = getRequestHeaders();
  const session = await auth(env).api.getSession({ headers });

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
});

export const roles = {
  USER: "user",
  ADMIN: "admin",
  EDITOR: "editor",
} as const;

type Role = (typeof roles)[keyof typeof roles];

export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  const hierarchy = {
    [roles.USER]: 0,
    [roles.EDITOR]: 1,
    [roles.ADMIN]: 2,
  };

  return hierarchy[userRole] >= hierarchy[requiredRole];
}

export const getSessionMiddleware = createMiddleware().server(async ({ next }) => {
  const session = await auth(env).api.getSession({ headers: getRequestHeaders() });

  return next({ context: session });
});

export const requireAuth = createMiddleware({ type: "function" })
  .middleware([getSessionMiddleware])
  .server(async ({ next, context }) => {
    if (!context) throw new Error("Unauthorized");

    return next({ context: { user: context.user } });
  });

export const requireReviewer = createMiddleware({ type: "function" })
  .middleware([requireAuth])
  .server(async ({ next, context }) => {
    const role = context.user.role;
    if (role !== "admin" && role !== "editor") {
      throw new Error("Forbidden");
    }

    return next();
  });

export const requireAdmin = createMiddleware({ type: "function" })
  .middleware([requireAuth])
  .server(async ({ next, context }) => {
    if (context.user.role !== "admin") {
      throw new Error("Forbidden");
    }

    return next();
  });
