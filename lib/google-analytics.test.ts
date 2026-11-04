import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getAnalyticsPageLocation,
  getAnalyticsReferrer,
  getGoogleAnalyticsMeasurementId,
  isAnalyticsPageAllowed,
} from "./google-analytics";

test("Google Analytics requires a valid ID and a production build", () => {
  assert.equal(getGoogleAnalyticsMeasurementId("production", "G-ABC123"), "G-ABC123");
  for (const environment of ["preview", "development", ""]) {
    assert.equal(getGoogleAnalyticsMeasurementId(environment, "G-ABC123"), null);
  }
  for (const id of ["", "UA-123", "G-", "G-ABC<script>"]) {
    assert.equal(getGoogleAnalyticsMeasurementId("production", id), null);
  }
});

test("only canonical public pages can collect analytics", () => {
  for (const path of ["/", "/search", "/vehicle/sample-vehicle", "/dealers", "/blog/buying-a-car", "/cookies"]) {
    assert.equal(isAnalyticsPageAllowed(path, "autolist.co.ke"), true, path);
  }
  for (const path of ["/admin", "/admin/users", "/dashboard/profile", "/auth/callback", "/login", "/register/dealer", "/reset-password", "/messages", "/join/sales-agent/private-token", "/sell/dashboard", "/alerts", "/recently-viewed", "//example.com"]) {
    assert.equal(isAnalyticsPageAllowed(path, "autolist.co.ke"), false, path);
  }
  for (const host of ["localhost", "beta.autolist.co.ke", "autolist.vercel.app"]) {
    assert.equal(isAnalyticsPageAllowed("/", host), false);
  }
});

test("analytics URLs discard query strings and fragments", () => {
  assert.equal(getAnalyticsPageLocation("/search?email=private%40example.com#contact"), "https://autolist.co.ke/search");
  assert.equal(getAnalyticsReferrer("https://autolist.co.ke/search?q=private#results"), "https://autolist.co.ke/search");
  assert.equal(getAnalyticsReferrer("https://www.google.com/search?q=private"), "https://www.google.com");
  assert.equal(getAnalyticsReferrer("https://autolist.co.ke/reset-password?token=private"), "");
  assert.equal(getAnalyticsReferrer("https://autolist.co.ke/join/sales-agent/private-token"), "");
  assert.equal(getAnalyticsReferrer("javascript:private"), "");
  assert.equal(getAnalyticsReferrer(""), "");
});
