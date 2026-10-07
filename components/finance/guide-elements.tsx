import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, ChevronDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function GuideSection({
  id,
  eyebrow,
  title,
  children,
  className,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      tabIndex={-1}
      className={cn(
        "scroll-mt-32 border-t border-border pt-10 first:border-t-0 first:pt-0 focus:outline-none xl:scroll-mt-40",
        className
      )}
    >
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">{eyebrow}</p>
      <h2 id={`${id}-title`} className="mt-2 max-w-prose text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function Question({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-8 max-w-prose text-lg font-semibold text-foreground">{children}</h3>;
}

export function Prose({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("mt-3 max-w-prose leading-7 text-foreground/80", className)}>{children}</p>;
}

export function BulletList({ items, ordered = false }: { items: React.ReactNode[]; ordered?: boolean }) {
  const ListTag = ordered ? "ol" : "ul";
  return (
    <ListTag
      className={cn(
        "mt-3 max-w-prose space-y-1.5 pl-5 leading-7 text-foreground/80 marker:text-primary",
        ordered ? "list-decimal marker:font-semibold" : "list-disc"
      )}
    >
      {items.map((item, index) => (
        <li key={index} className="pl-1">
          {item}
        </li>
      ))}
    </ListTag>
  );
}

export function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 flex max-w-prose gap-3 rounded-xl border border-border bg-muted/60 p-4 text-sm leading-6 text-foreground/80">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

export function RecommendedReading({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="group mt-8 flex max-w-prose items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-brand-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-primary group-hover:bg-card">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
          Recommended reading
        </span>
        <span className="mt-0.5 block font-semibold text-foreground">{title}</span>
        <span className="mt-0.5 block text-sm text-muted-foreground">{description}</span>
      </span>
      <ArrowRight
        className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  );
}

export function DataTable({
  caption,
  columns,
  rows,
  footer,
}: {
  caption: string;
  columns: string[];
  rows: React.ReactNode[][];
  footer?: React.ReactNode[];
}) {
  return (
    <div
      role="region"
      aria-label={caption}
      tabIndex={0}
      className="mt-4 overflow-x-auto rounded-xl border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <table className="w-full min-w-[480px] text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-muted text-foreground">
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col" className="px-4 py-3 font-semibold">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t border-border">
              {row.map((cell, cellIndex) =>
                cellIndex === 0 ? (
                  <th key={cellIndex} scope="row" className="px-4 py-3 align-top font-semibold text-foreground">
                    {cell}
                  </th>
                ) : (
                  <td key={cellIndex} className="px-4 py-3 align-top leading-6 text-foreground/80">
                    {cell}
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
        {footer ? (
          <tfoot className="border-t border-border bg-brand-tint font-semibold text-foreground">
            <tr>
              {footer.map((cell, cellIndex) =>
                cellIndex === 0 ? (
                  <th key={cellIndex} scope="row" className="px-4 py-3">
                    {cell}
                  </th>
                ) : (
                  <td key={cellIndex} className="px-4 py-3">
                    {cell}
                  </td>
                )
              )}
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}

export function FaqItem({ question, children }: { question: string; children: React.ReactNode }) {
  return (
    <details className="group border-b border-border">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-semibold text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
        {question}
        <ChevronDown
          className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="pb-5 text-sm leading-6 text-foreground/80 [&_li]:mt-1 [&_ol]:mt-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol+p]:mt-2 [&_p+p]:mt-2 [&_p+ul]:mt-2 [&_ul+p]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
    </details>
  );
}
