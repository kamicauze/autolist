import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createOptionalAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getSalesAgentViewerContext } from "@/lib/data/sales-agent-permissions";
import { filterAdminVisibleSupportTickets } from "@/lib/data/support-ticket-filters";
import type {
  MessagingCenterData,
  MessagingViewer,
  ProfileRole,
  SupportQueueData,
  SupportTicketListItem,
  ThreadListItem,
  ThreadMessageItem,
} from "@/lib/types/messaging";

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: ProfileRole;
};

type ThreadRow = {
  id: string;
  listing_id: string;
  status: string;
  source: string;
  subject: string | null;
  last_message_at: string;
  last_message_preview: string | null;
  last_message_sender_id: string | null;
  buyer_id: string | null;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  buyer: Array<{ id: string; full_name: string | null; email: string | null; phone: string | null; whatsapp: string | null }> | null;
  seller: Array<{ id: string; full_name: string | null; email: string | null; phone: string | null; whatsapp: string | null }> | null;
  listing: Array<{ id: string; make: string; model: string; year: number | null }> | null;
  tickets: Array<{ id: string; status: string }> | null;
};

type MessageRow = {
  id: string;
  thread_id: string;
  sender_id: string | null;
  body: string;
  visibility: "participants" | "staff_only";
  message_type: "text" | "system" | "ticket_note";
  created_at: string;
  sender: Array<{ id: string; full_name: string | null; email: string | null }> | null;
};

type TicketRow = {
  id: string;
  thread_id: string | null;
  subject: string;
  category: string;
  priority: SupportTicketListItem["priority"];
  status: SupportTicketListItem["status"];
  customer_summary: string | null;
  internal_note: string | null;
  resolution_note: string | null;
  created_at: string;
  updated_at: string;
  assigned_to_profile: Array<{ id: string; full_name: string | null; email: string | null }> | null;
  created_by_profile: Array<{ id: string; full_name: string | null; email: string | null }> | null;
  listing: Array<{ id: string; make: string; model: string; year: number | null }> | null;
  thread:
    | Array<{
        id: string;
        status: string;
        last_message_preview: string | null;
        buyer: Array<{ full_name: string | null }> | null;
        seller: Array<{ full_name: string | null }> | null;
      }>
    | null;
};

type SupportQueueViewerRole = Extract<ProfileRole, "admin" | "super_admin" | "support">;

export function isSupportQueueViewerRole(
  role: ProfileRole | string | null | undefined
): role is SupportQueueViewerRole {
  return role === "admin" || role === "super_admin" || role === "support";
}

async function getViewer(
  supabase: Awaited<ReturnType<typeof createClient>>,
  profileClient: SupabaseClient = supabase
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await profileClient
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
  } satisfies MessagingViewer;
}

function threadListingTitle(listing: ThreadRow["listing"]) {
  const item = firstRelation(listing);
  if (!item) return "Vehicle";
  return [item.year, item.make, item.model].filter(Boolean).join(" ");
}

function firstRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] || null : value || null;
}

export const getMessagingCenterData = cache(async (): Promise<MessagingCenterData | null> => {
  const supabase = await createClient();
  const adminSupabase = createOptionalAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const viewer = await getViewer(supabase, adminSupabase ?? supabase);

  if (!viewer) {
    return {
      viewer: null,
      threads: [],
      messagesByThread: {},
      error:
        "Your messaging profile could not be loaded. Confirm that your account record exists in profiles and try again.",
    };
  }

  const isStaffViewer = isSupportQueueViewerRole(viewer.role);
  const threadClient = adminSupabase ?? supabase;

  let threadQuery = threadClient
    .from("conversation_threads")
    .select(
      `
        id,
        listing_id,
        status,
        source,
        subject,
        last_message_at,
        last_message_preview,
        last_message_sender_id,
        buyer_id,
        seller_id,
        guest_name,
        guest_email,
        guest_phone,
        buyer:profiles!buyer_id(id, full_name, email, phone, whatsapp),
        seller:profiles!seller_id(id, full_name, email, phone, whatsapp),
        listing:listings(id, make, model, year),
        tickets:support_tickets(id, status)
      `
    )
    .order("last_message_at", { ascending: false });

  if (viewer.role === "buyer") {
    threadQuery = threadQuery.eq("buyer_id", viewer.id);
  } else if (viewer.role === "seller" || viewer.role === "dealer") {
    threadQuery = threadQuery.eq("seller_id", viewer.id);
  } else if (viewer.role === "sales_agent") {
    // Reps only see their dealership's threads, and only with the permission.
    const repContext = await getSalesAgentViewerContext();
    if (!repContext || !repContext.permissions.includes("enquiries.respond")) {
      return { viewer, threads: [], messagesByThread: {} };
    }
    threadQuery = threadQuery.eq("seller_id", repContext.principalProfileId);
  }

  const { data: threadRows, error: threadError } = await threadQuery;

  if (threadError) {
    return {
      viewer,
      threads: [],
      messagesByThread: {},
      error:
        "Conversation threads could not be loaded right now. Check Supabase access and try again.",
    };
  }

  const threadRowList = (threadRows || []) as unknown as ThreadRow[];
  const guestNameByThread = new Map(
    threadRowList
      .filter((thread) => !thread.buyer_id)
      .map((thread) => [thread.id, thread.guest_name || "Guest"])
  );

  const threads = threadRowList.map((thread) => {
    const buyer = firstRelation(thread.buyer);
    const seller = firstRelation(thread.seller);
    const isGuest = !thread.buyer_id;
    const counterpart =
      viewer.role === "buyer"
        ? seller
        : isGuest
          ? {
              full_name: thread.guest_name,
              email: thread.guest_email,
              phone: thread.guest_phone,
              whatsapp: null,
            }
          : buyer;
    const tickets = thread.tickets || [];
    return {
      id: thread.id,
      listingId: thread.listing_id,
      listingTitle: threadListingTitle(thread.listing),
      lastMessageSenderId: isStaffViewer ? thread.last_message_sender_id : null,
      counterpartName: counterpart?.full_name || counterpart?.email || "Conversation",
      counterpartEmail: counterpart?.email || null,
      counterpartPhone: counterpart?.phone || null,
      counterpartWhatsapp: counterpart?.whatsapp || null,
      isGuest,
      status: thread.status,
      source: thread.source,
      subject: thread.subject,
      // Historical thread summaries may contain staff-only notes. Participants'
      // previews are rebuilt from visible messages after the message query succeeds.
      lastMessageAt: isStaffViewer ? thread.last_message_at : "",
      lastMessagePreview: isStaffViewer ? thread.last_message_preview : null,
      ticketCount: tickets.length,
      openTicketCount: tickets.filter((ticket) => !["resolved", "closed"].includes(ticket.status)).length,
    } satisfies ThreadListItem;
  });

  const threadIds = threads.map((thread) => thread.id);
  if (threadIds.length === 0) {
    return {
      viewer,
      threads,
      messagesByThread: {},
      error: null,
    };
  }

  const messageClient = adminSupabase ?? supabase;
  let messageQuery = messageClient
    .from("conversation_messages")
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
    .in("thread_id", threadIds)
    .order("created_at", { ascending: true });

  if (!isStaffViewer) messageQuery = messageQuery.eq("visibility", "participants");
  const { data: messageRows, error: messageError } = await messageQuery;

  if (messageError) {
    return {
      viewer,
      threads,
      messagesByThread: {},
      error:
        "Thread messages could not be loaded right now. Conversation access is configured, but message retrieval failed.",
    };
  }

  const messagesByThread: Record<string, ThreadMessageItem[]> = {};

  for (const message of (messageRows || []) as unknown as MessageRow[]) {
    const sender = firstRelation(message.sender);
    if (!messagesByThread[message.thread_id]) {
      messagesByThread[message.thread_id] = [];
    }

    messagesByThread[message.thread_id].push({
      id: message.id,
      threadId: message.thread_id,
      senderId: message.sender_id,
      senderName:
        sender?.full_name ||
        sender?.email ||
        (message.sender_id ? null : guestNameByThread.get(message.thread_id)) ||
        "Unknown",
      senderRole: message.sender_id === viewer.id ? "me" : "them",
      body: message.body,
      visibility: message.visibility,
      messageType: message.message_type,
      createdAt: message.created_at,
    });
  }

  if (!isStaffViewer) {
    for (const thread of threads) {
      const latest = messagesByThread[thread.id]?.at(-1);
      thread.lastMessagePreview = latest?.body.slice(0, 180) || null;
      thread.lastMessageAt = latest?.createdAt || "";
      thread.lastMessageSenderId = latest?.senderId || null;
    }
    threads.sort((left, right) => right.lastMessageAt.localeCompare(left.lastMessageAt));
  }

  return {
    viewer,
    threads,
    messagesByThread,
    error: null,
  };
});

export const getSupportQueueData = cache(async (scope: "all" | "imports" | "assistance" | "conversations" = "all"): Promise<SupportQueueData | null> => {
  const supabase = await createClient();
  const adminSupabase = createOptionalAdminClient();
  const viewer = await getViewer(supabase, adminSupabase ?? supabase);

  if (!viewer || !isSupportQueueViewerRole(viewer.role)) {
    return null;
  }

  const ticketClient = adminSupabase ?? supabase;

  let ticketQuery = ticketClient
    .from("support_tickets")
    .select(
      `
        id,
        thread_id,
        subject,
        category,
        priority,
        status,
        customer_summary,
        internal_note,
        resolution_note,
        created_at,
        updated_at,
        assigned_to_profile:profiles!assigned_to(id, full_name, email),
        created_by_profile:profiles!created_by(id, full_name, email),
        listing:listings(id, make, model, year),
        thread:conversation_threads(
          id,
          status,
          last_message_preview,
          buyer:profiles!buyer_id(full_name),
          seller:profiles!seller_id(full_name)
        )
      `
    )
    .order("updated_at", { ascending: false });

  if (scope === "imports") ticketQuery = ticketQuery.eq("category", "import_inquiry").is("thread_id", null);
  if (scope === "conversations") ticketQuery = ticketQuery.not("thread_id", "is", null);
  if (scope === "assistance") {
    ticketQuery = ticketQuery.in("category", ["buyer_assistance", "seller_assistance", "inquiries_assistance"]).is("thread_id", null);
  }
  const { data, error } = await ticketQuery;

  if (error) {
    return {
      viewer,
      tickets: [],
      stats: {
        open: 0,
        escalated: 0,
        waitingOnSeller: 0,
        resolvedToday: 0,
      },
    };
  }

  const tickets = filterAdminVisibleSupportTickets((data || []) as unknown as TicketRow[]).map(
    (ticket) => {
      const assignee = firstRelation(ticket.assigned_to_profile);
      const creator = firstRelation(ticket.created_by_profile);
      const listing = firstRelation(ticket.listing);
      const thread = firstRelation(ticket.thread);
      const threadBuyer = firstRelation(thread?.buyer);
      const threadSeller = firstRelation(thread?.seller);

      return {
        id: ticket.id,
        threadId: ticket.thread_id,
        subject: ticket.subject,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        customerSummary: ticket.customer_summary,
        internalNote: ticket.internal_note,
        resolutionNote: ticket.resolution_note,
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at,
        assignedTo: assignee
          ? {
              id: assignee.id,
              fullName: assignee.full_name,
              email: assignee.email,
            }
          : null,
        createdBy: creator
          ? {
              id: creator.id,
              fullName: creator.full_name,
              email: creator.email,
            }
          : null,
        listing: listing
          ? {
              id: listing.id,
              title: threadListingTitle([listing]),
            }
          : null,
        thread: thread
          ? {
              id: thread.id,
              status: thread.status,
              buyerName: threadBuyer?.full_name || null,
              sellerName: threadSeller?.full_name || null,
              lastMessagePreview: thread.last_message_preview,
            }
          : null,
      };
    }
  );

  const today = new Date().toISOString().slice(0, 10);

  return {
    viewer,
    tickets,
    stats: {
      open: tickets.filter((ticket) => ticket.status === "open").length,
      escalated: tickets.filter((ticket) => ["open", "triaged"].includes(ticket.status)).length,
      waitingOnSeller: tickets.filter((ticket) => ticket.status === "waiting_on_seller").length,
      resolvedToday: tickets.filter(
        (ticket) => ticket.status === "resolved" && ticket.updatedAt.startsWith(today)
      ).length,
    },
  };
});
