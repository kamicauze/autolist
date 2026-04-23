import { Clock3, FileText, ScrollText, ShieldCheck } from "lucide-react";
import {
  AdminDataTable,
  AdminPageHeader,
  AdminSectionCard,
  AdminStatCard,
  AdminStatusPill,
} from "@/components/admin/admin-ui";
import type { AdminAuditLogsData } from "@/lib/data/admin";

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

function shortenId(value: string | null) {
  if (!value) return "n/a";
  return value.length > 8 ? `${value.slice(0, 8)}...` : value;
}

function detailSummary(details: Record<string, unknown> | null) {
  if (!details) return "No extra details";

  const preferredKeys = ["note", "reason", "status", "submitted_documents"];
  const collected: string[] = [];

  for (const key of preferredKeys) {
    const value = details[key];
    if (typeof value === "string" && value.trim()) {
      collected.push(`${formatLabel(key)}: ${value.trim()}`);
    } else if (Array.isArray(value) && value.length > 0) {
      collected.push(
        `${formatLabel(key)}: ${value
          .map((item) => String(item).trim())
          .filter(Boolean)
          .join(", ")}`
      );
    }
  }

  if (collected.length > 0) {
    return collected.slice(0, 2).join(" | ");
  }

  const fallback = Object.entries(details)
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .slice(0, 2)
    .map(([key, value]) => `${formatLabel(key)}: ${String(value)}`);

  return fallback.length > 0 ? fallback.join(" | ") : "No extra details";
}

function entityTone(entityType: string) {
  if (entityType === "dealer") return "green" as const;
  if (entityType === "listing") return "blue" as const;
  return "slate" as const;
}

export function AdminAuditLogsLive({ data }: { data: AdminAuditLogsData }) {
  return (
    <div className="space-y-8">
      <AdminPageHeader title="Audit Logs" />

      <div className="grid gap-4 xl:grid-cols-4">
        <AdminStatCard
          label="Total events"
          value={data.stats.total.toLocaleString("en-KE")}
          icon={<ScrollText className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Last 24 hours"
          value={data.stats.last24Hours.toLocaleString("en-KE")}
          icon={<Clock3 className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Dealer events"
          value={data.stats.dealerEvents.toLocaleString("en-KE")}
          icon={<ShieldCheck className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Listing events"
          value={data.stats.listingEvents.toLocaleString("en-KE")}
          icon={<FileText className="h-5 w-5" />}
        />
      </div>

      <AdminSectionCard
        title="Recent Activity"
        description="Latest audit events captured from backend actions and moderation workflows."
      >
        <AdminDataTable columns={["Action", "Actor", "Entity", "Details", "Created"]}>
          {data.logs.length > 0 ? (
            data.logs.map((log) => (
              <tr key={log.id} className="border-b border-[#f1f5f9] last:border-b-0">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-[13px] font-semibold text-[#111827]">
                      {formatLabel(log.action)}
                    </p>
                    <p className="mt-1 text-[12px] text-[#6b7280]">{log.id}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-[13px] font-medium text-[#111827]">{log.actor.name}</p>
                    <p className="mt-1 text-[12px] text-[#6b7280]">
                      {log.actor.email || "No email"}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-2">
                    <AdminStatusPill
                      label={formatLabel(log.entityType)}
                      tone={entityTone(log.entityType)}
                    />
                    <p className="font-mono text-[11px] text-[#6b7280]">
                      {shortenId(log.entityId)}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-[12px] leading-5 text-[#475467]">
                      {detailSummary(log.details)}
                    </p>
                    {log.ipAddress ? (
                      <p className="mt-1 text-[11px] text-[#94a3b8]">IP: {log.ipAddress}</p>
                    ) : null}
                  </div>
                </td>
                <td className="px-6 py-4 text-[12px] text-[#6b7280]">
                  {formatDate(log.createdAt)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="px-6 py-10 text-center text-[13px] text-[#6b7280]">
                No audit events recorded yet.
              </td>
            </tr>
          )}
        </AdminDataTable>
      </AdminSectionCard>
    </div>
  );
}
