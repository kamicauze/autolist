import {
  APPOINTMENT_REQUEST_STATUSES,
  getAppointmentStatusLabel,
  type AppointmentRequestStatus,
} from "@/lib/appointments/appointment-domain";
import type { AppointmentRequestItem } from "@/lib/types/appointments";

export const APPOINTMENT_STATUS_PRESENTATION: Record<
  AppointmentRequestStatus,
  { label: string; tone: "neutral" | "blue" | "green" | "amber" | "red" }
> = {
  pending: { label: "Pending", tone: "amber" },
  confirmed: { label: "Confirmed", tone: "green" },
  reschedule_requested: { label: "Reschedule requested", tone: "blue" },
  declined: { label: "Declined", tone: "red" },
  completed: { label: "Completed", tone: "green" },
  cancelled: { label: "Cancelled", tone: "neutral" },
  no_show: { label: "No-show", tone: "red" },
};

const APPOINTMENT_TRANSITIONS: Record<
  AppointmentRequestStatus,
  readonly AppointmentRequestStatus[]
> = {
  pending: ["confirmed", "declined", "reschedule_requested", "cancelled"],
  confirmed: ["completed", "cancelled", "no_show", "reschedule_requested"],
  reschedule_requested: ["confirmed", "declined", "cancelled"],
  declined: [],
  completed: [],
  cancelled: [],
  no_show: [],
};

export function parseAppointmentStatus(value: unknown): AppointmentRequestStatus | null {
  return typeof value === "string" &&
    APPOINTMENT_REQUEST_STATUSES.includes(value as AppointmentRequestStatus)
    ? (value as AppointmentRequestStatus)
    : null;
}

export function getAppointmentNextStatuses(status: AppointmentRequestStatus) {
  return [...APPOINTMENT_TRANSITIONS[status]];
}

export function canTransitionAppointment(
  currentStatus: AppointmentRequestStatus,
  nextStatus: AppointmentRequestStatus
) {
  return APPOINTMENT_TRANSITIONS[currentStatus].includes(nextStatus);
}

export type AppointmentCalendarDay = {
  dateKey: string;
  dayNumber: number;
  inCurrentMonth: boolean;
};

export function buildAppointmentCalendarDays(
  year: number,
  monthIndex: number
): AppointmentCalendarDay[] {
  const first = new Date(Date.UTC(year, monthIndex, 1));
  const mondayOffset = (first.getUTCDay() + 6) % 7;
  const gridStart = new Date(Date.UTC(year, monthIndex, 1 - mondayOffset));

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setUTCDate(gridStart.getUTCDate() + index);
    return {
      dateKey: date.toISOString().slice(0, 10),
      dayNumber: date.getUTCDate(),
      inCurrentMonth: date.getUTCMonth() === monthIndex,
    };
  });
}

export function getAppointmentDateKey(value: string, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function buildAppointmentStatusMessage(
  appointment: Pick<
    AppointmentRequestItem,
    "listing" | "startAt" | "timezone" | "sellerNotes"
  >,
  status: AppointmentRequestStatus
) {
  const statusLabel = getAppointmentStatusLabel(status).toLowerCase();
  const schedule = new Intl.DateTimeFormat("en-KE", {
    timeZone: appointment.timezone,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(appointment.startAt));
  const note = appointment.sellerNotes?.trim();

  return {
    title: `Appointment request ${statusLabel}`,
    body: [
      `Your appointment request for ${appointment.listing.title} on ${schedule} is ${statusLabel}.`,
      note ? `Seller note: ${note}` : null,
    ]
      .filter(Boolean)
      .join(" "),
  };
}
