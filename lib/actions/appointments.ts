"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  APPOINTMENT_REQUEST_STATUSES,
  type AppointmentRequestStatus,
} from "@/lib/appointments/appointment-domain";
import {
  buildAppointmentStatusMessage,
  canTransitionAppointment,
  parseAppointmentStatus,
} from "@/lib/appointments/management";
import { getSalesAgentViewerContext } from "@/lib/data/sales-agent-permissions";
import { sendProviderEmail } from "@/lib/server/delivery-providers";
import { emitNotificationEvent } from "@/lib/server/notifications";
import { createClient } from "@/lib/supabase/server";
import type { UpdateAppointmentStatusResult } from "@/lib/types/appointments";

const updateAppointmentSchema = z.object({
  appointmentId: z.string().uuid("Invalid appointment request."),
  status: z.enum(APPOINTMENT_REQUEST_STATUSES),
  sellerNotes: z.string().trim().max(2000, "Keep notes to 2,000 characters or fewer.").optional(),
});

type AppointmentActionRow = {
  id: string;
  listing_id: string;
  buyer_id: string | null;
  seller_id: string;
  dealer_id: string | null;
  contact_email: string | null;
  start_at: string;
  timezone: string | null;
  status: string;
  seller_notes: string | null;
  seller_responded_at: string | null;
  status_changed_at: string;
  updated_at: string;
  listing:
    | { id: string; year: number | null; make: string | null; model: string | null }
    | Array<{ id: string; year: number | null; make: string | null; model: string | null }>
    | null;
};

type AppointmentActorResult =
  | { ok: false; error: string }
  | {
      ok: true;
      supabase: Awaited<ReturnType<typeof createClient>>;
      actorId: string;
      sellerId: string;
      dealerId: string | null;
    };

async function getAppointmentActor(): Promise<AppointmentActorResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, error: "AUTH_REQUIRED" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: string | null }>();

  if (profile?.role === "sales_agent") {
    const repContext = await getSalesAgentViewerContext();
    if (!repContext?.permissions.includes("enquiries.respond")) {
      return {
        ok: false,
        error: "You do not have permission to manage customer requests.",
      };
    }

    return {
      ok: true,
      supabase,
      actorId: user.id,
      sellerId: repContext.principalProfileId,
      dealerId: repContext.dealerId,
    };
  }

  if (profile?.role !== "seller" && profile?.role !== "dealer") {
    return { ok: false, error: "Only listing owners can manage customer requests." };
  }

  return {
    ok: true,
    supabase,
    actorId: user.id,
    sellerId: user.id,
    dealerId: null,
  };
}

function firstRelation<T>(value: T | T[] | null) {
  return Array.isArray(value) ? value[0] || null : value;
}

function listingTitle(row: AppointmentActionRow) {
  const listing = firstRelation(row.listing);
  return [listing?.year, listing?.make, listing?.model].filter(Boolean).join(" ") || "Listing";
}

async function notifyAppointmentStatusChange(
  row: AppointmentActionRow,
  actorId: string,
  status: AppointmentRequestStatus
) {
  const message = buildAppointmentStatusMessage(
    {
      listing: { id: row.listing_id, title: listingTitle(row) },
      startAt: row.start_at,
      timezone: row.timezone || "Africa/Nairobi",
      sellerNotes: row.seller_notes,
    },
    status
  );

  if (row.buyer_id) {
    await emitNotificationEvent({
      eventType: "appointment_status_changed",
      actorId,
      listingId: row.listing_id,
      payload: {
        appointmentId: row.id,
        status,
        startAt: row.start_at,
        timezone: row.timezone || "Africa/Nairobi",
      },
      deliveries: [
        {
          recipientId: row.buyer_id,
          title: message.title,
          body: message.body,
          href: `/vehicle/${row.listing_id}`,
          metadata: { appointmentId: row.id, status },
        },
        {
          recipientId: row.buyer_id,
          channel: "email",
          title: message.title,
          body: message.body,
          href: `/vehicle/${row.listing_id}`,
          metadata: { appointmentId: row.id, status },
        },
      ],
    });
    return;
  }

  if (row.contact_email) {
    const result = await sendProviderEmail({
      to: row.contact_email,
      subject: message.title,
      text: message.body,
    });
    if (!result.success) {
      console.error("Appointment guest email delivery failed", {
        appointmentId: row.id,
        skipped: result.skipped,
        error: result.error,
      });
    }
  }
}

export async function updateAppointmentStatus(input: {
  appointmentId: string;
  status: AppointmentRequestStatus;
  sellerNotes?: string;
}): Promise<UpdateAppointmentStatusResult> {
  const parsed = updateAppointmentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid request." };
  }

  if (parsed.data.status === "reschedule_requested" && !parsed.data.sellerNotes?.trim()) {
    return {
      success: false,
      error: "Add a note explaining the timing you would like the customer to change.",
    };
  }

  const actor = await getAppointmentActor();
  if (!actor.ok) {
    return { success: false, error: actor.error };
  }

  let requestQuery = actor.supabase
    .from("appointment_requests")
    .select(
      `
        id,
        listing_id,
        buyer_id,
        seller_id,
        dealer_id,
        contact_email,
        start_at,
        timezone,
        status,
        seller_notes,
        seller_responded_at,
        status_changed_at,
        updated_at,
        listing:listings!listing_id(id, year, make, model)
      `
    )
    .eq("id", parsed.data.appointmentId)
    .eq("seller_id", actor.sellerId);

  if (actor.dealerId) {
    requestQuery = requestQuery.eq("dealer_id", actor.dealerId);
  }

  const { data: currentRow, error: readError } = await requestQuery.maybeSingle();
  if (readError || !currentRow) {
    return { success: false, error: "Appointment request not found or no longer accessible." };
  }

  const current = currentRow as unknown as AppointmentActionRow;
  const currentStatus = parseAppointmentStatus(current.status);
  if (!currentStatus || !canTransitionAppointment(currentStatus, parsed.data.status)) {
    return {
      success: false,
      error: `This request cannot move from ${current.status} to ${parsed.data.status}. Refresh and try again.`,
    };
  }

  let updateQuery = actor.supabase
    .from("appointment_requests")
    .update({
      status: parsed.data.status,
      seller_notes: parsed.data.sellerNotes?.trim() || null,
    })
    .eq("id", current.id)
    .eq("seller_id", actor.sellerId)
    .eq("status", currentStatus);

  if (actor.dealerId) {
    updateQuery = updateQuery.eq("dealer_id", actor.dealerId);
  }

  const { data: updatedRow, error: updateError } = await updateQuery
    .select(
      `
        id,
        listing_id,
        buyer_id,
        seller_id,
        dealer_id,
        contact_email,
        start_at,
        timezone,
        status,
        seller_notes,
        seller_responded_at,
        status_changed_at,
        updated_at,
        listing:listings!listing_id(id, year, make, model)
      `
    )
    .maybeSingle();

  if (updateError || !updatedRow) {
    return {
      success: false,
      error: updateError?.message || "The request changed before it could be updated. Refresh and try again.",
    };
  }

  const updated = updatedRow as unknown as AppointmentActionRow;
  try {
    await notifyAppointmentStatusChange(updated, actor.actorId, parsed.data.status);
  } catch (notificationError) {
    console.error("Appointment status notification failed", {
      appointmentId: updated.id,
      error: notificationError instanceof Error ? notificationError.message : "Unknown error",
    });
  }

  revalidatePath("/dashboard/customer-requests");
  revalidatePath(`/vehicle/${updated.listing_id}`);

  return {
    success: true,
    appointment: {
      id: updated.id,
      status: parsed.data.status,
      sellerNotes: updated.seller_notes,
      sellerRespondedAt: updated.seller_responded_at,
      statusChangedAt: updated.status_changed_at,
      updatedAt: updated.updated_at,
    },
  };
}
