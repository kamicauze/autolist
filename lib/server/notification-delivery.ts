import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendProviderEmail, sendProviderWhatsApp } from "@/lib/server/delivery-providers";
import type { NotificationChannel } from "@/lib/types/notifications";

type QueuedDeliveryRow = {
  id: string;
  channel: NotificationChannel;
  title: string;
  body: string;
  href: string | null;
  metadata: Record<string, unknown> | null;
  attempt_count: number | null;
  recipient:
    | {
        email: string | null;
        whatsapp: string | null;
        phone: string | null;
      }
    | Array<{
        email: string | null;
        whatsapp: string | null;
        phone: string | null;
      }>
    | null;
};

function firstRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] || null : value || null;
}

function getSiteBaseUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    "";
  if (!raw) return "";
  return raw.startsWith("http") ? raw : `https://${raw}`;
}

function buildBody(row: QueuedDeliveryRow) {
  const baseUrl = getSiteBaseUrl();
  const href = row.href && baseUrl ? new URL(row.href, baseUrl).toString() : row.href;

  return href ? `${row.body}\n\nOpen: ${href}` : row.body;
}

export async function processQueuedNotificationDeliveries(limit = 25) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("notification_deliveries")
    .select(
      `
        id,
        channel,
        title,
        body,
        href,
        metadata,
        attempt_count,
        recipient:profiles!recipient_id(email, whatsapp, phone)
      `
    )
    .eq("status", "queued")
    .in("channel", ["email", "whatsapp"])
    .order("created_at", { ascending: true })
    .limit(limit)
    .returns<QueuedDeliveryRow[]>();

  if (error) {
    return { processed: 0, sent: 0, failed: 0, skipped: 0, error: error.message };
  }

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const row of data || []) {
    const recipient = firstRelation(row.recipient);
    const attempts = (row.attempt_count || 0) + 1;
    const body = buildBody(row);
    const result =
      row.channel === "email"
        ? recipient?.email
          ? await sendProviderEmail({
              to: recipient.email,
              subject: row.title,
              text: body,
            })
          : { success: false, skipped: true, error: "Recipient email is missing." }
        : recipient?.whatsapp || recipient?.phone
          ? await sendProviderWhatsApp({
              to: recipient.whatsapp || recipient.phone || "",
              body: `${row.title}\n\n${body}`,
            })
          : { success: false, skipped: true, error: "Recipient WhatsApp number is missing." };

    const nextStatus = result.success ? "sent" : result.skipped ? "skipped" : "failed";
    if (result.success) sent += 1;
    else if (result.skipped) skipped += 1;
    else failed += 1;

    await supabase
      .from("notification_deliveries")
      .update({
        status: nextStatus,
        attempt_count: attempts,
        external_message_id: result.externalId || null,
        last_error: result.error || null,
        delivered_at: result.success ? new Date().toISOString() : null,
      })
      .eq("id", row.id);
  }

  return {
    processed: data?.length || 0,
    sent,
    failed,
    skipped,
  };
}
