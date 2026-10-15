export const LISTING_ENQUIRY_TICKET_CATEGORIES = new Set([
  "listing_enquiry",
  "public_listing_enquiry",
]);

export function getAdminSupportTicketHref(ticketId: string, category?: string | null) {
  const path = category === "import_inquiry"
    ? "/admin/car-inquiries"
    : category === "insurance_request"
      ? "/admin/insurance-requests"
      : ["buyer_assistance", "seller_assistance", "inquiries_assistance"].includes(category || "")
        ? "/admin/inquiries-assistance"
        : "/admin/conversation-tickets";
  return `${path}?ticket=${encodeURIComponent(ticketId)}`;
}

type SupportTicketCategory = {
  category: string | null;
};

export function isListingEnquiryTicketCategory(category: string | null | undefined) {
  return category ? LISTING_ENQUIRY_TICKET_CATEGORIES.has(category) : false;
}

export function isAdminVisibleSupportTicket(ticket: SupportTicketCategory) {
  return !isListingEnquiryTicketCategory(ticket.category);
}

export function filterAdminVisibleSupportTickets<T extends SupportTicketCategory>(
  tickets: readonly T[]
) {
  return tickets.filter(isAdminVisibleSupportTicket);
}
