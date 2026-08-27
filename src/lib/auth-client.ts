import { adminClient, lastLoginMethodClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { ac, adminRole, editorRole, userRole } from "./permission";

export const { signIn, signUp, useSession, admin } = createAuthClient({
  plugins: [
    adminClient({
      ac,
      roles: {
        user: userRole,
        editor: editorRole,
        admin: adminRole,
      },
      adminRoles: ["admin", "editor"],
    }),
    lastLoginMethodClient(),
  ],
});
