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

test("listing pagination supports twenty item admin and public pages", () => {
  const rows = Array.from({ length: 94 }, (_, index) => index + 1);

  assert.deepEqual(paginateDashboardItems(rows, 1, 20), {
    currentPage: 1,
    totalPages: 5,
    items: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
      11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    ],
  });
  assert.deepEqual(
    paginateDashboardItems(rows, 5, 20).items,
    [81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94]
  );
});
