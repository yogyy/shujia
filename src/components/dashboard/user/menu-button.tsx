import {
  DotsThreeVerticalIcon,
  PencilSimpleIcon,
  UserCheckIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { Fragment, useState } from "react";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { Textarea } from "#/components/ui/textarea";
import { authClient } from "#/lib/auth-client";
import { ConfirmationDialog } from "./confirmation-dialog";

import type { UserWithRole } from "better-auth/plugins";

type UserRowActionsProps = {
  user: Pick<UserWithRole, "id" | "email" | "banned" | "role">;
};

type Role = "user" | "editor" | "admin";

const ROLE_OPTIONS: { value: Role; label: string; icon: React.ReactNode }[] = [
  { value: "user", label: "User", icon: <UserIcon /> },
  { value: "editor", label: "Editor", icon: <PencilSimpleIcon /> },
  { value: "admin", label: "Admin", icon: <UserCheckIcon /> },
];

function isRole(value: string): value is Role {
  return ROLE_OPTIONS.some((option) => option.value === value);
}

export function UserRowActions({ user }: UserRowActionsProps) {
  const { data } = authClient.useSession();
  const [banDialog, setBanDialog] = useState(false);
  const [removeDialog, setRemoveDialog] = useState(false);
  const [banReason, setBanReason] = useState("");

  const isSelf = user.id === data?.user.id;
  const router = useRouter();

  const setRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: Role }) => {
      const { error } = await authClient.admin.setRole({ userId, role });
      if (error) throw new Error(error.message ?? "Failed to update role");
    },
    onSuccess: () => router.invalidate(),
    onError: (err) => toast.error(err.message),
  });

  const banMutation = useMutation({
    mutationFn: async () => {
      const { error } = user.banned
        ? await authClient.admin.unbanUser({ userId: user.id })
        : await authClient.admin.banUser({
            userId: user.id,
            banReason: banReason.trim() || undefined,
            // banExpiresIn
          });
      if (error) throw new Error(error.message ?? "Request failed");
    },
    onSuccess: async () => {
      toast.success(user.banned ? "User unbanned" : "User banned");
      setBanDialog(false);
      setBanReason("");
      await router.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const removeMutation = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.admin.removeUser({ userId: user.id });
      if (error) throw new Error(error.message ?? "Failed to remove user");
    },
    onSuccess: async () => {
      toast.success("User removed");
      setRemoveDialog(false);
      await router.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Fragment>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon" aria-label="User actions" />}
        >
          <DotsThreeVerticalIcon size={20} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem
              disabled
              // render={<Link to="/dashboard/users/$userId" params={{ userId: user.id }} />}
            >
              View details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.email)}>
              Copy email
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Change role</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Role</DropdownMenuLabel>
                    <DropdownMenuRadioGroup
                      value={user.role}
                      onValueChange={(value) => {
                        if (!isRole(value) || value === user.role) return;
                        setRole.mutate({ userId: user.id, role: value });
                      }}
                    >
                      {ROLE_OPTIONS.map(({ value, label, icon }) => (
                        <DropdownMenuRadioItem
                          key={value}
                          value={value}
                          disabled={isSelf || setRole.isPending || user.role === value}
                        >
                          {icon}
                          {label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuGroup>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuItem disabled={isSelf} onClick={() => setBanDialog(true)}>
              {user.banned ? "Unban user" : "Ban user"}
            </DropdownMenuItem>
            <DropdownMenuItem
              render={<Link to="/dashboard/user/session" search={{ userId: user.id }} />}
            >
              View sessions
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem
              variant="destructive"
              disabled={isSelf}
              onClick={() => setRemoveDialog(true)}
            >
              Delete user
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmationDialog
        open={banDialog}
        onOpenChange={(open) => {
          setBanDialog(open);
          if (!open) setBanReason("");
        }}
        title={user.banned ? "Unban this user?" : "Ban this user?"}
        description={`${user.email} ${
          user.banned
            ? "will be able to sign in again."
            : "will be signed out and blocked from signing in. You can unban them later."
        }`}
        isPending={banMutation.isPending}
        actionFn={() => banMutation.mutate()}
        actionLabel={user.banned ? "Unban" : "Ban"}
        actionVariant={user.banned ? "default" : "destructive"}
      >
        {!user.banned && (
          <Textarea
            aria-label="Ban reason"
            placeholder="Reason (optional)"
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            maxLength={200}
          />
        )}
      </ConfirmationDialog>

      <ConfirmationDialog
        open={removeDialog}
        onOpenChange={setRemoveDialog}
        title="Remove this user?"
        description={`${user.email} will be permanently deleted along with their sessions. This action cannot be undone.`}
        isPending={removeMutation.isPending}
        actionFn={() => removeMutation.mutate()}
        actionLabel={removeMutation.isPending ? "Removing…" : "Remove"}
      />
    </Fragment>
  );
}
