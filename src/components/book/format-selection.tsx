import { BookEnum } from "../form/schema";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formats = BookEnum.options.map((option) => ({
  label: option.charAt(0).toUpperCase() + option.slice(1),
  value: option,
}));

export function FormatSelector() {
  return (
    <Select items={formats} name="bookFormat">
      <SelectTrigger className="focus-visible:border-accent focus-visible:[&>svg]:text-accent mt-2 w-full rounded-xs ring-0 focus-visible:ring-0">
        <SelectValue placeholder="Format" />
      </SelectTrigger>
      <SelectContent className="rounded-xs">
        <SelectGroup>
          {formats.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
