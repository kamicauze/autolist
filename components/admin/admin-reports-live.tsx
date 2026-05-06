import Link from "next/link";
import { ArrowUpRight, CheckCircle2, ShieldAlert, UserRoundX, Workflow } from "lucide-react";
import {
  AdminDataTable,
  AdminPageHeader,
  AdminSectionCard,
  AdminStatCard,
  AdminStatusPill,
  adminGhostButtonClass,
} from "@/components/admin/admin-ui";
import type { AdminReportsData } from "@/lib/data/admin";

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
  if (status === "triaged" || status === "waiting_on_seller" || status === "waiting_on_buyer") {
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
          <AdminDataTable columns={["Subject", "Owner", "Listing", "Priority", "Status", "Updated"]}>
            {data.tickets.length > 0 ? (
              data.tickets.map((ticket) => (
                <tr key={ticket.id} className="border-b border-[#f1f5f9] last:border-b-0">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-[13px] font-semibold text-[#111827]">{ticket.subject}</p>
                      <p className="mt-1 text-[12px] text-[#6b7280]">
                        {formatLabel(ticket.category)}
                      </p>
                      <p className="mt-2 text-[12px] leading-5 text-[#475467]">
                        {ticket.customerSummary || ticket.internalNote || ticket.resolutionNote || "No summary provided."}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-[13px] font-medium text-[#111827]">
                        {ticket.assignedTo || "Unassigned"}
                      </p>
                      <p className="mt-1 text-[12px] text-[#6b7280]">
                        Opened by {ticket.createdBy || "Unknown reporter"}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-[#6b7280]">
                    {ticket.listingTitle || "No listing attached"}
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
                  <td className="px-6 py-4 text-[12px] text-[#6b7280]">{formatDate(ticket.updatedAt)}</td>
                </tr>
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
                      <Link
                        href={`/admin/car-inquiries?ticket=${event.ticketId}`}
                        className="inline-flex items-center gap-1 text-[12px] font-medium text-[#2563eb]"
                      >
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
