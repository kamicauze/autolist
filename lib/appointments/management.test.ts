import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAppointmentCalendarDays,
  buildAppointmentStatusMessage,
  canTransitionAppointment,
  getAppointmentDateKey,
  getAppointmentNextStatuses,
} from "./management";

test("appointment status transitions preserve the owner workflow", () => {
  assert.deepEqual(getAppointmentNextStatuses("pending"), [
    "confirmed",
    "declined",
    "reschedule_requested",
    "cancelled",
  ]);
  assert.equal(canTransitionAppointment("confirmed", "completed"), true);
  assert.equal(canTransitionAppointment("confirmed", "no_show"), true);
  assert.equal(canTransitionAppointment("completed", "confirmed"), false);
  assert.deepEqual(getAppointmentNextStatuses("declined"), []);
});

test("calendar grid starts on Monday and always contains six weeks", () => {
  const days = buildAppointmentCalendarDays(2026, 7);

  assert.equal(days.length, 42);
  assert.deepEqual(days[0], {
    dateKey: "2026-07-27",
    dayNumber: 27,
    inCurrentMonth: false,
  });
  assert.deepEqual(days[6], {
    dateKey: "2026-08-02",
    dayNumber: 2,
    inCurrentMonth: true,
  });
});

test("appointment dates and buyer notifications use the saved timezone", () => {
  assert.equal(
    getAppointmentDateKey("2026-08-11T21:30:00.000Z", "Africa/Nairobi"),
    "2026-08-12"
  );

  const message = buildAppointmentStatusMessage(
    {
      listing: { id: "listing-1", title: "2022 Isuzu NPR" },
      startAt: "2026-08-12T07:00:00.000Z",
      timezone: "Africa/Nairobi",
      sellerNotes: "Please bring identification to reception.",
    },
    "confirmed"
  );

  assert.equal(message.title, "Appointment request confirmed");
  assert.match(message.body, /2022 Isuzu NPR/);
  assert.match(message.body, /10:00/);
  assert.match(message.body, /Please bring identification/);
});
