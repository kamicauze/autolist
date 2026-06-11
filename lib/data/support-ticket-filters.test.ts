import assert from "node:assert/strict";
import {
  filterAdminVisibleSupportTickets,
  isAdminVisibleSupportTicket,
  LISTING_ENQUIRY_TICKET_CATEGORIES,
} from "./support-ticket-filters";

assert.equal(isAdminVisibleSupportTicket({ category: "insurance_request" }), true);
assert.equal(isAdminVisibleSupportTicket({ category: "listing_enquiry" }), false);
assert.equal(isAdminVisibleSupportTicket({ category: "public_listing_enquiry" }), false);

assert.deepEqual(
  filterAdminVisibleSupportTickets([
    { id: "ticket-1", category: "listing_enquiry" },
    { id: "ticket-2", category: "inquiries_assistance" },
    { id: "ticket-3", category: "public_listing_enquiry" },
  ]).map((ticket) => ticket.id),
  ["ticket-2"]
);

assert.deepEqual(
  Array.from(LISTING_ENQUIRY_TICKET_CATEGORIES).sort(),
  ["listing_enquiry", "public_listing_enquiry"]
);
