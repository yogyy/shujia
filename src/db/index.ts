import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { relations } from "./relations";
import { authRelations } from "./schema";

export function createDb(databaseUrl: string) {
  const client = postgres(databaseUrl, {
    prepare: false,
    max: 1,
  });

  return drizzle({ client, relations: { ...relations, ...authRelations } });
}
