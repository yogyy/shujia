import {
  BellIcon,
  BookmarksIcon,
  IdentificationCardIcon,
  SignOutIcon,
} from "@phosphor-icons/react";
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
            <Avatar>
              <AvatarImage src={data?.user.image!} className="rounded-sm" alt={data?.user.name} />
              <AvatarFallback>{data?.user.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
          </Button>
        }
      />
      <DropdownMenuContent align="end" sideOffset={8}>
        <DropdownMenuGroup>
          <DropdownMenuItem disabled>
            <IdentificationCardIcon />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <BookmarksIcon />
            Bookmarks
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <BellIcon />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => authClient.signOut()}>
          <SignOutIcon />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
