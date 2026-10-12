import { createServerFn } from "@tanstack/react-start";
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

export const getSession = createServerFn({ method: "GET" }).handler(async () => {
  const headers = getRequestHeaders();
  const session = await auth(env).api.getSession({ headers });

  return session;
});

export const ensureSession = createServerFn({ method: "GET" }).handler(async () => {
  const headers = getRequestHeaders();
  const session = await auth(env).api.getSession({ headers });

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
});
