import { DotsThreeVerticalIcon } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { deleteBookAdmin } from "#/utils/admin/index.functions.ts";
import { ConfirmationDialog } from "../user/confirmation-dialog";

import type { BookRow } from "./columns";

interface MenuProps {
  book: BookRow;
}

export function BookRowActions({ book }: MenuProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => deleteBookAdmin({ data: { bookId: book.id } }),
    onSuccess: async () => {
      toast.success("Book deleted");
      setConfirmOpen(false);
      await router.invalidate();
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Failed to delete book"),
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon" aria-label="Book actions" />}
        >
          <DotsThreeVerticalIcon size={20} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem render={<Link to="/book/$slug" params={{ slug: book.slug }} />}>
              View book
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem disabled>Edit book</DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
              Delete book
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete book?"
        description={`"${book.title}" will be permanently removed from the collection. This cannot be undone.`}
        isPending={deleteMutation.isPending}
        actionFn={() => deleteMutation.mutate()}
        actionLabel={deleteMutation.isPending ? "Deleting…" : "Delete"}
      />
    </>
  );
}
