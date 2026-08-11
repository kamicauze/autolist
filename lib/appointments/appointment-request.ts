import {
  buildListingAppointmentDays,
  LISTING_APPOINTMENT_TIME_SLOTS,
} from "@/lib/appointments/listing-appointment";
import { APPOINTMENT_TIMEZONE } from "@/lib/appointments/appointment-domain";

export const LISTING_APPOINTMENT_TIMEZONE = APPOINTMENT_TIMEZONE;

type AppointmentRequestInput = {
  date?: unknown;
  timeSlot?: unknown;
  contactName?: unknown;
  contactEmail?: unknown;
  contactPhone?: unknown;
  buyerMessage?: unknown;
};

type ValidAppointmentRequest = {
  date: string;
  dateLabel: string;
  timeSlot: (typeof LISTING_APPOINTMENT_TIME_SLOTS)[number];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  buyerMessage: string | null;
  startAt: string;
  endAt: string;
  timezone: typeof LISTING_APPOINTMENT_TIMEZONE;
};

export type AppointmentRequestValidationResult =
  | { success: true; data: ValidAppointmentRequest }
  | { success: false; error: string };

export function validateAppointmentListing({
  status,
  sellerId,
  viewerId,
}: {
  status: string;
  sellerId: string;
  viewerId?: string | null;
}) {
  if (status !== "active") {
    return "Only active listings can receive appointment requests.";
  }
  if (viewerId && viewerId === sellerId) {
    return "You cannot request an appointment for your own listing.";
  }
  return null;
}

const TIME_SLOT_HOURS: Record<
  (typeof LISTING_APPOINTMENT_TIME_SLOTS)[number],
  { start: number; end: number }
> = {
  "09:00 AM – 10:00 AM": { start: 9, end: 10 },
  "10:00 AM – 11:00 AM": { start: 10, end: 11 },
  "11:00 AM – 12:00 PM": { start: 11, end: 12 },
  "12:00 PM – 01:00 PM": { start: 12, end: 13 },
  "01:00 PM – 02:00 PM": { start: 13, end: 14 },
  "02:00 PM – 03:00 PM": { start: 14, end: 15 },
  "03:00 PM – 04:00 PM": { start: 15, end: 16 },
  "04:00 PM – 05:00 PM": { start: 16, end: 17 },
  "05:00 PM – 06:00 PM": { start: 17, end: 18 },
};

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isAllowedTimeSlot(
  value: string
): value is (typeof LISTING_APPOINTMENT_TIME_SLOTS)[number] {
  return LISTING_APPOINTMENT_TIME_SLOTS.some((slot) => slot === value);
}

function toNairobiIso(date: string, hour: number) {
  return new Date(`${date}T${String(hour).padStart(2, "0")}:00:00+03:00`).toISOString();
}

export function isListingAppointmentSlotInFuture(
  date: string,
  timeSlot: string,
  referenceDate = new Date()
) {
  if (!isAllowedTimeSlot(timeSlot)) return false;
  const hours = TIME_SLOT_HOURS[timeSlot];
  return new Date(toNairobiIso(date, hours.start)).getTime() > referenceDate.getTime();
}

export function validateAppointmentRequest(
  input: AppointmentRequestInput,
  referenceDate = new Date()
): AppointmentRequestValidationResult {
  const date = cleanString(input.date);
  const timeSlot = cleanString(input.timeSlot);
  const contactName = cleanString(input.contactName);
  const contactEmail = cleanString(input.contactEmail).toLowerCase();
  const contactPhone = cleanString(input.contactPhone);
  const buyerMessage = cleanString(input.buyerMessage);

  const allowedDay = buildListingAppointmentDays(referenceDate).find(
    (day) => day.dateKey === date
  );
  if (!allowedDay) {
    return {
      success: false,
      error: "Choose a viewing date within the next 14 days.",
    };
  }

  if (!isAllowedTimeSlot(timeSlot)) {
    return { success: false, error: "Choose one of the available one-hour time slots." };
  }

  if (!contactName || contactName.length > 120) {
    return { success: false, error: "Enter your name." };
  }

  if (!contactEmail && !contactPhone) {
    return {
      success: false,
      error: "Enter an email address or phone number so the seller can respond.",
    };
  }

  if (
    contactEmail &&
    (contactEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail))
  ) {
    return { success: false, error: "Enter a valid email address." };
  }

  if (contactPhone) {
    const digits = contactPhone.replace(/\D/g, "");
    if (contactPhone.length > 40 || digits.length < 7 || digits.length > 15) {
      return { success: false, error: "Enter a valid phone number." };
    }
  }

  if (buyerMessage.length > 250) {
    return { success: false, error: "Keep your message to 250 characters or fewer." };
  }

  const hours = TIME_SLOT_HOURS[timeSlot];
  const startAt = toNairobiIso(date, hours.start);
  if (new Date(startAt).getTime() <= referenceDate.getTime()) {
    return {
      success: false,
      error: "That time has already passed. Choose a future appointment slot.",
    };
  }

  return {
    success: true,
    data: {
      date,
      dateLabel: allowedDay.fullLabel,
      timeSlot,
      contactName,
      contactEmail,
      contactPhone,
      buyerMessage: buyerMessage || null,
      startAt,
      endAt: toNairobiIso(date, hours.end),
      timezone: LISTING_APPOINTMENT_TIMEZONE,
    },
  };
}

type SellerAppointmentNotificationInput = Pick<
  ValidAppointmentRequest,
  | "dateLabel"
  | "timeSlot"
  | "contactName"
  | "contactEmail"
  | "contactPhone"
  | "buyerMessage"
> & {
  listingTitle: string;
};

export function buildSellerAppointmentNotification(
  input: SellerAppointmentNotificationInput
) {
  const title = `New appointment request for ${input.listingTitle}`;
  const contact = [input.contactEmail, input.contactPhone].filter(Boolean).join(" · ");
  const emailBody = [
    `${input.contactName} requested an appointment to view ${input.listingTitle}.`,
    `Date: ${input.dateLabel}`,
    `Time: ${input.timeSlot} EAT`,
    `Contact: ${contact}`,
    input.buyerMessage ? `Message: ${input.buyerMessage}` : null,
    "Open Customer Requests to confirm, decline, or suggest another time.",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    title,
    inAppBody: `${input.contactName} requested ${input.dateLabel} at ${input.timeSlot} EAT.`,
    emailBody,
  };
}
