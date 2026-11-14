import { ArrowDownIcon, ArrowsDownUpIcon, ArrowUpIcon } from "@phosphor-icons/react";

export function SortIcon({ isSorted }: { isSorted: false | "asc" | "desc" }) {
  if (isSorted === "asc") return <ArrowUpIcon className="ml-1 inline size-3" />;
  if (isSorted === "desc") return <ArrowDownIcon className="ml-1 inline size-3" />;
  return <ArrowsDownUpIcon className="text-muted-foreground/50 ml-1 inline size-3" />;
}
