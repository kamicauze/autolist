import assert from "node:assert/strict";
import test from "node:test";
import {
  buildSellerAppointmentNotification,
  isListingAppointmentSlotInFuture,
  validateAppointmentListing,
  validateAppointmentRequest,
} from "./appointment-request";

const referenceDate = new Date("2026-08-11T06:00:00.000Z");

test("allows active third-party listings and rejects inactive or owned listings", () => {
  assert.equal(
    validateAppointmentListing({
      status: "active",
      sellerId: "seller-1",
      viewerId: "buyer-1",
    }),
    null
  );
  assert.equal(
    validateAppointmentListing({ status: "draft", sellerId: "seller-1" }),
    "Only active listings can receive appointment requests."
  );
  assert.equal(
    validateAppointmentListing({
      status: "active",
      sellerId: "seller-1",
      viewerId: "seller-1",
    }),
    "You cannot request an appointment for your own listing."
  );
});

test("validates a Nairobi appointment and produces an exact one-hour UTC range", () => {
  const result = validateAppointmentRequest(
    {
      date: "2026-08-11",
      timeSlot: "10:00 AM – 11:00 AM",
      contactName: "Amina Buyer",
      contactEmail: " AMINA@EXAMPLE.COM ",
      buyerMessage: "Please share the showroom entrance.",
    },
    referenceDate
  );

  assert.equal(result.success, true);
  if (!result.success) return;
  assert.equal(result.data.startAt, "2026-08-11T07:00:00.000Z");
  assert.equal(result.data.endAt, "2026-08-11T08:00:00.000Z");
  assert.equal(result.data.contactEmail, "amina@example.com");
  assert.equal(result.data.timezone, "Africa/Nairobi");
});

test("rejects dates outside the inclusive fourteen-day Nairobi window", () => {
  const tooLate = validateAppointmentRequest(
    {
      date: "2026-08-25",
      timeSlot: "09:00 AM – 10:00 AM",
      contactName: "Amina Buyer",
      contactPhone: "+254 700 000 000",
    },
    referenceDate
  );
  const yesterday = validateAppointmentRequest(
    {
      date: "2026-08-10",
      timeSlot: "09:00 AM – 10:00 AM",
      contactName: "Amina Buyer",
      contactPhone: "+254 700 000 000",
    },
    referenceDate
  );

  assert.deepEqual(tooLate, {
    success: false,
    error: "Choose a viewing date within the next 14 days.",
  });
  assert.equal(yesterday.success, false);
});

test("rejects invented slots and missing response contact details", () => {
  const invalidSlot = validateAppointmentRequest(
    {
      date: "2026-08-12",
      timeSlot: "10:30 AM – 11:30 AM",
      contactName: "Amina Buyer",
      contactEmail: "amina@example.com",
    },
    referenceDate
  );
  const missingContact = validateAppointmentRequest(
    {
      date: "2026-08-12",
      timeSlot: "10:00 AM – 11:00 AM",
      contactName: "Amina Buyer",
    },
    referenceDate
  );

  assert.equal(invalidSlot.success, false);
  assert.deepEqual(missingContact, {
    success: false,
    error: "Enter an email address or phone number so the seller can respond.",
  });
});

test("rejects today's elapsed slots while allowing a later start", () => {
  const now = new Date("2026-08-11T08:30:00.000Z"); // 11:30 EAT
  const elapsed = validateAppointmentRequest(
    {
      date: "2026-08-11",
      timeSlot: "10:00 AM – 11:00 AM",
      contactName: "Amina Buyer",
      contactPhone: "+254 700 000 000",
    },
    now
  );

  assert.deepEqual(elapsed, {
    success: false,
    error: "That time has already passed. Choose a future appointment slot.",
  });
  assert.equal(
    isListingAppointmentSlotInFuture("2026-08-11", "10:00 AM – 11:00 AM", now),
    false
  );
  assert.equal(
    isListingAppointmentSlotInFuture("2026-08-11", "12:00 PM – 01:00 PM", now),
    true
  );
});

test("builds seller notification copy with appointment and contact details", () => {
  const notification = buildSellerAppointmentNotification({
    listingTitle: "2022 Toyota Hilux",
    dateLabel: "Tuesday, 11 August 2026",
    timeSlot: "10:00 AM – 11:00 AM",
    contactName: "Amina Buyer",
    contactEmail: "amina@example.com",
    contactPhone: "+254 700 000 000",
    buyerMessage: "Please confirm parking.",
  });

  assert.equal(notification.title, "New appointment request for 2022 Toyota Hilux");
  assert.match(notification.inAppBody, /Amina Buyer.*Tuesday, 11 August 2026/);
  assert.match(notification.emailBody, /amina@example\.com · \+254 700 000 000/);
  assert.match(notification.emailBody, /confirm, decline, or suggest another time/);
});
