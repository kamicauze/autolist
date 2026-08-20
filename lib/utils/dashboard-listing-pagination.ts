export type DashboardPaginationItem = number | "ellipsis";

export function getDashboardTotalPages(totalItems: number, pageSize: number) {
  if (!Number.isFinite(pageSize) || pageSize <= 0) return 1;
  return Math.max(1, Math.ceil(Math.max(0, totalItems) / pageSize));
}

export function clampDashboardPage(
  requestedPage: number,
  totalItems: number,
  pageSize: number,
) {
  const totalPages = getDashboardTotalPages(totalItems, pageSize);
  if (!Number.isFinite(requestedPage)) return 1;
  return Math.min(totalPages, Math.max(1, Math.trunc(requestedPage)));
}

export function paginateDashboardItems<T>(
  items: T[],
  requestedPage: number,
  pageSize: number,
) {
  const currentPage = clampDashboardPage(requestedPage, items.length, pageSize);
  const start = (currentPage - 1) * pageSize;
  return {
    currentPage,
    totalPages: getDashboardTotalPages(items.length, pageSize),
    items: items.slice(start, start + pageSize),
  };
}

export function buildDashboardPaginationItems(
  currentPage: number,
  totalPages: number,
): DashboardPaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([
    1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ]);
  const ordered = [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
  const result: DashboardPaginationItem[] = [];

  ordered.forEach((page, index) => {
    const previous = ordered[index - 1];
    if (previous && page - previous > 1) result.push("ellipsis");
    result.push(page);
  });

  return result;
}
