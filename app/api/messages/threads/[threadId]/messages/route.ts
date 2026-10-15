import { NextRequest, NextResponse } from "next/server";
import { sendProviderEmail } from "@/lib/server/delivery-providers";
import { getSiteBaseUrl } from "@/lib/server/notification-delivery";
import { buildListingTitle, emitNotificationEvent, getMessagingHref } from "@/lib/server/notifications";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { threadId } = await params;
  const payload = (await request.json()) as { body?: string };
  const body = payload.body?.trim();

  if (!body) {
    return NextResponse.json({ error: "Message body is required." }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: string }>();

  const { data: thread, error: threadError } = await supabase
    .from("conversation_threads")
    .select(
      `
        id,
        buyer_id,
        seller_id,
        guest_name,
        guest_email,
        listing:listings(id, make, model, year)
      `
    )
    .eq("id", threadId)
    .maybeSingle<{
      id: string;
      buyer_id: string | null;
      seller_id: string;
      guest_name: string | null;
      guest_email: string | null;
      listing: { id: string; make: string | null; model: string | null; year: number | null } | Array<{ id: string; make: string | null; model: string | null; year: number | null }> | null;
    }>();

  if (threadError || !thread) {
    return NextResponse.json({ error: "Conversation thread not found." }, { status: 404 });
  }

  const visibility =
    ["admin", "super_admin", "support"].includes(profile?.role || "") &&
    user.id !== thread.buyer_id &&
    user.id !== thread.seller_id
      ? "staff_only"
      : "participants";

  const { data, error } = await supabase
    .from("conversation_messages")
    .insert({
      thread_id: threadId,
      sender_id: user.id,
      body,
      visibility,
      message_type: "text",
    })
    .select(
      `
        id,
        thread_id,
        sender_id,
        body,
        visibility,
        message_type,
        created_at,
        sender:profiles!sender_id(id, full_name, email)
      `
    )
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message || "Unable to send message." }, { status: 400 });
  }

  const sender = Array.isArray(data.sender) ? data.sender[0] : data.sender;
  const listing = Array.isArray(thread.listing) ? thread.listing[0] : thread.listing;
  const listingTitle = buildListingTitle(listing || {});

  let deliveryWarning: string | null = null;

  // Guests have no account, so a reply on a guest thread goes to their email.
  if (!thread.buyer_id) {
    if (visibility === "participants" && thread.guest_email) {
      const baseUrl = getSiteBaseUrl();
      const listingUrl = listing && baseUrl ? new URL(`/vehicle/${listing.id}`, baseUrl).toString() : null;
      try {
        const result = await sendProviderEmail({
          to: thread.guest_email,
          subject: `Reply about ${listingTitle}`,
          text: [
            `Hi ${thread.guest_name || "there"},`,
            `${sender?.full_name || "The seller"} replied to your enquiry about ${listingTitle}:`,
            data.body,
            listingUrl ? `To reply, send another enquiry from the listing: ${listingUrl}` : null,
          ]
            .filter(Boolean)
            .join("\n\n"),
        });
        if (!result.success) {
          deliveryWarning = "Reply saved, but the email could not be sent. Contact the enquirer directly.";
          console.error("Guest reply email delivery failed", {
            threadId: thread.id,
            skipped: result.skipped,
            error: result.error,
          });
        }
      } catch (emailError) {
        deliveryWarning = "Reply saved, but the email could not be sent. Contact the enquirer directly.";
        console.error("Guest reply email delivery failed", { threadId: thread.id, error: emailError });
      }
    }
  } else if (visibility === "participants") {
    const recipientRole = user.id === thread.buyer_id ? "seller" : "buyer";
    const recipientId = user.id === thread.buyer_id ? thread.seller_id : thread.buyer_id;
    const notificationTitle =
      recipientRole === "buyer"
        ? `Seller replied on ${listingTitle}`
        : `New buyer message on ${listingTitle}`;

    try {
      await emitNotificationEvent({
        eventType: "new_message",
        actorId: user.id,
        listingId: listing?.id || null,
        threadId: thread.id,
        messageId: data.id,
        payload: {
          kind: "conversation_message",
          listingTitle,
        },
        deliveries: [
          {
            recipientId,
            title: notificationTitle,
            body: data.body.slice(0, 160),
            href: getMessagingHref(recipientRole, thread.id),
            metadata: {
              threadId: thread.id,
              listingId: listing?.id || null,
              listingTitle,
            },
          },
        ],
      });
    } catch (notificationError) {
      console.error("Failed to emit message notification", notificationError);
    }
  }

  return NextResponse.json({
    id: data.id,
    threadId: data.thread_id,
    senderId: data.sender_id,
    senderName: sender?.full_name || sender?.email || "Unknown",
    body: data.body,
    visibility: data.visibility,
    messageType: data.message_type,
    createdAt: data.created_at,
    deliveryWarning,
  });
}
