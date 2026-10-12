import { pgTableCreator } from "drizzle-orm/pg-core";

export const shujiaTable = pgTableCreator((name) => `shujia_${name}`);
