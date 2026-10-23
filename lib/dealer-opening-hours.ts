export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
export type Weekday = (typeof WEEKDAYS)[number];
export type DayHours = { closed: boolean; opens: string; closes: string };
export type DealerOpeningHours = {
  version: 1;
  week: Record<Weekday, DayHours>;
  publicHoliday?: DayHours;
  holidays: { date: string; hours: DayHours }[];
};

export const TIME_CHOICES = Array.from({ length: 48 }, (_, index) =>
  `${String(Math.floor(index / 2)).padStart(2, "0")}:${index % 2 ? "30" : "00"}`
);
const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
export function validDayHours(value: unknown): value is DayHours {
  if (!value || typeof value !== "object") return false;
  const day = value as DayHours;
  return typeof day.closed === "boolean" && typeof day.opens === "string" && typeof day.closes === "string" &&
    timePattern.test(day.opens) && timePattern.test(day.closes) && (day.closed || day.opens < day.closes);
}
function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function parseOpeningHours(value?: string | null): DealerOpeningHours | null {
  if (!value) return null;
  try {
    const result = JSON.parse(value) as DealerOpeningHours;
    if (result?.version !== 1 || !result.week || !WEEKDAYS.every((day) => validDayHours(result.week[day])) ||
      (result.publicHoliday !== undefined && !validDayHours(result.publicHoliday)) ||
      !Array.isArray(result.holidays) || result.holidays.length > 30 ||
      !result.holidays.every((holiday) => holiday && validDate(holiday.date) && validDayHours(holiday.hours)) ||
      new Set(result.holidays.map((holiday) => holiday.date)).size !== result.holidays.length) return null;
    return result;
  } catch { return null; }
}
export function createOpeningHours(): DealerOpeningHours {
  return { version: 1, week: Object.fromEntries(WEEKDAYS.map((day) => [day, {
    closed: day === "Sunday", opens: "08:00", closes: day === "Saturday" ? "13:00" : "17:00",
  }])) as Record<Weekday, DayHours>, holidays: [] };
}
export function formatDayHours(hours: DayHours): string {
  return hours.closed ? "Closed" : `${hours.opens} – ${hours.closes}`;
}
export function openingHoursState(schedule: DealerOpeningHours, now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Nairobi", weekday: "long", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)!.value;
  const weekday = part("weekday") as Weekday;
  const date = `${part("year")}-${part("month")}-${part("day")}`;
  const time = `${part("hour")}:${part("minute")}`;
  const holiday = schedule.holidays.find((item) => item.date === date);
  const hours = holiday?.hours ?? schedule.week[weekday];
  const todayIndex = WEEKDAYS.indexOf(weekday);
  const days = [...WEEKDAYS.slice(todayIndex), ...WEEKDAYS.slice(0, todayIndex)].map((day, offset) => {
    const upcoming = new Date(`${date}T12:00:00Z`);
    upcoming.setUTCDate(upcoming.getUTCDate() + offset);
    const override = schedule.holidays.find((item) => item.date === upcoming.toISOString().slice(0, 10));
    return { day, hours: override?.hours ?? schedule.week[day], holiday: Boolean(override) };
  });
  return { weekday, hours, holiday: Boolean(holiday), open: !hours.closed && time >= hours.opens && time < hours.closes, days };
}
