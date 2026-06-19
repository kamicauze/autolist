"use client";

import { Fragment, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, ChevronDown, ShieldAlert, UserRoundX, Workflow } from "lucide-react";
import { updateAdReportStatus } from "@/lib/actions/ad-reports";
import {
  AdminDataTable,
  AdminPageHeader,
  AdminSectionCard,
  AdminStatCard,
  AdminStatusPill,
  adminGhostButtonClass,
  adminPrimaryButtonClass,
  adminTextareaClass,
} from "@/components/admin/admin-ui";
import type { AdminReportsData } from "@/lib/data/admin";

type ReportTicket = AdminReportsData["tickets"][number];

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function ticketStatusTone(status: string) {
  if (status === "resolved" || status === "closed") return "green" as const;
  if (status === "dismissed") return "slate" as const;
  if (
    status === "triaged" ||
    status === "reviewing" ||
    status === "waiting_on_seller" ||
    status === "waiting_on_buyer"
  ) {
    return "blue" as const;
  }
  return "amber" as const;
}

function priorityTone(priority: string) {
  if (priority === "urgent") return "red" as const;
  if (priority === "high") return "amber" as const;
  if (priority === "medium") return "blue" as const;
  return "slate" as const;
}

export function AdminReportsLive({ data }: { data: AdminReportsData }) {
  const [tickets, setTickets] = useState(data.tickets);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusDrafts, setStatusDrafts] = useState<Record<string, string>>({});
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const updateDraftStatus = (ticketId: string, status: string) => {
    setStatusDrafts((current) => ({ ...current, [ticketId]: status }));
  };

  const updateDraftNote = (ticketId: string, note: string) => {
    setNoteDrafts((current) => ({ ...current, [ticketId]: note }));
  };

  const saveAdReport = (ticket: ReportTicket) => {
    setFeedback(null);
    const nextStatus = statusDrafts[ticket.id] || ticket.status;
    const nextNote = noteDrafts[ticket.id] ?? ticket.adminNote ?? "";

    startTransition(async () => {
      const result = await updateAdReportStatus({
        reportId: ticket.id,
        status: nextStatus,
        adminNote: nextNote,
      });

      if ("error" in result) {
        setFeedback({ tone: "error", message: result.error });
        return;
      }

      setTickets((current) =>
        current.map((item) =>
          item.id === ticket.id
            ? {
                ...item,
                status: result.status,
                adminNote: result.adminNote,
                internalNote: result.adminNote || item.internalNote,
                updatedAt: result.updatedAt,
              }
            : item
        )
      );
      setFeedback({ tone: "success", message: "Report updated." });
    });
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Reports & Safety"
        action={
          <Link href="/admin/car-inquiries" className={adminGhostButtonClass}>
            Open support queue
          </Link>
        }
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <AdminStatCard
          label="Open reports"
          value={data.stats.open.toLocaleString("en-KE")}
          icon={<ShieldAlert className="h-5 w-5" />}
        />
        <AdminStatCard
          label="High priority"
          value={data.stats.highPriority.toLocaleString("en-KE")}
          icon={<Workflow className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Resolved today"
          value={data.stats.resolvedToday.toLocaleString("en-KE")}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Unassigned"
          value={data.stats.unassigned.toLocaleString("en-KE")}
          icon={<UserRoundX className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <AdminSectionCard
          data-tour="reports-queue"
          title="Live Ticket Queue"
          description="Current support tickets and safety escalations pulled from the backend queue."
        >
          {feedback ? (
            <div
              className={`mb-4 rounded-[12px] border px-4 py-3 text-[13px] ${
                feedback.tone === "success"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {feedback.message}
            </div>
          ) : null}
          <AdminDataTable columns={["Subject", "Reporter / Owner", "Target", "Priority", "Status", "Updated"]}>
            {tickets.length > 0 ? (
              tickets.map((ticket) => (
                <Fragment key={ticket.id}>
                  <tr className="border-b border-[#f1f5f9] last:border-b-0">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-[13px] font-semibold text-[#111827]">{ticket.subject}</p>
                        <p className="mt-1 text-[12px] text-[#6b7280]">
                          {formatLabel(ticket.category)}
                          {ticket.source === "ad_report" ? " • Ad report" : " • Support ticket"}
                        </p>
                        <p className="mt-2 text-[12px] leading-5 text-[#475467]">
                          {ticket.customerSummary || ticket.internalNote || ticket.resolutionNote || "No summary provided."}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-[13px] font-medium text-[#111827]">
                          {ticket.source === "ad_report" ? ticket.createdBy || "Unknown reporter" : ticket.assignedTo || "Unassigned"}
                        </p>
                        <p className="mt-1 text-[12px] text-[#6b7280]">
                          {ticket.source === "ad_report"
                            ? [ticket.reporterPhone, ticket.reporterLocation].filter(Boolean).join(" • ") || "No contact details"
                            : `Opened by ${ticket.createdBy || "Unknown reporter"}`}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-[#6b7280]">
                      {ticket.href ? (
                        <Link href={ticket.href} className="font-medium text-primary hover:underline">
                          {ticket.listingTitle || "Open target"}
                        </Link>
                      ) : (
                        ticket.listingTitle || "No target attached"
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <AdminStatusPill label={ticket.priority} tone={priorityTone(ticket.priority)} />
                    </td>
                    <td className="px-6 py-4">
                      <AdminStatusPill
                        label={formatLabel(ticket.status)}
                        tone={ticketStatusTone(ticket.status)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[12px] text-[#6b7280]">{formatDate(ticket.updatedAt)}</span>
                        {ticket.source === "ad_report" ? (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-[8px] border border-[#d1d5db] px-2.5 py-1.5 text-[12px] font-medium text-[#374151] transition hover:border-primary hover:text-primary active:scale-[0.98]"
                            onClick={() => setExpandedId((current) => (current === ticket.id ? null : ticket.id))}
                          >
                            Details
                            <ChevronDown
                              className={`h-3.5 w-3.5 transition ${expandedId === ticket.id ? "rotate-180" : ""}`}
                            />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                  {expandedId === ticket.id && ticket.source === "ad_report" ? (
                    <tr className="border-b border-[#e5e7eb] bg-[#f8fafc]">
                      <td colSpan={6} className="px-6 py-5">
                        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                          <div className="space-y-4">
                            <div>
                              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#64748b]">
                                Reporter details
                              </p>
                              <div className="mt-3 grid gap-3 md:grid-cols-3">
                                <div className="rounded-[12px] border border-[#e5e7eb] bg-white px-4 py-3">
                                  <p className="text-[12px] text-[#64748b]">Email</p>
                                  <p className="mt-1 break-words text-[13px] font-medium text-[#111827]">
                                    {ticket.reporterEmail || "Not provided"}
                                  </p>
                                </div>
                                <div className="rounded-[12px] border border-[#e5e7eb] bg-white px-4 py-3">
                                  <p className="text-[12px] text-[#64748b]">Mobile</p>
                                  <p className="mt-1 text-[13px] font-medium text-[#111827]">
                                    {ticket.reporterPhone || "Not provided"}
                                  </p>
                                </div>
                                <div className="rounded-[12px] border border-[#e5e7eb] bg-white px-4 py-3">
                                  <p className="text-[12px] text-[#64748b]">Location</p>
                                  <p className="mt-1 text-[13px] font-medium text-[#111827]">
                                    {ticket.reporterLocation || "Not provided"}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="rounded-[14px] border border-[#e5e7eb] bg-white px-4 py-3">
                              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#64748b]">
                                Report comments
                              </p>
                              <p className="mt-2 whitespace-pre-wrap text-[13px] leading-6 text-[#475467]">
                                {ticket.customerSummary || "No comments provided."}
                              </p>
                            </div>
                          </div>
                          <div className="rounded-[14px] border border-[#e5e7eb] bg-white p-4">
                            <p className="text-[13px] font-semibold text-[#111827]">Admin action</p>
                            <label className="mt-4 block space-y-2 text-[13px] font-medium text-[#374151]">
                              <span>Status</span>
                              <select
                                value={statusDrafts[ticket.id] || ticket.status}
                                onChange={(event) => updateDraftStatus(ticket.id, event.target.value)}
                                className="h-10 w-full rounded-[8px] border border-[#e5e7eb] bg-white px-3 text-[13px] outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                              >
                                <option value="open">Open</option>
                                <option value="reviewing">Reviewing</option>
                                <option value="resolved">Resolved</option>
                                <option value="dismissed">Dismissed</option>
                              </select>
                            </label>
                            <label className="mt-4 block space-y-2 text-[13px] font-medium text-[#374151]">
                              <span>Admin note</span>
                              <textarea
                                value={noteDrafts[ticket.id] ?? ticket.adminNote ?? ""}
                                onChange={(event) => updateDraftNote(ticket.id, event.target.value)}
                                className={adminTextareaClass}
                                placeholder="Record what was checked or what action was taken."
                              />
                            </label>
                            <div className="mt-4 flex items-center justify-between gap-3">
                              <Link href={ticket.href} className="inline-flex items-center gap-1 text-[12px] font-medium text-primary">
                                Open target
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              </Link>
                              <button
                                type="button"
                                className={adminPrimaryButtonClass}
                                onClick={() => saveAdReport(ticket)}
                                disabled={isPending}
                              >
                                {isPending ? "Saving..." : "Save"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-[13px] text-[#6b7280]">
                  No report tickets are in the queue yet.
                </td>
              </tr>
            )}
          </AdminDataTable>
        </AdminSectionCard>

        <AdminSectionCard
          data-tour="reports-activity"
          title="Recent Ticket Activity"
          description="Latest event trail from assignments, status changes, and resolutions."
        >
          <div className="space-y-4">
            {data.recentEvents.length > 0 ? (
              data.recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-[#111827]">
                        {event.ticketSubject}
                      </p>
                      <p className="mt-1 text-[12px] text-[#6b7280]">
                        {event.actorName} • {formatLabel(event.eventType)}
                      </p>
                    </div>
                    {event.ticketPriority ? (
                      <AdminStatusPill
                        label={event.ticketPriority}
                        tone={priorityTone(event.ticketPriority)}
                      />
                    ) : null}
                  </div>
                  <p className="mt-3 text-[13px] leading-6 text-[#475467]">
                    {event.note || "No note recorded for this event."}
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-[12px] text-[#94a3b8]">{formatDate(event.createdAt)}</p>
                    <div className="flex items-center gap-2">
                      {event.ticketStatus ? (
                        <AdminStatusPill
                          label={formatLabel(event.ticketStatus)}
                          tone={ticketStatusTone(event.ticketStatus)}
                        />
                      ) : null}
                      <Link href={event.href} className="inline-flex items-center gap-1 text-[12px] font-medium text-primary">
                        Open
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[13px] text-[#6b7280]">No ticket events recorded yet.</p>
            )}
          </div>
        </AdminSectionCard>
      </div>
    </div>
  );
}
