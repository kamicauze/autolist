import { NextRequest, NextResponse } from "next/server";
import { buildListingTitle, emitNotificationEvent, getMessagingHref } from "@/lib/server/notifications";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

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

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = (await request.json()) as { message?: string };
    const message = payload.message?.trim();

    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const { listingId } = await params;

    const { data: listing, error: listingError } = await adminSupabase
      .from("listings")
      .select("id, seller_id, dealer_id, make, model, year, status")
      .eq("id", listingId)
      .single<{
        id: string;
        seller_id: string;
        dealer_id: string | null;
        make: string;
        model: string;
        year: number | null;
        status: string;
      }>();

    if (listingError || !listing) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }

    if (listing.status !== "active") {
      return NextResponse.json(
        { error: "Only active listings can receive enquiries." },
        { status: 400 }
      );
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
    const listingTitle = buildListingTitle({
      year: listing.year,
      make: listing.make,
      model: listing.model,
    });

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

    try {
      await emitNotificationEvent({
        eventType: "new_enquiry",
        actorId: user.id,
        listingId: listing.id,
        threadId: thread.id,
        messageId: insertedMessage.id,
        payload: {
          kind: "buyer_enquiry",
          listingTitle,
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
            },
          },
        ],
      });
    } catch (notificationError) {
      console.error("Failed to emit enquiry notification", notificationError);
    }

    return NextResponse.json({
      success: true,
      threadId: thread.id,
      message: "Enquiry submitted successfully.",
    });
  } catch (error) {
    console.error("Failed to submit listing enquiry", error);
    return NextResponse.json({ error: "Unable to send enquiry." }, { status: 500 });
  }
}
