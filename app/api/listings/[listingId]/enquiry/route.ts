import { NextRequest, NextResponse } from "next/server";
import {
  buildListingTitle,
  emitNotificationEvent,
  getMessagingHref,
} from "@/lib/server/notifications";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type EnquiryListing = {
  id: string;
  seller_id: string;
  dealer_id: string | null;
  make: string;
  model: string;
  year: number | null;
  status: string;
  sale_channel: string;
};

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
      .select("id, seller_id, dealer_id, make, model, year, status, sale_channel")
      .eq("id", listingId)
      .single<EnquiryListing>();

    if (listingError || !listing || !["standard", "dealer_public"].includes(listing.sale_channel)) {
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
    const subject = [listing.year, listing.make, listing.model].filter(Boolean).join(" ");

    if (!user) {
      if (!contactName || (!contactEmail && !contactPhone)) {
        return NextResponse.json(
          { error: "Enter your name and either an email address or phone number." },
          { status: 400 }
        );
      }

      const guestEmail = contactEmail.toLowerCase() || null;
      const guestPhone = contactPhone.replace(/\s+/g, "") || null;

      // Email threads can only be continued by that email. Phone-only enquiries
      // may reuse a phone-only thread, but cannot replace an email recipient.
      const { data: guestThreads, error: guestThreadsError } = await adminSupabase
        .from("conversation_threads")
        .select("id, guest_email, guest_phone")
        .eq("listing_id", listing.id)
        .eq("seller_id", listing.seller_id)
        .is("buyer_id", null)
        .returns<Array<{ id: string; guest_email: string | null; guest_phone: string | null }>>();

      if (guestThreadsError) {
        return NextResponse.json({ error: guestThreadsError.message }, { status: 400 });
      }

      const existingGuestThread = (guestThreads || []).find(
        (thread) =>
          guestEmail
            ? thread.guest_email === guestEmail
            : !thread.guest_email && guestPhone && thread.guest_phone === guestPhone
      );

      let guestThreadId = existingGuestThread?.id || null;

      if (!existingGuestThread) {
        const { data: guestThread, error: guestThreadError } = await adminSupabase
          .from("conversation_threads")
          .insert({
            listing_id: listing.id,
            buyer_id: null,
            seller_id: listing.seller_id,
            dealer_id: listing.dealer_id,
            created_by: null,
            source: "public_listing_enquiry",
            status: "waiting_on_seller",
            subject,
            guest_name: contactName,
            guest_email: guestEmail,
            guest_phone: guestPhone,
            last_message_preview: message.slice(0, 180),
            last_message_at: new Date().toISOString(),
            last_message_sender_id: null,
          })
          .select("id")
          .single<{ id: string }>();

        if (guestThreadError || !guestThread) {
          return NextResponse.json(
            { error: guestThreadError?.message || "Unable to open conversation thread." },
            { status: 400 }
          );
        }

        guestThreadId = guestThread.id;
      }

      if (!guestThreadId) {
        return NextResponse.json({ error: "Unable to open conversation thread." }, { status: 400 });
      }

      const { error: guestParticipantError } = await adminSupabase
        .from("conversation_participants")
        .upsert(
          { thread_id: guestThreadId, profile_id: listing.seller_id, participant_role: "seller" },
          { onConflict: "thread_id,profile_id", ignoreDuplicates: false }
        );

      if (guestParticipantError) {
        return NextResponse.json({ error: guestParticipantError.message }, { status: 400 });
      }

      const { data: guestMessage, error: guestMessageError } = await adminSupabase
        .from("conversation_messages")
        .insert({
          thread_id: guestThreadId,
          sender_id: null,
          body: message,
          visibility: "participants",
          message_type: "text",
        })
        .select("id")
        .single<{ id: string }>();

      if (guestMessageError || !guestMessage) {
        return NextResponse.json(
          { error: guestMessageError?.message || "Unable to save the enquiry message." },
          { status: 400 }
        );
      }

      try {
        await emitNotificationEvent({
          eventType: "new_enquiry",
          actorId: null,
          listingId: listing.id,
          threadId: guestThreadId,
          messageId: guestMessage.id,
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
              href: getMessagingHref("seller", guestThreadId),
              metadata: {
                threadId: guestThreadId,
                listingId: listing.id,
                contactName,
                contactEmail,
                contactPhone,
              },
            },
          ],
        });
      } catch (notificationError) {
        console.error("Failed to emit guest enquiry notification", notificationError);
      }

      return NextResponse.json({
        success: true,
        message: guestEmail
          ? "Enquiry sent. The seller's reply will be emailed to you."
          : "Enquiry sent. The seller will contact you on the number you provided.",
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
      message: "Enquiry sent. It is saved in Messages and delivered to the seller.",
    });
  } catch (error) {
    console.error("Failed to submit listing enquiry", error);
    return NextResponse.json({ error: "Unable to send enquiry." }, { status: 500 });
  }
}
