"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = { label: string; value: string };

const formatDigits = (digits: string) =>
  digits ? new Intl.NumberFormat("en-KE").format(Number(digits)) : "";

interface NumericComboInputProps {
  /** Digits only, or "" for no value. */
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<Option>;
  placeholder?: string;
  "aria-label"?: string;
  className?: string;
  /** Render the list in a body portal so overflow-hidden parents don't clip it. */
  portal?: boolean;
  /** Replaces the default chevron icon. */
  chevron?: React.ReactNode;
}

/**
 * A number input with a preset dropdown: pick a preset or type any value.
 * Typed values are committed on blur or Enter so range reconciliation
 * doesn't fire on every keystroke.
 */
export function NumericComboInput({
  value,
  onChange,
  options,
  placeholder,
  "aria-label": ariaLabel,
  className,
  portal = false,
  chevron,
}: NumericComboInputProps) {
  const [text, setText] = React.useState(formatDigits(value));
  const [open, setOpen] = React.useState(false);
  const [anchorRect, setAnchorRect] = React.useState<DOMRect | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listId = React.useId();

  React.useEffect(() => {
    setText(formatDigits(value));
  }, [value]);

  React.useLayoutEffect(() => {
    if (!open || !portal) return;
    const update = () =>
      setAnchorRect(inputRef.current?.getBoundingClientRect() ?? null);
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, portal]);

  const commit = (digits: string) => {
    setText(formatDigits(digits));
    if (digits !== value) onChange(digits);
  };

  const pick = (optionValue: string) => {
    commit(optionValue);
    setOpen(false);
    inputRef.current?.blur();
  };

  const list = open ? (
    <ul
      id={listId}
      role="listbox"
      style={
        portal && anchorRect
          ? {
              position: "fixed",
              top: anchorRect.bottom + 4,
              left: anchorRect.left,
              width: anchorRect.width,
            }
          : undefined
      }
      className={cn(
        "z-[100] max-h-60 overflow-y-auto rounded-[12px] border border-[#d1d5dc] bg-white py-1 text-[14px] text-[#202224] shadow-lg",
        !portal && "absolute left-0 right-0 top-full mt-1",
      )}
    >
      {options.map((option) => (
        <li
          key={`${option.label}-${option.value}`}
          role="option"
          aria-selected={option.value === value}
          onMouseDown={(event) => {
            event.preventDefault();
            pick(option.value);
          }}
          className={cn(
            "cursor-pointer px-3.5 py-2 hover:bg-[#f3f5f9]",
            option.value === value && "font-semibold text-primary",
          )}
        >
          {option.label}
        </li>
      ))}
    </ul>
  ) : null;

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        role="combobox"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="none"
        placeholder={placeholder}
        value={text}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setText(formatDigits(event.target.value.replace(/\D/g, "").slice(0, 12)));
          setOpen(false);
        }}
        onBlur={() => {
          setOpen(false);
          commit(text.replace(/\D/g, ""));
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            inputRef.current?.blur();
          } else if (event.key === "Escape") {
            setOpen(false);
          } else if (event.key === "ArrowDown") {
            setOpen(true);
          }
        }}
        className={cn("pr-10", className)}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label={`Show ${ariaLabel ?? "options"}`}
        onMouseDown={(event) => {
          event.preventDefault();
          if (open) {
            setOpen(false);
          } else {
            inputRef.current?.focus();
            setOpen(true);
          }
        }}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-[#8b93a7]"
      >
        {chevron ?? <ChevronDown className="h-4 w-4" />}
      </button>
      {portal && list ? createPortal(list, document.body) : list}
    </div>
  );
}
