import { NextRequest, NextResponse } from "next/server";
import {
  buildSellerAppointmentNotification,
  validateAppointmentListing,
  validateAppointmentRequest,
} from "@/lib/appointments/appointment-request";
import { buildListingTitle, emitNotificationEvent } from "@/lib/server/notifications";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type AppointmentListing = {
  id: string;
  seller_id: string;
  dealer_id: string | null;
  make: string;
  model: string;
  year: number | null;
  status: string;
};

type BuyerContactProfile = {
  full_name: string | null;
  email: string | null;
  phone: string | null;
};

function getInputString(payload: Record<string, unknown>, key: string) {
  return typeof payload[key] === "string" ? payload[key] : "";
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    let payload: Record<string, unknown>;
    try {
      const value = (await request.json()) as unknown;
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        return NextResponse.json({ error: "Invalid appointment request." }, { status: 400 });
      }
      payload = value as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Invalid appointment request." }, { status: 400 });
    }

    const supabase = await createClient();
    const adminSupabase = createAdminClient();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;
    const { listingId } = await params;

    const [{ data: listing, error: listingError }, profileResult] = await Promise.all([
      adminSupabase
        .from("listings")
        .select("id, seller_id, dealer_id, make, model, year, status")
        .eq("id", listingId)
        .single<AppointmentListing>(),
      user
        ? adminSupabase
            .from("profiles")
            .select("full_name, email, phone")
            .eq("id", user.id)
            .maybeSingle<BuyerContactProfile>()
        : Promise.resolve({ data: null, error: null }),
    ]);

    if (listingError || !listing) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }

    const listingValidationError = validateAppointmentListing({
      status: listing.status,
      sellerId: listing.seller_id,
      viewerId: user?.id,
    });
    if (listingValidationError) {
      return NextResponse.json({ error: listingValidationError }, { status: 400 });
    }

    const profile = profileResult.data;
    const validation = validateAppointmentRequest({
      date: payload.date,
      timeSlot: payload.timeSlot,
      contactName: getInputString(payload, "contactName") || profile?.full_name || "",
      contactEmail:
        getInputString(payload, "contactEmail") || profile?.email || user?.email || "",
      contactPhone: getInputString(payload, "contactPhone") || profile?.phone || "",
      buyerMessage: payload.buyerMessage,
    });

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const appointment = validation.data;
    const { data: insertedAppointment, error: appointmentError } = await adminSupabase
      .from("appointment_requests")
      .insert({
        listing_id: listing.id,
        buyer_id: user?.id || null,
        seller_id: listing.seller_id,
        dealer_id: listing.dealer_id,
        contact_name: appointment.contactName,
        contact_email: appointment.contactEmail || null,
        contact_phone: appointment.contactPhone || null,
        start_at: appointment.startAt,
        end_at: appointment.endAt,
        timezone: appointment.timezone,
        message: appointment.buyerMessage,
        status: "pending",
      })
      .select("id")
      .single<{ id: string }>();

    if (appointmentError || !insertedAppointment) {
      console.error("Failed to save appointment request", appointmentError);
      return NextResponse.json(
        { error: "Unable to save the appointment request." },
        { status: 500 }
      );
    }

    const listingTitle = buildListingTitle(listing);
    const notification = buildSellerAppointmentNotification({
      listingTitle,
      dateLabel: appointment.dateLabel,
      timeSlot: appointment.timeSlot,
      contactName: appointment.contactName,
      contactEmail: appointment.contactEmail,
      contactPhone: appointment.contactPhone,
      buyerMessage: appointment.buyerMessage,
    });
    const href = `/dashboard/customer-requests?appointment=${insertedAppointment.id}`;

    try {
      await emitNotificationEvent({
        eventType: "appointment_requested",
        actorId: user?.id || null,
        listingId: listing.id,
        payload: {
          kind: "appointment_request",
          appointmentId: insertedAppointment.id,
          listingTitle,
        },
        deliveries: [
          {
            recipientId: listing.seller_id,
            title: notification.title,
            body: notification.inAppBody,
            href,
            metadata: {
              appointmentId: insertedAppointment.id,
              listingId: listing.id,
            },
          },
          {
            recipientId: listing.seller_id,
            channel: "email",
            title: notification.title,
            body: notification.emailBody,
            href,
            metadata: {
              appointmentId: insertedAppointment.id,
              listingId: listing.id,
            },
          },
        ],
      });
    } catch (notificationError) {
      console.error("Failed to queue appointment notification", notificationError);
    }

    return NextResponse.json(
      {
        success: true,
        appointmentId: insertedAppointment.id,
        message: "Request saved. The seller will review it and respond to you.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to submit appointment request", error);
    return NextResponse.json(
      { error: "Unable to save the appointment request." },
      { status: 500 }
    );
  }
}
