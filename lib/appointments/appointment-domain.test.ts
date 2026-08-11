import assert from "node:assert/strict";
import test from "node:test";

import {
  APPOINTMENT_REQUEST_STATUSES,
  APPOINTMENT_TIMEZONE,
  getAppointmentStatusLabel,
  isAppointmentRequestStatus,
  isOpenAppointmentStatus,
  isValidAppointmentRange,
} from "./appointment-domain";

test("appointment domain pins the database status and timezone contract", () => {
  assert.equal(APPOINTMENT_TIMEZONE, "Africa/Nairobi");
  assert.deepEqual(APPOINTMENT_REQUEST_STATUSES, [
    "pending",
    "confirmed",
    "declined",
    "reschedule_requested",
    "completed",
    "cancelled",
    "no_show",
  ]);
  assert.equal(isAppointmentRequestStatus("confirmed"), true);
  assert.equal(isAppointmentRequestStatus("accepted"), false);
});

test("appointment queue helpers distinguish open and terminal states", () => {
  assert.equal(isOpenAppointmentStatus("pending"), true);
  assert.equal(isOpenAppointmentStatus("reschedule_requested"), true);
  assert.equal(isOpenAppointmentStatus("completed"), false);
  assert.equal(getAppointmentStatusLabel("no_show"), "No-show");
});

test("appointment ranges require valid timestamps with a one-hour duration", () => {
  assert.equal(
    isValidAppointmentRange(
      "2026-08-12T07:00:00.000Z",
      "2026-08-12T08:00:00.000Z",
    ),
    true,
  );
  assert.equal(
    isValidAppointmentRange(
      "2026-08-12T08:00:00.000Z",
      "2026-08-12T07:00:00.000Z",
    ),
    false,
  );
  assert.equal(
    isValidAppointmentRange(
      "2026-08-12T07:00:00.000Z",
      "2026-08-12T07:30:00.000Z",
    ),
    false,
  );
  assert.equal(isValidAppointmentRange("invalid", "also-invalid"), false);
});
