export function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="shrink-0 font-semibold text-foreground tabular-nums">{value}</dd>
    </div>
  );
}
