import assert from "node:assert/strict";
import test from "node:test";
import { buildListingAlertNotification } from "./listing-alert-notification";

const baseInput = {
  alertId: "alert-1",
  recipientId: "user-1",
  listingId: "listing-1",
  listingTitle: "2022 Toyota Corolla",
  listingPrice: 2_400_000,
  previousPrice: null,
  matchType: "new_listing" as const,
  emailEnabled: false,
};

test("every listing alert creates an in-app delivery linked to the listing", () => {
  const notification = buildListingAlertNotification(baseInput);

  assert.equal(notification.title, "New match: 2022 Toyota Corolla");
  assert.equal(notification.href, "/vehicle/listing-1");
  assert.equal(notification.deliveries.length, 1);
  assert.equal(notification.deliveries[0]?.recipientId, "user-1");
  assert.equal(notification.deliveries[0]?.channel, undefined);
  assert.deepEqual(notification.deliveries[0]?.metadata, {
    alert_id: "alert-1",
    match_type: "new_listing",
  });
});

test("email is queued only when the saved alert enables it", () => {
  const notification = buildListingAlertNotification({
    ...baseInput,
    emailEnabled: true,
  });

  assert.equal(notification.deliveries.length, 2);
  assert.deepEqual(
    notification.deliveries.map(({ channel }) => channel || "in_app"),
    ["in_app", "email"]
  );
});

test("price-drop copy includes both prices when the previous price is known", () => {
  const notification = buildListingAlertNotification({
    ...baseInput,
    matchType: "price_drop",
    previousPrice: 2_500_000,
  });

  assert.equal(notification.title, "Price dropped: 2022 Toyota Corolla");
  assert.match(notification.body, /Ksh\s*2,400,000/);
  assert.match(notification.body, /down from Ksh\s*2,500,000/);
});
