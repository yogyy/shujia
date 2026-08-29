import { useQuery } from "@tanstack/react-query";
import { useImperativeHandle, useState } from "react";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";

interface Genre {
  id: number;
  name: string;
}

export type GenreSelectorRef = {
  reset: () => void;
};

type GenreSelectorProps = {
  ref?: React.RefObject<GenreSelectorRef | null>;
};

export function GenreSelector({ ref }: GenreSelectorProps) {
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const anchor = useComboboxAnchor();

  useImperativeHandle(ref, () => ({
    reset() {
      setSelectedGenres([]);
    },
  }));

  const { data: genres } = useQuery<Genre[]>({
    queryKey: ["genres"],
    queryFn: () => fetch("/api/genres").then((res) => res.json()),
    staleTime: Infinity,
  });

  return (
    <Combobox
      multiple
      name="genres"
      autoHighlight
      items={genres}
      value={selectedGenres}
      onValueChange={setSelectedGenres}
    >
      <ComboboxChips ref={anchor} className="focus-within:border-accent ring-0 focus-within:ring-0">
        <ComboboxValue>
          {(values) => (
            <>
              {values.map((value: number) => (
                <ComboboxChip key={value} showRemove={false}>
                  {genres?.find((g) => g.id === value)?.name}
                </ComboboxChip>
              ))}
              <ComboboxChipsInput
                className="placeholder:text-muted-foreground"
                placeholder={values.length !== 0 ? "" : "Add some genres"}
              />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor} side="bottom">
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item.id} value={item.id}>
              {item.name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
