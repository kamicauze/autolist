const kesFormatter = new Intl.NumberFormat("en-KE", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatAmount(amount: number) {
  return kesFormatter.format(Number.isFinite(amount) ? amount : 0);
}

export function formatKes(amount: number) {
  return `KES ${formatAmount(amount)}`;
}

/** Parses a digits-only (or comma-formatted) amount string; blank or invalid becomes 0. */
export function parseAmount(value: string) {
  const parsed = Number(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}
