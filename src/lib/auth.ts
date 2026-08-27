import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { betterAuth } from "better-auth/minimal";
import { admin, lastLoginMethod } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { ac, adminRole, editorRole, userRole } from "./permission";
import { createDb } from "@/db"; // your drizzle instance
import * as schema from "@/db/schema/auth.schema";

export const auth = (env: Cloudflare.Env) =>
  betterAuth({
    baseURL: env.BASE_URL,
    database: drizzleAdapter(createDb(env.DATABASE_URL!), {
      provider: "pg",
      schema,
    }),
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID!,
        clientSecret: env.GOOGLE_CLIENT_SECRET!,
      },
    },
    // },
    plugins: [
      admin({
        ac,
        roles: {
          user: userRole,
          editor: editorRole,
          admin: adminRole,
        },
        adminRoles: ["admin", "editor"],
      }),
      lastLoginMethod(),
      tanstackStartCookies(),
    ],
  });
