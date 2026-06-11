export const LISTING_ENQUIRY_TICKET_CATEGORIES = new Set([
  "listing_enquiry",
  "public_listing_enquiry",
]);

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
