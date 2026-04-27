export type ProfileRole =
  | "buyer"
  | "seller"
  | "dealer"
  | "sales_agent"
  | "support"
  | "admin"
  | "super_admin";

export type MessagingViewer = {
  id: string;
  email: string | null;
  fullName: string | null;
  role: ProfileRole;
};

export type ThreadListItem = {
  id: string;
  listingId: string;
  listingTitle: string;
  counterpartName: string;
  counterpartEmail: string | null;
  status: string;
  source: string;
  subject: string | null;
  lastMessageAt: string;
  lastMessagePreview: string | null;
  ticketCount: number;
  openTicketCount: number;
};

export type ThreadMessageItem = {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: "me" | "them";
  body: string;
  visibility: "participants" | "staff_only";
  messageType: "text" | "system" | "ticket_note";
  createdAt: string;
};

export type MessagingCenterData = {
  viewer: MessagingViewer | null;
  threads: ThreadListItem[];
  messagesByThread: Record<string, ThreadMessageItem[]>;
  error?: string | null;
};

export type SupportTicketListItem = {
  id: string;
  threadId: string | null;
  subject: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "triaged" | "waiting_on_seller" | "waiting_on_buyer" | "resolved" | "closed";
  customerSummary: string | null;
  internalNote: string | null;
  resolutionNote: string | null;
  createdAt: string;
  updatedAt: string;
  assignedTo: {
    id: string;
    fullName: string | null;
    email: string | null;
  } | null;
  createdBy: {
    id: string;
    fullName: string | null;
    email: string | null;
  } | null;
  listing: {
    id: string;
    title: string;
  } | null;
  thread: {
    id: string;
    status: string;
    buyerName: string | null;
    sellerName: string | null;
    lastMessagePreview: string | null;
  } | null;
};

export type SupportQueueData = {
  viewer: MessagingViewer;
  tickets: SupportTicketListItem[];
  stats: {
    open: number;
    escalated: number;
    waitingOnSeller: number;
    resolvedToday: number;
  };
};
