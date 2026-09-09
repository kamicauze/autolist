import assert from "node:assert/strict";
import test from "node:test";
import { isSupportQueueViewerRole } from "./messaging";

test("support queue accepts staff roles that can manage tickets", () => {
  assert.equal(isSupportQueueViewerRole("support"), true);
  assert.equal(isSupportQueueViewerRole("admin"), true);
  assert.equal(isSupportQueueViewerRole("super_admin"), true);
});

test("support queue rejects marketplace-only roles", () => {
  assert.equal(isSupportQueueViewerRole("buyer"), false);
  assert.equal(isSupportQueueViewerRole("seller"), false);
  assert.equal(isSupportQueueViewerRole("dealer"), false);
  assert.equal(isSupportQueueViewerRole("sales_agent"), false);
  assert.equal(isSupportQueueViewerRole(null), false);
  assert.equal(isSupportQueueViewerRole(undefined), false);
});
