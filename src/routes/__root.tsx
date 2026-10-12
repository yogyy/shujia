import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";
import { Toaster } from "sonner";
import { NotFound } from "#/components/not-found.tsx";
import devtools from "#/integrations/tanstack-query/devtools.tsx";
import appCss from "../styles.css?url";

import type { QueryClient } from "@tanstack/react-query";
interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "shūjià. — Books for the in-between",
      },
      {
        name: "description",
        content: "A considered collection of novels, essays, and poems.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="antialiased">
        <NuqsAdapter>{children}</NuqsAdapter>
        <Toaster
          position="top-center"
          expand
          toastOptions={{
            style: {
              background: "var(--color-background)",
              color: "var(--color-primary)",
              fontFamily: "var(--font-sans)",
              borderRadius: "2px",
              border: "1px solid var(--accent)",
            },
          }}
        />
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            devtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
