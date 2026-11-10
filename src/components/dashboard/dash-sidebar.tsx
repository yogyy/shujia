import { BookOpenIcon, ChartBarIcon, UsersIcon, ChatCenteredIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "#/components/ui/sidebar.tsx";

const options = [
  {
    label: "Overview",
    to: "/dashboard",
    icon: ChartBarIcon,
    exact: true,
    items: [
      {
        label: "Books",
        to: "/dashboard/book",
        icon: BookOpenIcon,
        exact: true,
      },
      {
        label: "Users",
        to: "/dashboard/user",
        icon: UsersIcon,
        exact: true,
      },
    ],
  },
  {
    label: "Suggestion",
    to: "/suggestion",
    icon: ChatCenteredIcon,
    exact: true,
    items: [],
  },
];

export function DashboardSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-4">
        <span className="text-primary font-serif text-lg tracking-tight">Dashboard</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {options.map((opt) => {
                return (
                  <SidebarMenuItem key={opt.label}>
                    <SidebarMenuButton
                      render={
                        <Link
                          to={opt.to}
                          activeProps={{ className: "text-accent font-semibold" }}
                          className="flex items-center gap-2"
                        >
                          <opt.icon className="size-4" />
                          {opt.label}
                        </Link>
                      }
                    />
                    {opt.items.length ? (
                      <SidebarMenuSub>
                        {opt.items.map((item) => (
                          <SidebarMenuSubItem key={item.label}>
                            <SidebarMenuSubButton
                              render={
                                <Link
                                  to={item.to}
                                  activeProps={{
                                    className: "text-accent! font-semibold [&>svg]:text-accent!",
                                  }}
                                  activeOptions={{ exact: true }}
                                >
                                  <item.icon className="size-4" />
                                  {item.label}
                                </Link>
                              }
                            />
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    ) : null}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
