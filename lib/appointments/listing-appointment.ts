export const LISTING_APPOINTMENT_TIME_SLOTS = [
  "09:00 AM – 10:00 AM",
  "10:00 AM – 11:00 AM",
  "11:00 AM – 12:00 PM",
  "12:00 PM – 01:00 PM",
  "01:00 PM – 02:00 PM",
  "02:00 PM – 03:00 PM",
  "03:00 PM – 04:00 PM",
  "04:00 PM – 05:00 PM",
  "05:00 PM – 06:00 PM",
] as const;

export type ListingAppointmentDay = {
  date: Date;
  dateKey: string;
  dayLabel: string;
  dayNumber: string;
  monthLabel: string;
  fullLabel: string;
};

const DAY_FORMATTER = new Intl.DateTimeFormat("en-KE", {
  timeZone: "Africa/Nairobi",
  weekday: "short",
});

const DAY_NUMBER_FORMATTER = new Intl.DateTimeFormat("en-KE", {
  timeZone: "Africa/Nairobi",
  day: "numeric",
});

const MONTH_FORMATTER = new Intl.DateTimeFormat("en-KE", {
  timeZone: "Africa/Nairobi",
  month: "short",
});

const FULL_DATE_FORMATTER = new Intl.DateTimeFormat("en-KE", {
  timeZone: "Africa/Nairobi",
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function toNairobiDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

export function buildListingAppointmentDays(
  referenceDate = new Date(),
  count = 14
): ListingAppointmentDay[] {
  if (!Number.isInteger(count) || count < 1) {
    return [];
  }

  const [year, month, day] = toNairobiDateKey(referenceDate)
    .split("-")
    .map((value) => Number(value));
  const firstDay = new Date(Date.UTC(year, month - 1, day, 12));

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(firstDay);
    date.setUTCDate(firstDay.getUTCDate() + index);

    return {
      date,
      dateKey: toNairobiDateKey(date),
      dayLabel: DAY_FORMATTER.format(date),
      dayNumber: DAY_NUMBER_FORMATTER.format(date),
      monthLabel: MONTH_FORMATTER.format(date).toUpperCase(),
      fullLabel: FULL_DATE_FORMATTER.format(date),
    };
  });
}
