import { WarningCircleIcon } from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { ConfirmationDialog } from "#/components/dashboard/user/confirmation-dialog";
import {
  SessionProfileCard,
  SessionProfileSkeleton,
} from "#/components/dashboard/user/session-profile-card";
import { Button } from "#/components/ui/button";
import { Skeleton } from "#/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table";
import { authClient } from "#/lib/auth-client";
import { formatDate, parseDevice } from "#/lib/utils";

const userIdSchema = z.object({
  userId: z.string().catch(""),
});

export const Route = createFileRoute("/(admin)/dashboard/user/session")({
  component: RouteComponent,
  validateSearch: userIdSchema,
});

function RouteComponent() {
  const { userId } = Route.useSearch();
  const { data: currentSession } = authClient.useSession();
  const { queryClient } = Route.useRouteContext();
  const [revokeAllOpen, setRevokeAllOpen] = useState<boolean>(false);

  const sessionQueryKey = ["sessions", userId];
  const isSelf = currentSession?.user.id === userId;

  const {
    data: user,
    isPending: userPending,
    isError: userError,
    error: userErrorCause,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const { data, error } = await authClient.admin.getUser({ query: { id: userId } });
      if (error || !data) throw new Error(error?.message ?? "User not found");
      return data;
    },
    enabled: !!userId,
  });

  const {
    data: sessions,
    isPending: sessionsPending,
    isError: sessionsError,
    error: sessionsErrorCause,
    refetch: refetchSessions,
  } = useQuery({
    queryKey: sessionQueryKey,
    queryFn: async () => {
      const { data, error } = await authClient.admin.listUserSessions({ userId });
      if (error || !data) throw new Error(error?.message ?? "Failed to load sessions");
      return data.sessions;
    },
    enabled: !!userId,
  });

  const revokeUserSessions = useMutation({
    mutationFn: async () => {
      if (isSelf) throw new Error("Cannot revoke current user");
      const { error } = await authClient.admin.revokeUserSessions({ userId });
      if (error) throw new Error(error.message ?? "Failed to revoke user sessions");
    },
    onSuccess: async () => {
      toast.success("User sessions revoked");
      setRevokeAllOpen(false);
      await queryClient.invalidateQueries({ queryKey: sessionQueryKey });
    },
    onError: (err) => toast.error(err.message, { id: "revoke-sessions-failed" }),
  });

  const revokeUserSession = useMutation({
    mutationFn: async (sessionToken: string) => {
      if (currentSession?.session.token === sessionToken) {
        throw new Error("Cannot revoke your current session");
      }
      const { error } = await authClient.admin.revokeUserSession({ sessionToken });
      if (error) throw new Error(error.message ?? "Failed to revoke session");
    },
    onSuccess: async () => {
      toast.success("Session revoked");
      await queryClient.invalidateQueries({ queryKey: sessionQueryKey });
    },
    onError: (err) => toast.error(err.message, { id: "revoke-session-failed" }),
  });

  if (!userId) {
    return (
      <div className="mx-auto w-full max-w-7xl px-5 py-10 md:px-10">
        <section className="border-border flex flex-col items-center border px-5 py-16 text-center">
          <p className="text-foreground text-sm font-medium">No user selected</p>
          <p className="text-muted-foreground mt-1 max-w-sm text-xs leading-6">
            Open the actions menu on a user in the users table and choose “View sessions”.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            nativeButton={false}
            render={<Link to="/dashboard/user" />}
          >
            Back to users
          </Button>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-10 md:px-10">
      <section className="border-border border p-5">
        {userPending && <SessionProfileSkeleton />}
        {userError && (
          <div className="flex flex-col items-start gap-2">
            <p className="text-destructive inline-flex items-center gap-2 text-sm">
              <WarningCircleIcon weight="fill" className="size-4 shrink-0" />
              {userErrorCause?.message ?? "Failed to load user."}
            </p>
            <Button variant="outline" size="xs" onClick={() => refetchUser()}>
              Try again
            </Button>
          </div>
        )}
        {user ? <SessionProfileCard user={user} /> : null}
      </section>

      <section className="mt-2">
        <div className="flex w-full items-center">
          <h2 className="text-primary py-2 text-2xl font-semibold">Session List</h2>
          {sessions && sessions.length > 1 && (
            <Button
              variant={isSelf ? "ghost" : "destructive"}
              className="ml-auto font-semibold"
              disabled={isSelf}
              onClick={() => setRevokeAllOpen(true)}
            >
              Revoke All
            </Button>
          )}
        </div>
        <Table>
          <TableHeader>
            <TableRow className="*:border-border text-center *:border hover:bg-transparent">
              <TableHead>Device</TableHead>
              <TableHead>IP address</TableHead>
              <TableHead>Signed in</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="space-x-2 text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="border">
            {sessionsError && (
              <TableRow>
                <TableCell colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-destructive inline-flex items-center gap-2 text-xs">
                      <WarningCircleIcon weight="fill" className="size-3.5 shrink-0" />
                      {sessionsErrorCause?.message ?? "Failed to load sessions."}
                    </p>
                    <Button variant="outline" size="xs" onClick={() => refetchSessions()}>
                      Try again
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {!sessionsError && sessions?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground py-16 text-center text-xs">
                  No session found.
                </TableCell>
              </TableRow>
            )}
            {sessionsPending &&
              Array.from({ length: 2 }).map((_, i) => (
                <TableRow key={i} className="*:border hover:bg-transparent">
                  <TableCell>
                    <Skeleton className="h-4 w-30" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-14" />
                  </TableCell>
                  <TableCell className="w-40 text-right">
                    <Skeleton className="ml-auto h-6 w-16" />
                  </TableCell>
                </TableRow>
              ))}
            {sessions?.map((session) => {
              const isExpired = new Date(session.expiresAt) <= new Date();
              return (
                <TableRow key={session.id} className="*:border-border *:border">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{parseDevice(session.userAgent)}</span>
                      {session.impersonatedBy && (
                        <span className="text-xs text-amber-600 dark:text-amber-400">
                          Impersonated
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {session.ipAddress || "Unknown"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {formatDate(session.createdAt)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {formatDate(session.expiresAt)}
                  </TableCell>
                  <TableCell>
                    {isExpired ? (
                      <span className="border-border text-muted-foreground border px-1.5 py-0.5 text-xs">
                        Expired
                      </span>
                    ) : (
                      <span className="border border-emerald-500/40 bg-emerald-500/5 px-1.5 py-0.5 text-xs text-emerald-600 dark:text-emerald-400">
                        Active
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant={
                        currentSession?.session.token === session.token ? "ghost" : "destructive"
                      }
                      size="sm"
                      disabled={currentSession?.session.token === session.token}
                      onClick={() => revokeUserSession.mutate(session.token)}
                    >
                      {revokeUserSession.isPending && revokeUserSession.variables === session.token
                        ? "Revoking…"
                        : currentSession?.session.token === session.token
                          ? "this is you"
                          : "Revoke"}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <ConfirmationDialog
          open={revokeAllOpen}
          onOpenChange={setRevokeAllOpen}
          title="Revoke all sessions?"
          description={`${user?.name} will be signed out on all devices.`}
          isPending={revokeUserSessions.isPending}
          actionFn={() => revokeUserSessions.mutate()}
          actionLabel={revokeUserSessions.isPending ? "Revoking…" : "Revoke"}
        />
      </section>
    </div>
  );
}
