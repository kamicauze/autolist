import { BarChart3, CircleDollarSign, MessageSquareText, SquarePen, Users } from "lucide-react";
import {
  AdminPageHeader,
  AdminSectionCard,
  AdminStatCard,
} from "@/components/admin/admin-ui";
import type { AdminAnalyticsBreakdownItem, AdminAnalyticsData } from "@/lib/data/admin";

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function breakdownBarWidth(value: number, maxValue: number) {
  if (maxValue <= 0) return "0%";
  return `${Math.max((value / maxValue) * 100, value > 0 ? 8 : 0)}%`;
}

function BreakdownList({
  title,
  items,
  currency,
}: {
  title: string;
  items: AdminAnalyticsBreakdownItem[];
  currency?: string;
}) {
  const maxValue = Math.max(...items.map((item) => item.value), 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-[#2563eb]" />
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#475467]">
          {title}
        </p>
      </div>
      {items.length > 0 ? (
        items.map((item) => (
          <div key={item.label} className="space-y-2 rounded-[14px] border border-[#e5e7eb] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[13px] font-medium text-[#111827]">{item.label}</p>
              <div className="text-right">
                <p className="text-[13px] font-semibold text-[#111827]">
                  {item.value.toLocaleString("en-KE")}
                </p>
                {typeof item.amount === "number" && currency ? (
                  <p className="text-[11px] text-[#6b7280]">
                    {formatCurrency(item.amount, currency)}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#eef2ff]">
              <div
                className="h-full rounded-full bg-[#2563eb]"
                style={{ width: breakdownBarWidth(item.value, maxValue) }}
              />
            </div>
            {item.note ? <p className="text-[12px] text-[#6b7280]">{item.note}</p> : null}
          </div>
        ))
      ) : (
        <p className="text-[13px] text-[#6b7280]">No data available yet.</p>
      )}
    </div>
  );
}

export function AdminAnalyticsLive({ data }: { data: AdminAnalyticsData }) {
  const maxActivity = Math.max(
    ...data.activity.map((day) => day.users + day.listings + day.payments + day.tickets),
    1
  );

  return (
    <div className="space-y-8">
      <AdminPageHeader title="Platform Analytics" />

      <div className="grid gap-4 xl:grid-cols-4">
        <AdminStatCard
          label={data.metrics.newUsers30Days.label}
          value={data.metrics.newUsers30Days.value.toLocaleString("en-KE")}
          icon={<Users className="h-5 w-5" />}
          note={data.metrics.newUsers30Days.note}
        />
        <AdminStatCard
          label={data.metrics.newListings30Days.label}
          value={data.metrics.newListings30Days.value.toLocaleString("en-KE")}
          icon={<SquarePen className="h-5 w-5" />}
          note={data.metrics.newListings30Days.note}
        />
        <AdminStatCard
          label={data.metrics.paymentVolume30Days.label}
          value={formatCurrency(data.metrics.paymentVolume30Days.value, data.primaryCurrency)}
          icon={<CircleDollarSign className="h-5 w-5" />}
          note={data.metrics.paymentVolume30Days.note}
        />
        <AdminStatCard
          label={data.metrics.openTickets.label}
          value={data.metrics.openTickets.value.toLocaleString("en-KE")}
          icon={<MessageSquareText className="h-5 w-5" />}
          note={data.metrics.openTickets.note}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <AdminSectionCard
          title="Marketplace Activity Trend"
          description="New records created each day across users, listings, successful payments, and support tickets."
        >
          {data.activity.length > 0 ? (
            <>
              <div className="mb-5 flex flex-wrap gap-3 text-[12px] text-[#6b7280]">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#2563eb]" />
                  Users
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
                  Listings
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" />
                  Payments
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" />
                  Tickets
                </span>
              </div>

              <div className="h-[280px] rounded-[18px] bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_100%)] p-5">
                <div className="flex h-full items-end gap-3">
                  {data.activity.map((day) => {
                    const userHeight = (day.users / maxActivity) * 100;
                    const listingHeight = (day.listings / maxActivity) * 100;
                    const paymentHeight = (day.payments / maxActivity) * 100;
                    const ticketHeight = (day.tickets / maxActivity) * 100;
                    const total = day.users + day.listings + day.payments + day.tickets;

                    return (
                      <div key={day.key} className="flex flex-1 flex-col items-center gap-3">
                        <div className="flex h-full w-full flex-col justify-end overflow-hidden rounded-t-[12px] bg-white/70">
                          {total > 0 ? (
                            <>
                              <div style={{ height: `${ticketHeight}%` }} className="bg-[#ef4444]" />
                              <div style={{ height: `${paymentHeight}%` }} className="bg-[#f59e0b]" />
                              <div style={{ height: `${listingHeight}%` }} className="bg-[#22c55e]" />
                              <div style={{ height: `${userHeight}%` }} className="bg-[#2563eb]" />
                            </>
                          ) : (
                            <div className="h-1 rounded-t-[12px] bg-[#dbeafe]" />
                          )}
                        </div>
                        <div className="space-y-1 text-center">
                          <p className="text-[11px] font-medium text-[#475467]">{day.label}</p>
                          <p className="text-[10px] text-[#94a3b8]">{total} events</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <p className="text-[13px] text-[#6b7280]">No activity data available yet.</p>
          )}
        </AdminSectionCard>

        <AdminSectionCard
          title="Operational Mix"
          description="Current live distribution across the marketplace, support queue, and account base."
        >
          <div className="space-y-6">
            <BreakdownList title="Listings" items={data.listingMix} />
            <BreakdownList title="Users" items={data.userMix} />
            <BreakdownList title="Support" items={data.supportMix} />
          </div>
        </AdminSectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminSectionCard
          title="Payments By Purpose"
          description="How recorded payments are distributed by product intent."
        >
          <BreakdownList title="Purpose mix" items={data.paymentMix} currency={data.primaryCurrency} />
        </AdminSectionCard>

        <AdminSectionCard
          title="Payments By Provider"
          description="Current split across payment processors and rails."
        >
          <BreakdownList title="Provider mix" items={data.providerMix} currency={data.primaryCurrency} />
        </AdminSectionCard>
      </div>
    </div>
  );
}
