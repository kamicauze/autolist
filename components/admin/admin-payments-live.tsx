import { CircleDollarSign, Clock3, RotateCcw, Wallet } from "lucide-react";
import {
  AdminDataTable,
  AdminPageHeader,
  AdminSectionCard,
  AdminStatCard,
  AdminStatusPill,
} from "@/components/admin/admin-ui";
import type { AdminPaymentsData } from "@/lib/data/admin";

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

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
  if (value === "mpesa") return "M-Pesa";
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function paymentStatusTone(status: string) {
  if (status === "succeeded") return "green" as const;
  if (status === "pending") return "amber" as const;
  if (status === "failed") return "red" as const;
  return "slate" as const;
}

function roleTone(role: string | null) {
  if (role === "dealer") return "green" as const;
  if (role === "seller") return "blue" as const;
  if (role === "admin" || role === "support") return "amber" as const;
  return "slate" as const;
}

export function AdminPaymentsLive({ data }: { data: AdminPaymentsData }) {
  return (
    <div className="space-y-8">
      <AdminPageHeader title="Payments" />

      <div className="grid gap-4 xl:grid-cols-4">
        <AdminStatCard
          label="Gross volume"
          value={formatCurrency(data.stats.grossVolume, data.stats.primaryCurrency)}
          icon={<CircleDollarSign className="h-5 w-5" />}
          note={`${data.stats.successfulPayments} cleared`}
        />
        <AdminStatCard
          label="Pending volume"
          value={formatCurrency(data.stats.pendingVolume, data.stats.primaryCurrency)}
          icon={<Clock3 className="h-5 w-5" />}
          note={`${data.stats.pendingCount} pending`}
        />
        <AdminStatCard
          label="Refunds"
          value={data.stats.refundCount.toLocaleString("en-KE")}
          icon={<RotateCcw className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Successful payments"
          value={data.stats.successfulPayments.toLocaleString("en-KE")}
          icon={<Wallet className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <AdminSectionCard
          title="Recent Transactions"
          description="Live payment ledger pulled from the platform payments table."
        >
          <AdminDataTable columns={["Reference", "Account", "Purpose", "Amount", "Provider", "Status", "Created"]}>
            {data.payments.length > 0 ? (
              data.payments.map((payment) => (
                <tr key={payment.id} className="border-b border-[#f1f5f9] last:border-b-0">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-[13px] font-semibold text-[#111827]">{payment.reference}</p>
                      <p className="mt-1 font-mono text-[11px] text-[#94a3b8]">{payment.id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div>
                        <p className="text-[13px] font-medium text-[#111827]">{payment.accountName}</p>
                        <p className="mt-1 text-[12px] text-[#6b7280]">
                          {payment.accountEmail || "No email"}
                        </p>
                      </div>
                      {payment.accountRole ? (
                        <AdminStatusPill label={payment.accountRole} tone={roleTone(payment.accountRole)} />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-[13px] font-medium text-[#111827]">
                        {formatLabel(payment.purpose)}
                      </p>
                      <p className="mt-1 text-[12px] text-[#6b7280]">
                        {payment.note || "No extra metadata"}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[13px] font-semibold text-[#111827]">
                    {formatCurrency(payment.amount, payment.currency)}
                  </td>
                  <td className="px-6 py-4 text-[13px] text-[#6b7280]">
                    {formatLabel(payment.provider)}
                  </td>
                  <td className="px-6 py-4">
                    <AdminStatusPill
                      label={formatLabel(payment.status)}
                      tone={paymentStatusTone(payment.status)}
                    />
                  </td>
                  <td className="px-6 py-4 text-[12px] text-[#6b7280]">{formatDate(payment.createdAt)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-[13px] text-[#6b7280]">
                  No payments have been recorded yet.
                </td>
              </tr>
            )}
          </AdminDataTable>
        </AdminSectionCard>

        <div className="space-y-6">
          <AdminSectionCard
            title="Purpose Mix"
            description="What the current ledger is charging for."
          >
            <div className="space-y-3">
              {data.purposeBreakdown.length > 0 ? (
                data.purposeBreakdown.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-heading text-[16px] font-semibold text-[#111827]">
                        {item.label}
                      </p>
                      <p className="text-[14px] font-semibold text-primary">
                        {formatCurrency(item.amount, item.currency)}
                      </p>
                    </div>
                    <p className="mt-1 text-[13px] text-[#6b7280]">
                      {item.count} transaction{item.count === 1 ? "" : "s"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-[13px] text-[#6b7280]">No payment purpose data yet.</p>
              )}
            </div>
          </AdminSectionCard>

          <AdminSectionCard
            title="Provider Mix"
            description="Current split across available payment rails."
          >
            <div className="space-y-3">
              {data.providerBreakdown.length > 0 ? (
                data.providerBreakdown.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[14px] border border-[#e5e7eb] px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-heading text-[16px] font-semibold text-[#111827]">
                        {item.label}
                      </p>
                      <p className="text-[14px] font-semibold text-[#111827]">
                        {formatCurrency(item.amount, item.currency)}
                      </p>
                    </div>
                    <p className="mt-1 text-[13px] text-[#6b7280]">
                      {item.count} transaction{item.count === 1 ? "" : "s"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-[13px] text-[#6b7280]">No provider activity yet.</p>
              )}
            </div>
          </AdminSectionCard>
        </div>
      </div>
    </div>
  );
}
