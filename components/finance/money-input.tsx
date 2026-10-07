"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { formatAmount } from "@/lib/finance/format";
import { cn } from "@/lib/utils";

const MAX_DIGITS = 12;

interface MoneyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  /** Digits only, or "" when blank. */
  value: string;
  onValueChange: (digits: string) => void;
}

/** KES amount input that shows thousands separators while typing and keeps the caret in place. */
export function MoneyInput({ value, onValueChange, className, ...props }: MoneyInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const pendingCaretDigits = React.useRef<number | null>(null);

  React.useLayoutEffect(() => {
    const input = inputRef.current;
    const targetDigits = pendingCaretDigits.current;
    if (!input || targetDigits === null || document.activeElement !== input) return;
    pendingCaretDigits.current = null;

    let position = 0;
    let seen = 0;
    while (position < input.value.length && seen < targetDigits) {
      if (/\d/.test(input.value[position])) seen += 1;
      position += 1;
    }
    input.setSelectionRange(position, position);
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    const caret = event.target.selectionStart ?? raw.length;
    const digits = raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, MAX_DIGITS);
    pendingCaretDigits.current = Math.min(raw.slice(0, caret).replace(/\D/g, "").length, digits.length);
    onValueChange(digits);
  };

  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm font-medium text-muted-foreground"
      >
        KES
      </span>
      <Input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={value ? formatAmount(Number(value)) : ""}
        onChange={handleChange}
        className={cn("h-11 pl-14 tabular-nums", className)}
        {...props}
      />
    </div>
  );
}
