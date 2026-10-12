import { Link, type LinkComponentProps } from "@tanstack/react-router";
import { useDisplayMode } from "#/lib/store.ts";
import { cn } from "#/lib/utils.ts";
import { Skeleton } from "../ui/skeleton";

import type { Book } from "#/utils/books.functions.ts";

export interface BookCardProps extends LinkComponentProps {
  book: Omit<Book, "description">;
}

export function BookCard({ book, className }: BookCardProps) {
  const displayMode = useDisplayMode((state) => state.mode);

  return (
    <Link
      to="/book/$slug"
      params={{ slug: book.slug }}
      key={book.title}
      className={cn(
        "group bg-card text-card-foreground/90 focus-within:border-accent relative rounded-xs border",
        className,
      )}
    >
      <div className="flex aspect-[1/1.6] max-w-70 items-center justify-center opacity-95 transition-opacity group-hover:opacity-100">
        <img src={book.coverUrl!} alt={book.title} className="h-full max-w-full object-cover" />
      </div>
      <div
        className={cn(
          "bg-background/80 flex min-h-10 w-full items-center justify-center p-1",
          displayMode === "cover" ? "hidden" : "",
          displayMode === "comfortable" ? "bg-transparent" : "",
          displayMode === "compact" ? "bg-background/80 absolute bottom-0" : "",
        )}
      >
        <h3 className="group-hover:text-primary group-focus-within:text-primary line-clamp-2 text-center font-serif text-sm leading-tight text-balance transition-colors">
          {book.title}
        </h3>
      </div>
    </Link>
  );
}

export function BookCardSkeleton() {
  return <Skeleton className="aspect-[1/1.6] max-w-70 rounded-xs" />;
}
