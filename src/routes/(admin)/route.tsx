import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { DashboardSidebar } from "#/components/dashboard/dash-sidebar.tsx";
import { Footer } from "#/components/section/footer.tsx";
import { Navbar } from "#/components/section/navbar.tsx";
import { RouterBreadcrumb } from "#/components/section/router-breadcrumb.tsx";
import { Separator } from "#/components/ui/separator.tsx";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "#/components/ui/sidebar.tsx";
import { getSession } from "#/utils/auth.functions.ts";

export const Route = createFileRoute("/(admin)")({
  beforeLoad: async () => {
    const session = await getSession();
    if (session?.user.role !== "admin") throw notFound();
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="bg-background text-foreground relative">
      <SidebarProvider className="flex flex-col">
        <Navbar />
        <div className="z-50 flex flex-1">
          <DashboardSidebar />
          <SidebarInset>
            <nav className="border-b">
              <div className="mx-auto flex max-w-7xl items-center gap-1 px-5 py-2 md:px-10">
                <SidebarTrigger className="-ml-1 rounded-xl" />
                <Separator orientation="vertical" className="mr-2 ml-1" />
                <RouterBreadcrumb />
              </div>
            </nav>
            <Outlet />
          </SidebarInset>
        </div>
      </SidebarProvider>
      <Footer />
    </main>
  );
}
