import { createAdminClient } from "@/lib/supabase/admin";
import type { NotificationChannel, NotificationEventType } from "@/lib/types/notifications";

type DeliveryDraft = {
  recipientId: string;
  channel?: NotificationChannel;
  title: string;
  body: string;
  href?: string | null;
  metadata?: Record<string, unknown>;
};

type EmitNotificationEventInput = {
  eventType: NotificationEventType;
  actorId: string | null;
  listingId?: string | null;
  threadId?: string | null;
  messageId?: string | null;
  ticketId?: string | null;
  payload?: Record<string, unknown>;
  deliveries: DeliveryDraft[];
};

type StaffRecipient = {
  id: string;
  role: "admin" | "support";
};

export function buildListingTitle(listing: {
  year?: number | null;
  make?: string | null;
  model?: string | null;
}) {
  return [listing.year, listing.make, listing.model].filter(Boolean).join(" ") || "Vehicle";
}

export function getMessagingHref(role: string, threadId: string) {
  return role === "buyer" ? `/messages?thread=${threadId}` : `/dashboard/messages?thread=${threadId}`;
}

export function getTicketHref(role: string, ticketId: string) {
  return role === "admin" ? `/admin/car-inquiries?ticket=${ticketId}` : `/support/tickets?ticket=${ticketId}`;
}

export async function getStaffRecipients(excludeIds: string[] = []): Promise<StaffRecipient[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role")
    .in("role", ["admin", "support"]);

  if (error || !data) {
    return [];
  }

  return data
    .filter(
      (profile): profile is StaffRecipient =>
        Boolean(profile.id) &&
        (profile.role === "admin" || profile.role === "support") &&
        !excludeIds.includes(profile.id)
    );
}

export async function emitNotificationEvent(input: EmitNotificationEventInput) {
  const supabase = createAdminClient();
  const deliveries = Array.from(
    new Map(
      input.deliveries
        .filter((delivery) => delivery.recipientId)
        .map((delivery) => [`${delivery.recipientId}:${delivery.channel || "in_app"}`, delivery])
    ).values()
  );

  if (deliveries.length === 0) {
    return null;
  }

  const { data: event, error: eventError } = await supabase
    .from("notification_events")
    .insert({
      event_type: input.eventType,
      actor_id: input.actorId,
      listing_id: input.listingId || null,
      thread_id: input.threadId || null,
      message_id: input.messageId || null,
      ticket_id: input.ticketId || null,
      payload: input.payload || {},
    })
    .select("id")
    .single<{ id: string }>();

  if (eventError || !event) {
    throw new Error(eventError?.message || "Unable to create notification event.");
  }

  const { error: deliveryError } = await supabase.from("notification_deliveries").insert(
    deliveries.map((delivery) => ({
      event_id: event.id,
      recipient_id: delivery.recipientId,
      channel: delivery.channel || "in_app",
      status: delivery.channel && delivery.channel !== "in_app" ? "queued" : "sent",
      title: delivery.title,
      body: delivery.body,
      href: delivery.href || null,
      metadata: delivery.metadata || {},
      delivered_at: delivery.channel && delivery.channel !== "in_app" ? null : new Date().toISOString(),
    }))
  );

  if (deliveryError) {
    throw new Error(deliveryError.message);
  }

  return event.id;
}
