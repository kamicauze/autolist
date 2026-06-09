import { NextRequest, NextResponse } from "next/server";
import {
  buildListingTitle,
  emitNotificationEvent,
  getMessagingHref,
  getStaffRecipients,
  getTicketHref,
} from "@/lib/server/notifications";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

type EnquiryListing = {
  id: string;
  seller_id: string;
  dealer_id: string | null;
  make: string;
  model: string;
  year: number | null;
  status: string;
};

async function resolveFallbackCreatorId(adminSupabase: SupabaseClient) {
  const { data, error } = await adminSupabase
    .from("profiles")
    .select("id")
    .in("role", ["support", "admin", "super_admin"])
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (error || !data?.id) return null;
  return data.id;
}

async function createAdminInquiryTicket(input: {
  adminSupabase: SupabaseClient;
  listing: EnquiryListing;
  listingTitle: string;
  message: string;
  createdBy: string;
  threadId?: string | null;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  internalNote?: string;
}) {
  const openStatuses = ["open", "triaged", "waiting_on_seller", "waiting_on_buyer"];

  if (input.threadId) {
    const { data: existingTicket } = await input.adminSupabase
      .from("support_tickets")
      .select("id")
      .eq("thread_id", input.threadId)
      .in("status", openStatuses)
      .limit(1)
      .maybeSingle<{ id: string }>();

    if (existingTicket?.id) {
      return existingTicket.id;
    }
  }

  const customerSummary = [
    `Listing: ${input.listingTitle}`,
    input.contactName ? `Name: ${input.contactName}` : null,
    input.contactEmail ? `Email: ${input.contactEmail}` : null,
    input.contactPhone ? `Phone: ${input.contactPhone}` : null,
    "",
    input.message,
  ]
    .filter((line) => line !== null)
    .join("\n");

  const { data: ticket, error: ticketError } = await input.adminSupabase
    .from("support_tickets")
    .insert({
      thread_id: input.threadId || null,
      listing_id: input.listing.id,
      created_by: input.createdBy,
      subject: `Listing enquiry: ${input.listingTitle}`,
      category: input.threadId ? "listing_enquiry" : "public_listing_enquiry",
      priority: "medium",
      status: "open",
      customer_summary: customerSummary,
      internal_note: input.internalNote || null,
    })
    .select("id")
    .single<{ id: string }>();

  if (ticketError || !ticket) {
    throw new Error(ticketError?.message || "Unable to create admin inquiry ticket.");
  }

  await input.adminSupabase.from("ticket_events").insert({
    ticket_id: ticket.id,
    actor_id: input.createdBy,
    event_type: "created",
    note: input.internalNote || "Listing enquiry submitted.",
    metadata: {
      listingId: input.listing.id,
      threadId: input.threadId || null,
      contactName: input.contactName || null,
      contactEmail: input.contactEmail || null,
      contactPhone: input.contactPhone || null,
    },
  });

  return ticket.id;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const payload = (await request.json()) as {
      message?: string;
      contactName?: string;
      contactEmail?: string;
      contactPhone?: string;
    };
    const message = payload.message?.trim();
    const contactName = payload.contactName?.trim() || "";
    const contactEmail = payload.contactEmail?.trim() || "";
    const contactPhone = payload.contactPhone?.trim() || "";

    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const { listingId } = await params;

    const { data: listing, error: listingError } = await adminSupabase
      .from("listings")
      .select("id, seller_id, dealer_id, make, model, year, status")
      .eq("id", listingId)
      .single<EnquiryListing>();

    if (listingError || !listing) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }

    if (listing.status !== "active") {
      return NextResponse.json(
        { error: "Only active listings can receive enquiries." },
        { status: 400 }
      );
    }

    const listingTitle = buildListingTitle({
      year: listing.year,
      make: listing.make,
      model: listing.model,
    });

    if (!user) {
      if (!contactName || (!contactEmail && !contactPhone)) {
        return NextResponse.json(
          { error: "Enter your name and either an email address or phone number." },
          { status: 400 }
        );
      }

      const fallbackCreatorId = await resolveFallbackCreatorId(adminSupabase);
      if (!fallbackCreatorId) {
        return NextResponse.json(
          { error: "Enquiries are not ready yet. Please try again shortly." },
          { status: 503 }
        );
      }

      const ticketId = await createAdminInquiryTicket({
        adminSupabase,
        listing,
        listingTitle,
        message,
        createdBy: fallbackCreatorId,
        contactName,
        contactEmail,
        contactPhone,
        internalNote: "Submitted from the public listing enquiry form before login.",
      });

      const staffRecipients = await getStaffRecipients([fallbackCreatorId]);
      await emitNotificationEvent({
        eventType: "ticket_created",
        actorId: null,
        listingId: listing.id,
        ticketId,
        payload: {
          kind: "public_listing_enquiry",
          listingTitle,
          contactName,
          contactEmail,
          contactPhone,
        },
        deliveries: [
          {
            recipientId: listing.seller_id,
            title: `New public enquiry on ${listingTitle}`,
            body: `${contactName}: ${message.slice(0, 140)}`,
            href: `/dashboard/listings/${listing.id}/edit`,
            metadata: {
              ticketId,
              listingId: listing.id,
              contactName,
              contactEmail,
              contactPhone,
            },
          },
          ...staffRecipients.map((recipient) => ({
            recipientId: recipient.id,
            title: `New public listing enquiry: ${listingTitle}`,
            body: `${contactName}: ${message.slice(0, 140)}`,
            href: getTicketHref(recipient.role, ticketId),
            metadata: {
              ticketId,
              listingId: listing.id,
              contactName,
              contactEmail,
              contactPhone,
            },
          })),
        ],
      });

      return NextResponse.json({
        success: true,
        ticketId,
        message:
          "Enquiry sent. It is saved in Admin > Import Inquiries and delivered to the seller.",
      });
    }

    if (listing.seller_id === user.id) {
      return NextResponse.json({ error: "You cannot enquire about your own listing." }, { status: 400 });
    }

    const { error: enquiryError } = await adminSupabase.from("enquiries").insert({
      listing_id: listing.id,
      user_id: user.id,
      message,
      status: "pending",
    });

    if (enquiryError) {
      return NextResponse.json({ error: enquiryError.message }, { status: 400 });
    }

    const subject = [listing.year, listing.make, listing.model].filter(Boolean).join(" ");
    const { data: thread, error: threadError } = await adminSupabase
      .from("conversation_threads")
      .upsert(
        {
          listing_id: listing.id,
          buyer_id: user.id,
          seller_id: listing.seller_id,
          dealer_id: listing.dealer_id,
          created_by: user.id,
          source: "listing_enquiry",
          status: "waiting_on_seller",
          subject,
          last_message_preview: message.slice(0, 180),
          last_message_at: new Date().toISOString(),
          last_message_sender_id: user.id,
        },
        {
          onConflict: "listing_id,buyer_id,seller_id",
          ignoreDuplicates: false,
        }
      )
      .select("id")
      .single<{ id: string }>();

    if (threadError || !thread) {
      return NextResponse.json(
        { error: threadError?.message || "Unable to open conversation thread." },
        { status: 400 }
      );
    }

    const participants = [
      { thread_id: thread.id, profile_id: user.id, participant_role: "buyer" },
      { thread_id: thread.id, profile_id: listing.seller_id, participant_role: "seller" },
    ];

    const { error: participantError } = await adminSupabase
      .from("conversation_participants")
      .upsert(participants, { onConflict: "thread_id,profile_id", ignoreDuplicates: false });

    if (participantError) {
      return NextResponse.json({ error: participantError.message }, { status: 400 });
    }

    const { data: insertedMessage, error: messageError } = await adminSupabase
      .from("conversation_messages")
      .insert({
        thread_id: thread.id,
        sender_id: user.id,
        body: message,
        visibility: "participants",
        message_type: "text",
      })
      .select("id")
      .single<{ id: string }>();

    if (messageError || !insertedMessage) {
      return NextResponse.json(
        { error: messageError?.message || "Unable to save the enquiry message." },
        { status: 400 }
      );
    }

    let ticketId: string | null = null;
    try {
      ticketId = await createAdminInquiryTicket({
        adminSupabase,
        listing,
        listingTitle,
        message,
        createdBy: user.id,
        threadId: thread.id,
        internalNote: "Listing enquiry submitted from the public vehicle page.",
      });
    } catch (ticketError) {
      console.error("Failed to create admin inquiry ticket", ticketError);
    }

    try {
      const staffRecipients = ticketId ? await getStaffRecipients([user.id]) : [];
      await emitNotificationEvent({
        eventType: "new_enquiry",
        actorId: user.id,
        listingId: listing.id,
        threadId: thread.id,
        messageId: insertedMessage.id,
        payload: {
          kind: "buyer_enquiry",
          listingTitle,
          ticketId,
        },
        deliveries: [
          {
            recipientId: listing.seller_id,
            title: `New enquiry on ${listingTitle}`,
            body: message.slice(0, 160),
            href: getMessagingHref("seller", thread.id),
            metadata: {
              threadId: thread.id,
              listingId: listing.id,
              listingTitle,
              ticketId,
            },
          },
          ...staffRecipients.map((recipient) => ({
            recipientId: recipient.id,
            title: `New listing enquiry: ${listingTitle}`,
            body: message.slice(0, 160),
            href: ticketId ? getTicketHref(recipient.role, ticketId) : "/admin/car-inquiries",
            metadata: {
              threadId: thread.id,
              listingId: listing.id,
              listingTitle,
              ticketId,
            },
          })),
        ],
      });
    } catch (notificationError) {
      console.error("Failed to emit enquiry notification", notificationError);
    }

    return NextResponse.json({
      success: true,
      threadId: thread.id,
      message:
        "Enquiry sent. It is saved in Messages, logged in Admin > Import Inquiries, and delivered to the seller.",
    });
  } catch (error) {
    console.error("Failed to submit listing enquiry", error);
    return NextResponse.json({ error: "Unable to send enquiry." }, { status: 500 });
  }
}
