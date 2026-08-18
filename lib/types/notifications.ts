import type { MessagingViewer } from "@/lib/types/messaging";

export type NotificationEventType =
  | "new_enquiry"
  | "new_message"
  | "ticket_created"
  | "ticket_assigned"
  | "appointment_requested"
  | "appointment_status_changed"
  | "listing_status_changed"
  | "listing_updated"
  | "listing_alert_match";

export type NotificationChannel = "in_app" | "email" | "whatsapp";
export type NotificationDeliveryStatus = "queued" | "sent" | "read" | "failed" | "skipped";

export type NotificationListItem = {
  id: string;
  eventId: string;
  eventType: NotificationEventType;
  channel: NotificationChannel;
  status: NotificationDeliveryStatus;
  title: string;
  body: string;
  href: string | null;
  createdAt: string;
  deliveredAt: string | null;
  readAt: string | null;
};

export type NotificationCenterData = {
  viewer: MessagingViewer;
  unreadCount: number;
  notifications: NotificationListItem[];
};
