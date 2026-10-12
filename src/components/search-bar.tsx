import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { parseAsString, useQueryState } from "nuqs";
import { useRef } from "react";
import { Button } from "./ui/button";

interface SearchBarProps {
  autoFocus?: boolean;
}

export function SearchBar({ autoFocus = false }: SearchBarProps) {
  const [query, setQuery] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions({ shallow: false }),
  );

  const inputRef = useRef<HTMLInputElement>(null);

  function handleSearch() {
    setQuery(inputRef.current?.value ?? "");
  }

  return (
    <>
      <input
        ref={inputRef}
        defaultValue={query}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setQuery(e.currentTarget.value);
          }
        }}
        placeholder="Search titles..."
        autoFocus={autoFocus}
        className="placeholder:text-muted-foreground/70 w-44 bg-transparent px-2 py-0.5 text-sm outline-none"
      />
      <Button size="icon" variant="ghost" onClick={handleSearch}>
        <MagnifyingGlassIcon className="text-muted-foreground" size={20} />
      </Button>
    </>
  );
}
