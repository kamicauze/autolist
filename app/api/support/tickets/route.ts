import { NextRequest, NextResponse } from "next/server";
import { buildListingTitle, emitNotificationEvent, getStaffRecipients, getTicketHref } from "@/lib/server/notifications";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as {
    threadId?: string;
    subject?: string;
    category?: string;
    priority?: "low" | "medium" | "high" | "urgent";
    customerSummary?: string;
    internalNote?: string;
  };

  if (!payload.threadId || !payload.subject?.trim()) {
    return NextResponse.json({ error: "threadId and subject are required." }, { status: 400 });
  }
  const ticketSubject = payload.subject.trim();

  const { data: thread, error: threadError } = await adminSupabase
    .from("conversation_threads")
    .select("id, listing_id, listing:listings(id, make, model, year)")
    .eq("id", payload.threadId)
    .single();

  if (threadError || !thread) {
    return NextResponse.json({ error: "Conversation thread not found." }, { status: 404 });
  }

  const { data: existingOpen } = await adminSupabase
    .from("support_tickets")
    .select("id, status")
    .eq("thread_id", payload.threadId)
    .in("status", ["open", "triaged", "waiting_on_seller", "waiting_on_buyer"])
    .limit(1)
    .maybeSingle();

  if (existingOpen) {
    return NextResponse.json({ error: "An open ticket already exists for this thread.", ticketId: existingOpen.id }, { status: 409 });
  }

  const { data: ticket, error: ticketError } = await adminSupabase
    .from("support_tickets")
    .insert({
      thread_id: payload.threadId,
      listing_id: thread.listing_id,
      created_by: user.id,
      subject: ticketSubject,
      category: payload.category || "buyer_seller_chat",
      priority: payload.priority || "medium",
      customer_summary: payload.customerSummary?.trim() || null,
      internal_note: payload.internalNote?.trim() || null,
      status: "open",
    })
    .select("id, status")
    .single();

  if (ticketError || !ticket) {
    return NextResponse.json({ error: ticketError?.message || "Unable to create ticket." }, { status: 400 });
  }

  await adminSupabase.from("conversation_threads").update({ status: "escalated" }).eq("id", payload.threadId);
  await adminSupabase.from("ticket_events").insert({
    ticket_id: ticket.id,
    actor_id: user.id,
    event_type: "created",
    note: payload.internalNote?.trim() || "Ticket created from conversation thread.",
  });

  const listing = Array.isArray(thread.listing) ? thread.listing[0] : null;
  const listingTitle = buildListingTitle(listing || {});
  const staffRecipients = await getStaffRecipients([user.id]);

  try {
    await emitNotificationEvent({
      eventType: "ticket_created",
      actorId: user.id,
      listingId: thread.listing_id,
      threadId: payload.threadId,
      ticketId: ticket.id,
      payload: {
        listingTitle,
        subject: ticketSubject,
        priority: payload.priority || "medium",
      },
      deliveries: staffRecipients.map((recipient) => ({
        recipientId: recipient.id,
        title: `New support ticket: ${listingTitle}`,
        body: payload.customerSummary?.trim() || ticketSubject,
        href: getTicketHref(recipient.role, ticket.id),
        metadata: {
          ticketId: ticket.id,
          threadId: payload.threadId,
          listingId: thread.listing_id,
        },
      })),
    });
  } catch (notificationError) {
    console.error("Failed to emit ticket-created notification", notificationError);
  }

  return NextResponse.json(ticket);
}
