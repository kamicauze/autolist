import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const containerVariants = cva("mx-auto w-full px-4 sm:px-6 lg:px-8", {
  variants: {
    size: {
      sm: "max-w-3xl",
      md: "max-w-5xl",
      lg: "max-w-6xl",
      xl: "max-w-7xl",
      full: "max-w-full",
    },
  },
  defaultVariants: {
    size: "lg",
  },
});

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

function Container({ className, size, children, ...props }: ContainerProps) {
  return (
    <div className={cn(containerVariants({ size }), className)} {...props}>
      {children}
    </div>
  );
}

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

function Section({
  className,
  children,
  title,
  subtitle,
  action,
  ...props
}: SectionProps) {
  return (
    <section className={cn("py-12 md:py-16", className)} {...props}>
      {(title || action) && (
        <div className="mb-8 flex items-end justify-between">
          <div>
            {title && <h2 className="h3 text-foreground">{title}</h2>}
            {subtitle && (
              <p className="mt-2 text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export { Container, containerVariants, Section };
