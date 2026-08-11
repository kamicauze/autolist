export const APPOINTMENT_TIMEZONE = "Africa/Nairobi" as const;

export const APPOINTMENT_REQUEST_STATUSES = [
  "pending",
  "confirmed",
  "declined",
  "reschedule_requested",
  "completed",
  "cancelled",
  "no_show",
] as const;

export type AppointmentRequestStatus =
  (typeof APPOINTMENT_REQUEST_STATUSES)[number];

export type AppointmentRequestRecord = {
  id: string;
  listing_id: string;
  buyer_id: string | null;
  seller_id: string;
  dealer_id: string | null;
  assigned_agent_id: string | null;
  contact_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  start_at: string;
  end_at: string;
  timezone: typeof APPOINTMENT_TIMEZONE;
  status: AppointmentRequestStatus;
  message: string | null;
  seller_notes: string | null;
  seller_responded_at: string | null;
  status_changed_at: string;
  created_at: string;
  updated_at: string;
};

const OPEN_APPOINTMENT_STATUSES = new Set<AppointmentRequestStatus>([
  "pending",
  "confirmed",
  "reschedule_requested",
]);

const APPOINTMENT_STATUS_LABELS: Record<AppointmentRequestStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  declined: "Declined",
  reschedule_requested: "Reschedule requested",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show",
};

export function isAppointmentRequestStatus(
  value: string,
): value is AppointmentRequestStatus {
  return (APPOINTMENT_REQUEST_STATUSES as readonly string[]).includes(value);
}

export function isOpenAppointmentStatus(
  status: AppointmentRequestStatus,
): boolean {
  return OPEN_APPOINTMENT_STATUSES.has(status);
}

export function getAppointmentStatusLabel(
  status: AppointmentRequestStatus,
): string {
  return APPOINTMENT_STATUS_LABELS[status];
}

export function isValidAppointmentRange(startAt: string, endAt: string): boolean {
  const start = Date.parse(startAt);
  const end = Date.parse(endAt);

  return (
    Number.isFinite(start) &&
    Number.isFinite(end) &&
    end - start === 60 * 60 * 1_000
  );
}
