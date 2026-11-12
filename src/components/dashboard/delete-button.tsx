import { TrashIcon, WarningCircleIcon } from "@phosphor-icons/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "#/components/ui/alert-dialog.tsx";
import { Button } from "../ui/button";

export function DeleteButton({
  bookTitle,
  isPending,
  onConfirm,
}: {
  bookTitle: string;
  isPending: boolean;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            id={`delete-book-${bookTitle.replace(/\s+/g, "-").toLowerCase().slice(0, 20)}`}
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            disabled={isPending}
          />
        }
      >
        <TrashIcon className="size-4" />
      </AlertDialogTrigger>

      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <WarningCircleIcon weight="fill" className="text-destructive size-5" />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete book?</AlertDialogTitle>
          <AlertDialogDescription>
            "<span className="text-foreground font-medium">{bookTitle}</span>" will be permanently
            removed from the collection. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
