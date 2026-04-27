import { createClient } from "@/lib/supabase/server";
import type { MessagingViewer, ProfileRole } from "@/lib/types/messaging";
import type { NotificationCenterData, NotificationListItem } from "@/lib/types/notifications";

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: ProfileRole;
};

type NotificationDeliveryRow = {
  id: string;
  event_id: string;
  channel: "in_app" | "email" | "whatsapp";
  status: "queued" | "sent" | "read" | "failed" | "skipped";
  title: string;
  body: string;
  href: string | null;
  delivered_at: string | null;
  read_at: string | null;
  created_at: string;
  event: { event_type: NotificationListItem["eventType"] }[] | null;
};

async function getViewer(supabase: Awaited<ReturnType<typeof createClient>>): Promise<MessagingViewer | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  if (error || !profile) {
    return null;
  }

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
  };
}

function firstRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] || null : value || null;
}

export async function getNotificationCenterData(limit = 40): Promise<NotificationCenterData | null> {
  const supabase = await createClient();
  const viewer = await getViewer(supabase);

  if (!viewer) {
    return null;
  }

  const [{ data: deliveries, error: deliveriesError }, { count: unreadCount }] = await Promise.all([
    supabase
      .from("notification_deliveries")
      .select(
        `
          id,
          event_id,
          channel,
          status,
          title,
          body,
          href,
          delivered_at,
          read_at,
          created_at,
          event:notification_events(event_type)
        `
      )
      .eq("recipient_id", viewer.id)
      .eq("channel", "in_app")
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("notification_deliveries")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", viewer.id)
      .eq("channel", "in_app")
      .is("read_at", null),
  ]);

  if (deliveriesError) {
    return {
      viewer,
      unreadCount: 0,
      notifications: [],
    };
  }

  const notifications = ((deliveries || []) as unknown as NotificationDeliveryRow[]).map((delivery) => ({
    id: delivery.id,
    eventId: delivery.event_id,
    eventType: firstRelation(delivery.event)?.event_type || "new_message",
    channel: delivery.channel,
    status: delivery.status,
    title: delivery.title,
    body: delivery.body,
    href: delivery.href,
    deliveredAt: delivery.delivered_at,
    readAt: delivery.read_at,
    createdAt: delivery.created_at,
  }));

  return {
    viewer,
    unreadCount: unreadCount || 0,
    notifications,
  };
}
