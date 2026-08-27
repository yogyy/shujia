import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

export const statement = {
  ...defaultStatements,
  book: ["create", "update", "delete"],
  suggestion: ["create", "read", "review", "delete"],
  genre: ["create", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

// Regular Reader (default role)
export const userRole = ac.newRole({
  book: ["create"],
  suggestion: ["create"],
});

// Editor / Curator
export const editorRole = ac.newRole({
  book: ["create", "update"],
  suggestion: ["create", "read", "review"],
  genre: ["create"],
  user: ["get", "list"],
});

// Administrator
export const adminRole = ac.newRole({
  ...adminAc.statements,
  book: ["create", "update", "delete"],
  suggestion: ["create", "read", "review", "delete"],
  genre: ["create", "update", "delete"],
});
