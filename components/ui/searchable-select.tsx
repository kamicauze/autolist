"use client";

import * as React from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type SearchableSelectOption = {
  value: string;
  label: string;
  /** Optional CSS color rendered as a leading swatch. */
  swatch?: string;
  /** Optional leading node, e.g. an icon. Takes precedence over swatch. */
  icon?: React.ReactNode;
};

type SearchableSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<SearchableSelectOption>;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  /** Classes for the trigger; pass the same classes a native select would use. */
  className?: string;
  /** Overrides the trigger label, e.g. to show a custom value not in the options. */
  displayValue?: React.ReactNode;
  /** Lets the user commit the typed search text when it is not one of the options. */
  allowCustomValue?: boolean;
  "aria-label"?: string;
};

const CUSTOM_OPTION_PREFIX = "__custom__:";

function Swatch({ color }: { color: string }) {
  return (
    <span
      className="h-4 w-4 shrink-0 rounded-full border border-black/10"
      style={{ background: color }}
      aria-hidden
    />
  );
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select",
  searchPlaceholder = "Search...",
  emptyText = "No matches found",
  disabled = false,
  className,
  displayValue,
  allowCustomValue = false,
  "aria-label": ariaLabel,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [highlighted, setHighlighted] = React.useState(0);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const listboxId = React.useId();

  const selected = options.find((option) => option.value === value);
  const filtered = React.useMemo(() => {
    const typed = query.trim();
    const needle = typed.toLowerCase();
    const matches = needle
      ? options.filter((option) => option.label.toLowerCase().includes(needle))
      : [...options];
    const hasExactMatch = options.some((option) => option.label.toLowerCase() === needle);
    if (allowCustomValue && typed && !hasExactMatch) {
      matches.push({ value: `${CUSTOM_OPTION_PREFIX}${typed}`, label: `Use "${typed}"` });
    }
    return matches;
  }, [allowCustomValue, options, query]);

  React.useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    setQuery("");
    const selectedIndex = options.findIndex((option) => option.value === value);
    setHighlighted(selectedIndex >= 0 ? selectedIndex : 0);
    inputRef.current?.focus();
    // Only reset when the menu opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  React.useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${highlighted}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  const commit = (option: SearchableSelectOption | undefined) => {
    if (!option) return;
    onChange(
      option.value.startsWith(CUSTOM_OPTION_PREFIX)
        ? option.value.slice(CUSTOM_OPTION_PREFIX.length)
        : option.value
    );
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((index) => Math.min(index + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      commit(filtered[highlighted]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  };

  const triggerContent = displayValue ?? (selected ? (
    <span className="flex min-w-0 items-center gap-2">
      {selected.icon ?? (selected.swatch ? <Swatch color={selected.swatch} /> : null)}
      <span className="truncate">{selected.label}</span>
    </span>
  ) : allowCustomValue && value.trim() ? (
    <span className="truncate">{value}</span>
  ) : (
    <span className="truncate text-[#9a9a9a]">{placeholder}</span>
  ));

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (!open && (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className={cn(
          "flex w-full items-center justify-between gap-2 text-left disabled:cursor-not-allowed disabled:opacity-60",
          className
        )}
      >
        {triggerContent}
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-[#8a8a8a] transition", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-[14px] border border-[#e4e7ec] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
          <div className="flex items-center gap-2 border-b border-[#efefef] px-3">
            <Search className="h-4 w-4 shrink-0 text-[#9a9a9a]" aria-hidden />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setHighlighted(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              aria-controls={listboxId}
              aria-activedescendant={filtered[highlighted] ? `${listboxId}-${highlighted}` : undefined}
              className="h-11 w-full bg-transparent text-[14px] text-[#202224] outline-none placeholder:text-[#9a9a9a]"
            />
          </div>
          <ul ref={listRef} id={listboxId} role="listbox" className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-[13px] text-[#8a8a8a]">{emptyText}</li>
            ) : (
              filtered.map((option, index) => {
                const isSelected = option.value === value;
                return (
                  <li
                    key={option.value}
                    id={`${listboxId}-${index}`}
                    data-index={index}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setHighlighted(index)}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => commit(option)}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 px-4 py-2.5 text-[14px] text-[#202224]",
                      index === highlighted && "bg-brand-soft-surface",
                      isSelected && "font-semibold text-primary"
                    )}
                  >
                    {option.icon ?? (option.swatch ? <Swatch color={option.swatch} /> : null)}
                    <span className="min-w-0 flex-1 truncate">{option.label}</span>
                    {isSelected ? <Check className="h-4 w-4 shrink-0" aria-hidden /> : null}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
