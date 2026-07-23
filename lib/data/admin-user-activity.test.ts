import assert from "node:assert/strict";
import {
  buildAdminUserActivityModules,
  groupAdminUserActivityTimelineByDay,
  summarizeAdminUserActivity,
  sortAdminUserActivityTimeline,
  type AdminUserActivityItem,
} from "./admin-user-activity";

const timeline: AdminUserActivityItem[] = [
  {
    id: "listing-1",
    source: "listing",
    title: "Listed 2020 Toyota Prado",
    detail: "Dealer inventory",
    occurredAt: "2026-01-12T08:00:00.000Z",
    href: "/admin/listings?listing=listing-1",
  },
  {
    id: "enquiry-1",
    source: "enquiry_received",
    title: "Received an enquiry on 2020 Toyota Prado",
    detail: "Buyer asked if the vehicle is available.",
    occurredAt: "2026-01-12T10:00:00.000Z",
    href: "/admin/car-inquiries",
  },
  {
    id: "message-1",
    source: "message",
    title: "Sent conversation message",
    detail: "We can arrange viewing today.",
    occurredAt: "2026-01-11T14:00:00.000Z",
    href: "/admin/car-inquiries",
  },
];

const sorted = sortAdminUserActivityTimeline(timeline);

assert.deepEqual(
  sorted.map((item) => item.source),
  ["enquiry_received", "listing", "message"]
);

assert.equal(sorted[0].detail, "Buyer asked if the vehicle is available.");

assert.deepEqual(
  groupAdminUserActivityTimelineByDay(timeline).map((group) => ({
    dateKey: group.dateKey,
    ids: group.items.map((item) => item.id),
  })),
  [
    {
      dateKey: "2026-01-12",
      ids: ["enquiry-1", "listing-1"],
    },
    {
      dateKey: "2026-01-11",
      ids: ["message-1"],
    },
  ]
);

assert.deepEqual(
  summarizeAdminUserActivity({
    listings: 3,
    activeListings: 2,
    sentEnquiries: 4,
    receivedEnquiries: 7,
    conversations: 5,
    supportTickets: 1,
    payments: 2,
    favorites: 9,
    reviewsWritten: 2,
    reviewsReceived: 6,
    offersMade: 1,
    offersReceived: 3,
  }),
  [
    { label: "Listings", value: 3, note: "2 active" },
    { label: "Enquiries", value: 11, note: "4 sent / 7 received" },
    { label: "Conversations", value: 5, note: "1 support tickets" },
    { label: "Commerce", value: 6, note: "2 payments / 4 offers" },
    { label: "Engagement", value: 17, note: "9 favorites / 8 reviews" },
  ]
);

assert.deepEqual(
  buildAdminUserActivityModules({
    timeline: 14,
    listings: 3,
    dealerDocuments: 2,
    sentEnquiries: 4,
    receivedEnquiries: 7,
    conversations: 5,
    messages: 9,
    supportTickets: 1,
    payments: 2,
    entitlements: 1,
    favorites: 9,
    reviewsWritten: 2,
    reviewsReceived: 6,
    offersMade: 1,
    offersReceived: 3,
    auditLogs: 8,
  }).map((module) => [module.key, module.count, module.href]),
  [
    ["timeline", 14, "#timeline"],
    ["listings", 3, "#listings"],
    ["dealer", 2, "#dealer-verification"],
    ["enquiries", 11, "#enquiries"],
    ["messages", 14, "#messages"],
    ["commerce", 7, "#commerce"],
    ["engagement", 21, "#engagement"],
    ["audit", 8, "#audit"],
  ]
);
