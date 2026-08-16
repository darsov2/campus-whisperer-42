import * as React from "react";
import { Check, X, ChevronDown, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export interface MultiSelectOption {
  value: string;
  label: string;
  secondary?: string;
  disabled?: boolean;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  badgeLimit?: number;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  searchPlaceholder = "Search...",
  emptyMessage = "No items found.",
  className,
  badgeLimit = 2,
  disabled,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedSet = React.useMemo(() => new Set(selected), [selected]);
  const selectedOptions = React.useMemo(
    () => options.filter((o) => selectedSet.has(o.value)),
    [options, selectedSet]
  );

  const toggle = (value: string) => {
    const next = selectedSet.has(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(next);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-9 px-3 font-normal text-xs hover:bg-muted",
            selectedOptions.length === 0 && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <span className="flex items-center gap-1 min-w-0 overflow-hidden">
            {selectedOptions.length === 0 ? (
              placeholder
            ) : selectedOptions.length <= badgeLimit ? (
              selectedOptions.map((o) => (
                <Badge
                  key={o.value}
                  variant="secondary"
                  className="text-[11px] font-normal px-1.5 py-0"
                >
                  {o.label}
                </Badge>
              ))
            ) : (
              <Badge variant="secondary" className="text-[11px] font-normal px-1.5 py-0">
                {selectedOptions.length} selected
              </Badge>
            )}
          </span>
          <span className="flex items-center gap-1 shrink-0 ml-2">
            {selectedOptions.length > 0 && (
              <span
                role="button"
                tabIndex={0}
                onClick={clear}
                onKeyDown={(e) => e.key === "Enter" && clear(e as unknown as React.MouseEvent)}
                className="rounded-sm hover:bg-muted-foreground/20 p-0.5"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </span>
            )}
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-2" cmdk-input-wrapper="">
            <Search className="mr-2 h-3.5 w-3.5 shrink-0 opacity-50" />
            <CommandInput
              placeholder={searchPlaceholder}
              className="flex h-9 w-full rounded-md bg-transparent py-2 text-xs outline-none placeholder:text-muted-foreground"
            />
          </div>
          <CommandList className="max-h-[240px] overflow-y-auto overflow-x-hidden">
            <CommandEmpty className="py-3 text-center text-xs text-muted-foreground">
              {emptyMessage}
            </CommandEmpty>
            <CommandGroup>
              {options.map((o) => {
                const active = selectedSet.has(o.value);
                return (
                  <CommandItem
                    key={o.value}
                    value={o.value}
                    onSelect={() => toggle(o.value)}
                    disabled={o.disabled}
                    className="flex items-center gap-2 px-2 py-1.5 text-xs cursor-pointer aria-disabled:opacity-50 aria-disabled:pointer-events-none"
                  >
                    <span
                      className={cn(
                        "flex h-3.5 w-3.5 items-center justify-center rounded border shrink-0",
                        active
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-input bg-background"
                      )}
                    >
                      {active && <Check className="h-3 w-3" />}
                    </span>
                    <span className="flex-1 truncate">{o.label}</span>
                    {o.secondary && (
                      <span className="text-[11px] text-muted-foreground truncate max-w-[120px]">
                        {o.secondary}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
