import assert from "node:assert/strict";
import { createOpeningHours, formatDayHours, openingHoursState, parseOpeningHours } from "./dealer-opening-hours";

const schedule = createOpeningHours();
assert.equal(parseOpeningHours("Mon–Fri 8am to 5pm"), null);
assert.deepEqual(parseOpeningHours(JSON.stringify(schedule)), schedule);
assert.equal(parseOpeningHours(JSON.stringify({ ...schedule, week: {} })), null);
assert.equal(formatDayHours(schedule.week.Sunday), "Closed");

// UTC Thursday night is already Friday in Nairobi.
let state = openingHoursState(schedule, new Date("2026-10-22T22:30:00Z"));
assert.equal(state.weekday, "Friday");
assert.deepEqual(state.days.map((item) => item.day), ["Friday", "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"]);
assert.equal(state.open, false);
assert.equal(openingHoursState(schedule, new Date("2026-10-23T05:00:00Z")).open, true);
assert.equal(openingHoursState(schedule, new Date("2026-10-23T14:00:00Z")).open, false);
assert.equal(openingHoursState(schedule, new Date("2026-10-25T08:00:00Z")).open, false);

schedule.publicHoliday = { closed: true, opens: "09:00", closes: "13:00" };
schedule.holidays.push({ date: "2026-10-23", hours: schedule.publicHoliday });
state = openingHoursState(schedule, new Date("2026-10-23T08:00:00Z"));
assert.equal(state.holiday, true);
assert.equal(state.open, false);
assert.equal(state.days[0].holiday, true);
assert.equal(state.days[1].holiday, false);
schedule.holidays[0].hours = { closed: false, opens: "10:00", closes: "12:00" };
assert.equal(openingHoursState(schedule, new Date("2026-10-23T08:00:00Z")).open, true);
assert.equal(parseOpeningHours(JSON.stringify({ ...schedule, holidays: [{ date: "2026-02-30", hours: schedule.publicHoliday }] })), null);
assert.equal(parseOpeningHours(JSON.stringify({ ...schedule, holidays: [schedule.holidays[0], schedule.holidays[0]] })), null);
assert.equal(parseOpeningHours(JSON.stringify({ ...schedule, week: { ...schedule.week, Monday: { closed: false, opens: "17:00", closes: "08:00" } } })), null);
assert.equal(parseOpeningHours(JSON.stringify({ ...schedule, week: { ...schedule.week, Monday: { closed: false, opens: "25:00", closes: "26:00" } } })), null);
console.log("Dealer opening hours tests passed");
