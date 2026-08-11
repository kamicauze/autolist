import type { AppointmentRequestStatus } from "@/lib/appointments/appointment-domain";

export type AppointmentRequestItem = {
  id: string;
  listingId: string;
  buyerId: string | null;
  sellerId: string;
  dealerId: string | null;
  contactName: string;
  contactEmail: string | null;
  contactPhone: string | null;
  startAt: string;
  endAt: string;
  timezone: string;
  message: string | null;
  status: AppointmentRequestStatus;
  assignedAgentId: string | null;
  sellerNotes: string | null;
  sellerRespondedAt: string | null;
  statusChangedAt: string;
  createdAt: string;
  updatedAt: string;
  listing: {
    id: string;
    title: string;
  };
};

export type AppointmentsDashboardData = {
  access: "allowed" | "forbidden" | "unauthenticated";
  requests: AppointmentRequestItem[];
  generatedAt: string;
  error?: string | null;
};

export type UpdateAppointmentStatusResult =
  | {
      success: true;
      appointment: Pick<
        AppointmentRequestItem,
        "id" | "status" | "sellerNotes" | "sellerRespondedAt" | "statusChangedAt" | "updatedAt"
      >;
    }
  | { success: false; error: string };
