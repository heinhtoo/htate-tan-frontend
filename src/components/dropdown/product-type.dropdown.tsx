import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Icons } from "@/components/ui/icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getProductTypes } from "@/features/product-type/product-type.action";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

function ProductTypeDropdown({
  value,
  setValue,
  disabled,
}: {
  value: number;
  setValue: (value: number) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { data, error } = useQuery({
    queryKey: ["product-type-all"],
    queryFn: async () => {
      const data = await getProductTypes({
        page: "0",
        size: "0",
        s: "",
        q: "",
      });
      if (data.response) {
        return data.response;
      } else {
        throw data.error;
      }
    },
  });

  if (error) {
    return (
      <p className="text-sm text-destructive">Error getting product types</p>
    );
  }

  if (!data) {
    return (
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full justify-between"
        disabled
      >
        Loading...
        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled ? true : false}
        >
          {value
            ? data.data.find((item) => item.id === value)?.name
            : "Select product type..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search product type..." />
          <CommandList>
            <CommandEmpty>No product type found.</CommandEmpty>
            <CommandGroup>
              {data.data.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.name}
                  onSelect={() => {
                    setValue(option.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default ProductTypeDropdown;
