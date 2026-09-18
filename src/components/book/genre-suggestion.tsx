import { PlusIcon } from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as React from "react";
import { toast } from "sonner";
import { useMediaQuery } from "#/hooks/useMediaQuery.ts";
import { authClient } from "#/lib/auth-client.ts";
import { cn, slugify } from "#/lib/utils.ts";
import { createSuggestion } from "#/utils/books.functions.ts";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Skeleton } from "../ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface Genre {
  id: number;
  name: string;
}

interface GenreSuggestionProps {
  bookId: string;
  currentGenreIds: number[];
}

export function GenreSuggestion({ bookId, currentGenreIds }: GenreSuggestionProps) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const trigger = (
    <Button variant="secondary" size="xs" className="rounded-sm border">
      <PlusIcon /> Suggest
    </Button>
  );

  const content = (
    <GenreSuggestionForm
      bookId={bookId}
      currentGenreIds={currentGenreIds}
      onSuccess={() => setOpen(false)}
    />
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={trigger} />
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Suggest genres</DialogTitle>
            <DialogDescription>
              Pick genres you think fit this book. Your suggestion will be reviewed.
            </DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} swipeDirection="down" showSwipeHandle>
      <DrawerTrigger render={trigger} />
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Suggest genres</DrawerTitle>
          <DrawerDescription>
            Pick genres you think fit this book. Your suggestion will be reviewed.
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4">{content}</div>
        <DrawerFooter className="pt-2" />
      </DrawerContent>
    </Drawer>
  );
}

interface GenreSuggestionFormProps {
  bookId: string;
  currentGenreIds: number[];
  onSuccess: () => void;
}

function GenreSuggestionForm({ bookId, currentGenreIds, onSuccess }: GenreSuggestionFormProps) {
  const { data: session } = authClient.useSession();

  const [toAdd, setToAdd] = React.useState<Set<number>>(new Set());
  const [toRemove, setToRemove] = React.useState<Set<number>>(new Set());

  const [newGenres, setNewGenres] = React.useState<string[]>([]);
  const [customGenreInput, setCustomGenreInput] = React.useState("");

  const noteRef = React.useRef<HTMLTextAreaElement>(null);

  const { data: genres = [], isLoading } = useQuery<Genre[]>({
    queryKey: ["genres"],
    queryFn: () => fetch("/api/genres").then((res) => res.json()),
    staleTime: Infinity,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createSuggestion,
    onSuccess: () => {
      setToAdd(new Set());
      toast.success("Thanks! Your genre suggestion was submitted for review.", {
        position: "top-left",
      });
      onSuccess();
    },
    onError: () => toast.error("Something went wrong. Please try again.", { position: "top-left" }),
  });

  function toggleAdd(id: number) {
    setToAdd((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleRemove(id: number) {
    setToRemove((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleAddNewGenre(e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) {
    const trimmed = customGenreInput.trim();
    if (!trimmed) return;

    // Check if it matches an existing DB genre (case-insensitive)
    const existingGenre = genres.find((g) => g.name.toLowerCase() === trimmed.toLowerCase());
    if (existingGenre) {
      toggleAdd(existingGenre.id);
      setCustomGenreInput("");
      return;
    }

    // Add to newGenres if not already in list
    if (!newGenres.some((g) => g.toLowerCase() === trimmed.toLowerCase())) {
      setNewGenres((prev) => [...prev, trimmed]);
    }
    setCustomGenreInput("");
  }

  function removeNewGenre(name: string) {
    setNewGenres((prev) => prev.filter((g) => g !== name));
  }

  function handleSubmit() {
    if (toAdd.size === 0) {
      toast.info("Select at least one new genre.", { position: "top-left" });
      return;
    }

    mutate({
      data: {
        bookId,
        type: "book_genres",
        suggestedBy: session?.user.id,
        note: noteRef.current?.value || undefined,
        changes: {
          type: "book_genres",
          addGenreIds: toAdd.size > 0 ? [...toAdd] : undefined,
          removeGenreIds: toRemove.size > 0 ? [...toRemove] : undefined,
          newGenres:
            newGenres.length > 0
              ? newGenres.map((name) => ({ name, slug: slugify(name) }))
              : undefined,
        },
      },
    });
  }

  // Separate already-attached from available
  const alreadyAttached = genres.filter((g) => currentGenreIds.includes(g.id));
  const available = genres.filter((g) => !currentGenreIds.includes(g.id));

  return (
    <div className="flex flex-wrap gap-1.5 space-y-4">
      {/* Already on this book */}
      {isLoading && (
        <div>
          <Skeleton className="mb-2 h-5 w-32" />
          <GenreSkeletons count={4} />
        </div>
      )}
      {!isLoading && alreadyAttached.length > 0 && (
        <div>
          <p className="text-muted-foreground mb-2 text-xs tracking-wider uppercase">
            Current genres (click to remove)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {alreadyAttached.map((g) => {
              const isMarkedForRemoval = toRemove.has(g.id);
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => toggleRemove(g.id)}
                  className={cn(
                    "rounded-sm border px-3 py-1 font-mono text-xs tracking-wide uppercase transition-colors",
                    isMarkedForRemoval
                      ? "border-destructive/60 bg-destructive/10 text-destructive line-through"
                      : "border-border text-foreground hover:border-destructive/50",
                  )}
                >
                  {g.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selectable genres */}
      <div>
        <p className="text-muted-foreground mb-2 text-xs tracking-wider uppercase">
          Select genres to suggest
        </p>
        <ScrollArea className="h-48 min-h-fit w-full">
          {isLoading && <GenreSkeletons count={40} />}
          <div className="flex flex-wrap gap-1.5">
            {available.map((g) => {
              const isSelected = toAdd.has(g.id);
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => toggleAdd(g.id)}
                  className={cn(
                    "rounded-sm border px-3 py-1 font-mono text-xs tracking-wide uppercase transition-colors",
                    isSelected
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted-foreground hover:border-accent/50 hover:text-primary",
                  )}
                >
                  {g.name}
                </button>
              );
            })}
            {available.length === 0 && !isLoading && (
              <p className="text-muted-foreground text-sm">All genres are already attached.</p>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Custom / Proposed New Genres */}
      <div>
        <p className="text-muted-foreground mb-2 text-xs tracking-wider uppercase">
          Suggest a new genre
        </p>

        {/* Display tags for newly proposed genres */}
        {newGenres.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {newGenres.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => removeNewGenre(name)}
                className="border-accent bg-accent/15 text-accent inline-flex items-center gap-1 rounded-sm border px-2.5 py-0.5 font-mono text-xs uppercase"
              >
                {name}
              </button>
            ))}
          </div>
        )}
        <div className="mt-2 flex w-full items-center gap-2">
          {isLoading ? (
            <>
              <Skeleton className="h-7 w-40" />
              <Skeleton className="aspect-square h-7" />
            </>
          ) : (
            <>
              <Input
                value={customGenreInput}
                onChange={(e) => setCustomGenreInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddNewGenre(e);
                  }
                }}
                placeholder="e.g. Cyberpunk Noir, LitRPG..."
                className="h-8 text-xs placeholder:text-xs"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={handleAddNewGenre}
                disabled={!customGenreInput.trim()}
              >
                <PlusIcon className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Note */}
      {/*<label className="text-primary block w-full text-sm">
        Note
        <Textarea
          ref={noteRef}
          rows={2}
          placeholder="Why do you think these genres fit?"
          className="border-border focus-visible:border-accent mt-2 w-full resize-none rounded-xs bg-transparent py-2 outline-none"
        />
      </label>*/}

      {/* Submit */}
      <Button
        type="button"
        className="w-full"
        disabled={!session || isPending || toAdd.size === 0}
        onClick={handleSubmit}
      >
        {isPending ? "Submitting…" : `Submit ${toAdd.size > 0 ? `(${toAdd.size})` : "suggestion"}`}
      </Button>
    </div>
  );
}

const BASE_WIDTHS = ["w-16", "w-20", "w-14", "w-24", "w-18", "w-12", "w-22"];

function GenreSkeletons({ count = 24 }: { count?: number }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: count }).map((_, idx) => (
        <Skeleton
          key={idx}
          className={cn("h-5 rounded-sm", BASE_WIDTHS[idx % BASE_WIDTHS.length])}
        />
      ))}
    </div>
  );
}
