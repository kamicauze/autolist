"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const filterChipVariants = cva(
  "inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      selected: {
        true: "bg-primary text-white border-primary",
        false: "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50",
      },
      size: {
        default: "px-4 py-2 text-sm",
        sm: "px-3 py-1.5 text-xs",
        lg: "px-5 py-2.5 text-base",
      },
    },
    defaultVariants: {
      selected: false,
      size: "default",
    },
  }
);

export interface FilterChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof filterChipVariants> {
  selected?: boolean;
}

const FilterChip = React.forwardRef<HTMLButtonElement, FilterChipProps>(
  ({ className, selected = false, size, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="checkbox"
        aria-checked={selected}
        className={cn(filterChipVariants({ selected, size }), className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
FilterChip.displayName = "FilterChip";

export { FilterChip, filterChipVariants };
