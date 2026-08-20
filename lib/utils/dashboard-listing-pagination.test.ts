import assert from "node:assert/strict";
import test from "node:test";
import {
  buildDashboardPaginationItems,
  clampDashboardPage,
  paginateDashboardItems,
} from "./dashboard-listing-pagination";

test("one listing cannot remain on page three", () => {
  assert.equal(clampDashboardPage(3, 1, 10), 1);
  assert.deepEqual(paginateDashboardItems(["only listing"], 3, 10), {
    currentPage: 1,
    totalPages: 1,
    items: ["only listing"],
  });
});

test("pagination slices the requested page and exposes compact controls", () => {
  const rows = Array.from({ length: 95 }, (_, index) => index + 1);
  assert.deepEqual(
    paginateDashboardItems(rows, 3, 10).items,
    [21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
  );
  assert.deepEqual(buildDashboardPaginationItems(5, 10), [
    1,
    "ellipsis",
    4,
    5,
    6,
    "ellipsis",
    10,
  ]);
});
