import assert from "node:assert/strict";
import test from "node:test";
import {
  buildListingAppointmentDays,
  buildListingAppointmentMessage,
  LISTING_APPOINTMENT_TIME_SLOTS,
} from "./listing-appointment";

test("appointment picker exposes exactly the next fourteen Nairobi calendar days", () => {
  const days = buildListingAppointmentDays(new Date("2026-08-07T09:00:00.000Z"));

  assert.equal(days.length, 14);
  assert.equal(days[0]?.dateKey, "2026-08-07");
  assert.equal(days[13]?.dateKey, "2026-08-20");
  assert.equal(days[0]?.fullLabel, "Friday, 7 August 2026");
});

test("appointment picker starts on the Nairobi date near the UTC day boundary", () => {
  const days = buildListingAppointmentDays(new Date("2026-08-06T22:30:00.000Z"));

  assert.equal(days[0]?.dateKey, "2026-08-07");
});

test("appointment request message keeps the selected date, time, and optional note", () => {
  assert.equal(
    buildListingAppointmentMessage({
      dateLabel: "Friday, 7 August 2026",
      timeSlot: LISTING_APPOINTMENT_TIME_SLOTS[1],
      note: "Please confirm the exact viewing location.",
    }),
    [
      "Appointment request",
      "Preferred date: Friday, 7 August 2026",
      "Preferred time: 10:00 AM – 11:00 AM EAT",
      "Message: Please confirm the exact viewing location.",
    ].join("\n")
  );
});
