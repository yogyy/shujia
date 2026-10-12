import { CheckCircleIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "#/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu.tsx";
import { authClient } from "#/lib/auth-client.ts";
import { getBookBookmarkStatus, updateBookmarkStatus } from "#/utils/bookmarks.functions.ts";
import { Skeleton } from "../ui/skeleton";

const statusLabels: Record<string, string> = {
  want_to_read: "Want to read",
  reading: "Reading",
  finished: "Finished",
  dnf: "Did not finish",
};

interface BookmarkStatusProps {
  bookId: string;
  slug: string;
  enabled: boolean;
}

export function BookmarkStatus({ bookId, slug, enabled }: BookmarkStatusProps) {
  const client = useQueryClient();
  const { data: session } = authClient.useSession();

  const { data: bookmarkData, isLoading } = useQuery({
    queryKey: ["book-bookmark", slug, session?.user.id],
    queryFn: async () => {
      if (!session) return;
      return await getBookBookmarkStatus({
        data: { bookId: String(bookId), userId: session?.user.id },
      });
    },
    enabled,
  });

  const { mutate: mutateStatus } = useMutation({
    mutationFn: updateBookmarkStatus,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["book-bookmark", slug, session?.user.id] });
      client.invalidateQueries({ queryKey: ["user-bookmarks", session?.user.id] });
      toast.success("Reading status updated");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  if (isLoading) return <Skeleton className="flex h-11 w-auto grow rounded-xs" />;
  if (!bookmarkData) return null;

  return (
    <div className="border-border bg-card/60 flex grow items-center justify-between rounded-xs border p-2">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xs">Shelf status:</span>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="outline" size="sm" className="h-7 text-xs font-medium" />}
          >
            {statusLabels[bookmarkData.status] || bookmarkData.status}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {(["want_to_read", "reading", "finished", "dnf"] as const).map((statusKey) => (
              <DropdownMenuItem
                key={statusKey}
                onClick={() => {
                  if (session && bookId && bookmarkData.status !== statusKey) {
                    mutateStatus({
                      data: {
                        userId: session?.user.id,
                        bookId,
                        status: statusKey,
                      },
                    });
                  }
                }}
                className="flex items-center justify-between text-xs"
              >
                <span>{statusLabels[statusKey]}</span>
                {bookmarkData.status === statusKey && (
                  <CheckCircleIcon className="text-accent h-3.5 w-3.5" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Link to="/bookmarks" className="text-accent text-xs hover:underline">
        View all bookmarks &rarr;
      </Link>
    </div>
  );
}
