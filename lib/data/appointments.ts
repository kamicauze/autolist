import { cache } from "react";
import { parseAppointmentStatus } from "@/lib/appointments/management";
import { getSalesAgentViewerContext } from "@/lib/data/sales-agent-permissions";
import { createClient } from "@/lib/supabase/server";
import type {
  AppointmentRequestItem,
  AppointmentsDashboardData,
} from "@/lib/types/appointments";

type AppointmentRow = {
  id: string;
  listing_id: string;
  buyer_id: string | null;
  seller_id: string;
  dealer_id: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  start_at: string;
  end_at: string;
  timezone: string | null;
  message: string | null;
  status: string;
  assigned_agent_id: string | null;
  seller_notes: string | null;
  seller_responded_at: string | null;
  status_changed_at: string;
  created_at: string;
  updated_at: string;
  listing:
    | { id: string; year: number | null; make: string | null; model: string | null }
    | Array<{ id: string; year: number | null; make: string | null; model: string | null }>
    | null;
};

const APPOINTMENT_SELECT = `
  id,
  listing_id,
  buyer_id,
  seller_id,
  dealer_id,
  contact_name,
  contact_email,
  contact_phone,
  start_at,
  end_at,
  timezone,
  message,
  status,
  assigned_agent_id,
  seller_notes,
  seller_responded_at,
  status_changed_at,
  created_at,
  updated_at,
  listing:listings!listing_id(id, year, make, model)
`;

function firstRelation<T>(value: T | T[] | null) {
  return Array.isArray(value) ? value[0] || null : value;
}

function mapAppointment(row: AppointmentRow): AppointmentRequestItem | null {
  const status = parseAppointmentStatus(row.status);
  if (!status) return null;
  const listing = firstRelation(row.listing);

  return {
    id: row.id,
    listingId: row.listing_id,
    buyerId: row.buyer_id,
    sellerId: row.seller_id,
    dealerId: row.dealer_id,
    contactName: row.contact_name?.trim() || "Customer",
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    startAt: row.start_at,
    endAt: row.end_at,
    timezone: row.timezone || "Africa/Nairobi",
    message: row.message,
    status,
    assignedAgentId: row.assigned_agent_id,
    sellerNotes: row.seller_notes,
    sellerRespondedAt: row.seller_responded_at,
    statusChangedAt: row.status_changed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    listing: {
      id: listing?.id || row.listing_id,
      title:
        [listing?.year, listing?.make, listing?.model].filter(Boolean).join(" ") ||
        "Listing",
    },
  };
}

export const getAppointmentsDashboardData = cache(
  async (): Promise<AppointmentsDashboardData> => {
    const generatedAt = new Date().toISOString();
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { access: "unauthenticated", requests: [], generatedAt };
    }

    const [{ data: profile }, repContext] = await Promise.all([
      supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle<{ role: string | null }>(),
      getSalesAgentViewerContext(),
    ]);

    if (profile?.role === "sales_agent") {
      if (!repContext?.permissions.includes("enquiries.respond")) {
        return { access: "forbidden", requests: [], generatedAt };
      }
    } else if (profile?.role !== "seller" && profile?.role !== "dealer") {
      return { access: "forbidden", requests: [], generatedAt };
    }

    const sellerId = repContext?.principalProfileId ?? user.id;
    let query = supabase
      .from("appointment_requests")
      .select(APPOINTMENT_SELECT)
      .eq("seller_id", sellerId)
      .order("start_at", { ascending: true })
      .limit(500);

    if (repContext) {
      query = query.eq("dealer_id", repContext.dealerId);
    }

    const { data, error } = await query;
    if (error) {
      return {
        access: "allowed",
        requests: [],
        generatedAt,
        error: "Customer requests could not be loaded. Check appointment access and try again.",
      };
    }

    return {
      access: "allowed",
      requests: ((data || []) as unknown as AppointmentRow[])
        .map(mapAppointment)
        .filter((item): item is AppointmentRequestItem => Boolean(item)),
      generatedAt,
      error: null,
    };
  }
);
