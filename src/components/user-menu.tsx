import {
  BellIcon,
  BookmarksIcon,
  EqualizerIcon,
  IdentificationCardIcon,
  SignOutIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { authClient } from "#/lib/auth-client.ts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DropdownMenuAvatar() {
  const { data } = authClient.useSession();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="rounded-xs">
            <Avatar className="rounded-sm">
              <AvatarImage className="rounded-sm" src={data?.user.image!} alt={data?.user.name} />
              <AvatarFallback className="rounded-sm">{data?.user.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
          </Button>
        }
      />
      <DropdownMenuContent align="end" sideOffset={8}>
        <DropdownMenuGroup>
          {data?.user.role === "admin" && (
            <>
              <DropdownMenuItem
                className="flex w-full cursor-pointer items-center gap-2"
                render={<Link to="/dashboard" />}
              >
                <EqualizerIcon />
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem disabled>
            <IdentificationCardIcon />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex w-full cursor-pointer items-center gap-2"
            render={<Link to="/bookmarks" />}
          >
            <BookmarksIcon />
            Bookmarks
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <BellIcon />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="w-full justify-baseline"
          onClick={() => authClient.signOut()}
          nativeButton
          render={<Button variant="ghost" />}
        >
          <SignOutIcon />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
