"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Clock3, ShieldAlert, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AdminPageHeader,
  AdminSectionCard,
  AdminStatCard,
  AdminStatusPill,
  adminGhostButtonClass,
  adminMetricIcons,
  adminPrimaryButtonClass,
  adminSelectClass,
  adminTextareaClass,
} from "./admin-ui";
import type { SupportQueueData, SupportTicketListItem } from "@/lib/types/messaging";
import { parseInsuranceSupportTicketMeta } from "@/lib/insurance/support-ticket-fallback";

type AdminTicketQueueProps = {
  initialData: SupportQueueData | null;
  title?: string;
  description?: string;
};

function humanizeCategory(category: string) {
  return category
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getTicketKind(ticket: SupportTicketListItem | null) {
  if (!ticket) return "inquiry" as const;
  if (parseInsuranceSupportTicketMeta(ticket.resolutionNote)) return "insurance" as const;
  if (ticket.thread) return "conversation" as const;
  return "inquiry" as const;
}

const TICKET_KIND_LABELS = {
  insurance: "Insurance",
  conversation: "Conversation",
  inquiry: "Inquiry",
} as const;

const STATUS_LABELS: Record<SupportTicketListItem["status"], string> = {
  open: "Open",
  triaged: "Triaged",
  waiting_on_seller: "Waiting on seller",
  waiting_on_buyer: "Waiting on buyer",
  resolved: "Resolved",
  closed: "Closed",
};

const INSURANCE_STATUS_LABELS: Record<SupportTicketListItem["status"], string> = {
  open: "New request",
  triaged: "Quoted",
  waiting_on_seller: "Blocked",
  waiting_on_buyer: "Blocked (waiting on customer)",
  resolved: "Bound (policy issued)",
  closed: "Cancelled",
};

function SummaryLines({ text }: { text: string }) {
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  return (
    <div className="mt-2 space-y-1">
      {lines.map((line, index) => {
        const match = line.match(/^([A-Za-z][A-Za-z ]{0,24}):\s*(.*)$/);
        if (!match) {
          return (
            <p key={index} className="text-[13px] leading-6 text-[#475467]">
              {line}
            </p>
          );
        }
        return (
          <p key={index} className="text-[13px] leading-6 text-[#475467]">
            <span className="font-semibold text-[#111827]">{match[1]}:</span> {match[2]}
          </p>
        );
      })}
    </div>
  );
}

function toneForStatus(status: SupportTicketListItem["status"]) {
  if (status === "resolved") return "green" as const;
  if (status === "closed") return "slate" as const;
  if (status === "triaged" || status === "waiting_on_seller" || status === "waiting_on_buyer") {
    return "amber" as const;
  }
  return "red" as const;
}

function toneForPriority(priority: SupportTicketListItem["priority"]) {
  if (priority === "urgent") return "red" as const;
  if (priority === "high") return "amber" as const;
  if (priority === "medium") return "blue" as const;
  return "slate" as const;
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-KE", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function AdminTicketQueue({
  initialData,
  title = "Import Inquiries",
  description = "Monitor escalated buyer-seller threads, assign staff ownership, and close the loop with a clean internal ticket trail.",
}: AdminTicketQueueProps) {
  const searchParams = useSearchParams();
  const [tickets, setTickets] = React.useState<SupportTicketListItem[]>(initialData?.tickets || []);
  const [selectedId, setSelectedId] = React.useState(initialData?.tickets[0]?.id || "");
  const [status, setStatus] = React.useState<SupportTicketListItem["status"]>("open");
  const [note, setNote] = React.useState("");
  const [resolutionNote, setResolutionNote] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);

  const viewer = initialData?.viewer || null;
  const selectedTicket = tickets.find((ticket) => ticket.id === selectedId) || tickets[0] || null;
  const insuranceMeta = parseInsuranceSupportTicketMeta(selectedTicket?.resolutionNote);
  const selectedKind = getTicketKind(selectedTicket);

  React.useEffect(() => {
    const requestedTicket = searchParams.get("ticket");
    if (requestedTicket && tickets.some((ticket) => ticket.id === requestedTicket)) {
      setSelectedId(requestedTicket);
    }
  }, [searchParams, tickets]);

  React.useEffect(() => {
    if (!selectedTicket) return;
    setStatus(selectedTicket.status);
    setNote(selectedTicket.internalNote || "");
    setResolutionNote(selectedTicket.resolutionNote || "");
  }, [selectedTicket]);

  async function updateTicket(assignToSelf = false) {
    if (!selectedTicket) return;

    setIsSaving(true);
    setFeedback(null);

    try {
      const response = await fetch(`/api/support/tickets/${selectedTicket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          internalNote: note,
          resolutionNote,
          assignToSelf,
        }),
      });

      const payload = (await response.json()) as { error?: string; status?: SupportTicketListItem["status"] };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to update ticket.");
      }

      setTickets((current) =>
        current.map((ticket) =>
          ticket.id === selectedTicket.id
            ? {
                ...ticket,
                status,
                internalNote: note || null,
                resolutionNote: resolutionNote || null,
                assignedTo: assignToSelf
                  ? {
                      id: viewer?.id || "",
                      fullName: viewer?.fullName || null,
                      email: viewer?.email || null,
                    }
                  : ticket.assignedTo,
                updatedAt: new Date().toISOString(),
              }
            : ticket
        )
      );
      setFeedback(assignToSelf ? "Ticket assigned and updated." : "Ticket updated.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to update ticket.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!viewer) {
    return (
      <div className="space-y-8">
        <AdminPageHeader title={title} />
        <AdminSectionCard title="Access required">
          <p className="text-[14px] text-[#6b7280]">Sign in with an admin or support account.</p>
        </AdminSectionCard>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader title={title} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Open Threads" value={String(initialData?.stats.open || 0)} icon={adminMetricIcons.inquiries} />
        <AdminStatCard label="Escalated" value={String(initialData?.stats.escalated || 0)} icon={<ShieldAlert className="h-5 w-5" />} />
        <AdminStatCard label="Waiting On Seller" value={String(initialData?.stats.waitingOnSeller || 0)} icon={<Clock3 className="h-5 w-5" />} />
        <AdminStatCard label="Resolved Today" value={String(initialData?.stats.resolvedToday || 0)} icon={<UserCheck className="h-5 w-5" />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <AdminSectionCard data-tour="inquiries-list" title="Ticket Queue" description={description} bodyClassName="p-0">
          <div className="divide-y divide-[#eef2f7]">
            {tickets.length === 0 ? (
              <div className="px-6 py-8 text-[14px] text-[#6b7280]">No support tickets yet.</div>
            ) : null}
            {tickets.map((ticket) => {
              const active = ticket.id === selectedTicket?.id;
              const kind = getTicketKind(ticket);
              const contextLabel = ticket.thread
                ? `${ticket.thread.buyerName || "Buyer"} • ${ticket.listing?.title || "Listing"}`
                : `${humanizeCategory(ticket.category)} • ${
                    ticket.createdBy?.fullName || ticket.createdBy?.email || "Public inquiry"
                  }`;
              return (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => setSelectedId(ticket.id)}
                  className={cn(
                    "w-full px-6 py-5 text-left transition",
                    active ? "bg-brand-soft-surface" : "bg-white hover:bg-[#fafcff]"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-[#111827]">{ticket.subject}</p>
                      <p className="mt-1 text-[12px] text-[#6b7280]">
                        {contextLabel}
                      </p>
                    </div>
                    <p className="text-[11px] text-[#94a3b8]">{formatTime(ticket.updatedAt)}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <AdminStatusPill label={TICKET_KIND_LABELS[kind]} tone="slate" />
                    <AdminStatusPill
                      label={
                        kind === "insurance"
                          ? INSURANCE_STATUS_LABELS[ticket.status]
                          : STATUS_LABELS[ticket.status]
                      }
                      tone={toneForStatus(ticket.status)}
                    />
                    <AdminStatusPill label={ticket.priority} tone={toneForPriority(ticket.priority)} />
                  </div>
                  <p className="mt-3 line-clamp-2 text-[13px] leading-6 text-[#475467]">
                    {ticket.customerSummary || ticket.thread?.lastMessagePreview || "No summary available."}
                  </p>
                </button>
              );
            })}
          </div>
        </AdminSectionCard>

        <AdminSectionCard
          data-tour="inquiries-detail"
          title={selectedTicket?.subject || "Ticket details"}
          description={selectedTicket ? "Review the conversation summary, assign ownership, and update the ticket status." : "Select a ticket from the queue."}
          action={
            selectedTicket ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  className={adminGhostButtonClass}
                  onClick={() => void updateTicket(true)}
                  disabled={isSaving}
                >
                  Assign to me
                </button>
                <button
                  type="button"
                  className={adminPrimaryButtonClass}
                  onClick={() => void updateTicket(false)}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save changes"}
                </button>
              </div>
            ) : null
          }
        >
          {selectedTicket ? (
            <div className="space-y-5">
              {feedback ? (
                <div className="rounded-[12px] border border-[#d0d5dd] bg-[#f8fafc] px-4 py-3 text-[13px] text-[#475467]">
                  {feedback}
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                {selectedKind === "insurance" && insuranceMeta ? (
                  <div className="rounded-[14px] border border-[#eef2f7] bg-[#fbfcfd] p-4">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#667085]">
                      Insurance request
                    </p>
                    <dl className="mt-2 space-y-1 text-[13px] leading-6">
                      {[
                        ["Reference", insuranceMeta.reference],
                        ["Customer", insuranceMeta.fullName],
                        ["Email", insuranceMeta.email],
                        ["Phone", `${insuranceMeta.phoneCountryCode} ${insuranceMeta.phoneNumber}`.trim()],
                        ["Vehicle", `${insuranceMeta.vehicleYear} ${insuranceMeta.vehicleMakeModel}`],
                        ["Cover", insuranceMeta.coverType],
                        ["Preferred start", insuranceMeta.preferredStartDate],
                        ["Insurer", insuranceMeta.insurerName],
                        [
                          "Quote",
                          insuranceMeta.quoteAmount != null
                            ? `${insuranceMeta.quoteCurrency} ${new Intl.NumberFormat("en-KE").format(insuranceMeta.quoteAmount)}`
                            : null,
                        ],
                      ]
                        .filter(([, value]) => value)
                        .map(([label, value]) => (
                          <div key={label as string} className="flex gap-2">
                            <dt className="shrink-0 font-semibold text-[#111827]">{label}:</dt>
                            <dd className="min-w-0 break-words text-[#344054]">{value}</dd>
                          </div>
                        ))}
                    </dl>
                  </div>
                ) : selectedTicket.thread ? (
                  <div className="rounded-[14px] border border-[#eef2f7] bg-[#fbfcfd] p-4">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#667085]">
                      Conversation
                    </p>
                    <p className="mt-2 text-[13px] leading-6 text-[#344054]">
                      <span className="font-semibold text-[#111827]">Buyer:</span>{" "}
                      {selectedTicket.thread.buyerName || "Unknown"}
                    </p>
                    <p className="text-[13px] leading-6 text-[#344054]">
                      <span className="font-semibold text-[#111827]">Seller:</span>{" "}
                      {selectedTicket.thread.sellerName || "Unknown"}
                    </p>
                    <p className="text-[13px] leading-6 text-[#344054]">
                      <span className="font-semibold text-[#111827]">Listing:</span>{" "}
                      {selectedTicket.listing?.title || "Unknown listing"}
                    </p>
                    <p className="mt-2 text-[13px] leading-6 text-[#475467]">
                      {selectedTicket.thread.lastMessagePreview || "No message preview."}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-[14px] border border-[#eef2f7] bg-[#fbfcfd] p-4">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#667085]">
                      Request
                    </p>
                    <p className="mt-2 text-[13px] leading-6 text-[#344054]">
                      <span className="font-semibold text-[#111827]">Type:</span>{" "}
                      {humanizeCategory(selectedTicket.category)}
                    </p>
                    <p className="text-[13px] leading-6 text-[#344054]">
                      <span className="font-semibold text-[#111827]">Submitted by:</span>{" "}
                      {selectedTicket.createdBy?.fullName || selectedTicket.createdBy?.email || "Public visitor"}
                    </p>
                    <p className="mt-2 text-[13px] leading-6 text-[#475467]">
                      Not linked to a buyer-seller conversation.
                    </p>
                  </div>
                )}

                <div className="rounded-[14px] border border-[#eef2f7] bg-[#fbfcfd] p-4">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#667085]">
                    Ownership
                  </p>
                  <p className="mt-2 text-[13px] leading-6 text-[#344054]">
                    <span className="font-semibold text-[#111827]">Created by:</span>{" "}
                    {selectedTicket.createdBy?.fullName || selectedTicket.createdBy?.email || "Unknown"}
                  </p>
                  <p className="text-[13px] leading-6 text-[#344054]">
                    <span className="font-semibold text-[#111827]">Assigned to:</span>{" "}
                    {selectedTicket.assignedTo?.fullName || selectedTicket.assignedTo?.email || "Unassigned"}
                  </p>
                  <p className="text-[13px] leading-6 text-[#344054]">
                    <span className="font-semibold text-[#111827]">Updated:</span>{" "}
                    {formatTime(selectedTicket.updatedAt)}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-[13px] font-medium text-[#344054]">
                  Status
                  <select
                    className={adminSelectClass}
                    value={status}
                    onChange={(event) => setStatus(event.target.value as SupportTicketListItem["status"])}
                  >
                    {(Object.keys(STATUS_LABELS) as SupportTicketListItem["status"][]).map((value) => (
                      <option key={value} value={value}>
                        {selectedKind === "insurance" ? INSURANCE_STATUS_LABELS[value] : STATUS_LABELS[value]}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="rounded-[14px] border border-[#eef2f7] bg-[#fbfcfd] px-4 py-3 text-[13px] leading-6 text-[#475467]">
                  <p className="font-semibold text-[#111827]">Customer summary</p>
                  {selectedTicket.customerSummary ? (
                    <SummaryLines text={selectedTicket.customerSummary} />
                  ) : (
                    <p className="mt-2">No customer summary on this ticket yet.</p>
                  )}
                </div>
              </div>

              <label className="space-y-2 text-[13px] font-medium text-[#344054]">
                Internal note
                <textarea
                  className={adminTextareaClass}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="What does the admin/support team need to know?"
                />
              </label>

              {insuranceMeta ? (
                <p className="rounded-[12px] border border-[#e4e7ec] bg-[#fbfcfd] px-4 py-3 text-[12px] text-[#98a2b3]">
                  This ticket is an insurance request — its details are shown above and are managed
                  from the Insurance admin page. There is no free-text resolution note.
                </p>
              ) : (
                <label className="space-y-2 text-[13px] font-medium text-[#344054]">
                  Resolution note
                  <textarea
                    className={adminTextareaClass}
                    value={resolutionNote}
                    onChange={(event) => setResolutionNote(event.target.value)}
                    placeholder="Record the outcome when this ticket is resolved."
                  />
                </label>
              )}
            </div>
          ) : (
            <div className="rounded-[14px] border border-dashed border-[#d0d5dd] bg-[#fbfcfd] px-5 py-8 text-[14px] text-[#6b7280]">
              No tickets in the queue.
            </div>
          )}
        </AdminSectionCard>
      </div>
    </div>
  );
}
