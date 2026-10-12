import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { cn } from "#/lib/utils.ts";

interface BookSummaryProps {
  description: string | null;
}

export function BookSummary({ description }: BookSummaryProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-8 border-b pb-8">
      <h2 className="text-accent font-serif text-3xl">Summary</h2>
      <p
        className={cn(
          "text-muted-foreground mt-4 max-w-xl text-base leading-relaxed whitespace-pre-line",
          "transition-all",
          expanded ? "line-clamp-none" : "line-clamp-5",
        )}
      >
        {description}
      </p>
      {!expanded && (
        <div className="from-background pointer-events-none absolute bottom-4 left-0 h-36 w-full bg-linear-to-t to-transparent"></div>
      )}
      <div className="relative mt-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="group flex w-full cursor-pointer items-center justify-center py-2 focus:outline-none"
        >
          <div className="absolute inset-0 flex items-center">
            <div className="border-muted-foreground/30 w-full border-t"></div>
          </div>
          <div className="bg-background relative px-3">
            <span className="text-accent flex items-center gap-1 text-sm font-medium">
              {expanded ? "Show Less" : "Show More"}
              {expanded ? <CaretUpIcon weight="duotone" /> : <CaretDownIcon weight="duotone" />}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
