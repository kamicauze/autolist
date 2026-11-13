import { BarChart3, CircleDollarSign, Eye, Footprints, MessageSquareText, MousePointerClick, SquarePen, UserRound, Users } from "lucide-react";
import {
  AdminPageHeader,
  AdminSectionCard,
} from "@/components/admin/admin-ui";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { Icon3D } from "@/components/ui/icon-3d";
import type { AdminAnalyticsBreakdownItem, AdminAnalyticsData } from "@/lib/data/admin";
import type { SiteTrafficCounts, SiteTrafficData } from "@/lib/data/site-traffic";

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
        <Icon3D icon={BarChart3} variant="glyph" size="sm" />
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
                className="h-full rounded-full bg-primary"
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

const TRAFFIC_DESCRIPTION = "Public pages only. Staff accounts and bots are excluded, and days follow Nairobi time.";

function SiteTrafficSection({ traffic }: { traffic: SiteTrafficData }) {
  if (!traffic.available) {
    return (
      <AdminSectionCard title="Website Traffic" description={TRAFFIC_DESCRIPTION}>
        <p className="text-[13px] text-[#6b7280]">Website traffic is unavailable right now.</p>
      </AdminSectionCard>
    );
  }

  const period = (days: number) => traffic.totals.find((total) => total.days === days);
  const metric = (key: keyof SiteTrafficCounts) => ({
    value: (period(30)?.[key] ?? 0).toLocaleString("en-KE"),
    note: `Today ${(period(1)?.[key] ?? 0).toLocaleString("en-KE")} · 7 days ${(period(7)?.[key] ?? 0).toLocaleString("en-KE")}`,
  });
  const maxViews = Math.max(...traffic.daily.map((day) => day.pageViews), 1);
  const first = traffic.daily[0];
  const last = traffic.daily[traffic.daily.length - 1];
  const withVisitors = (items: SiteTrafficData["topPages"]) => items.map((item) => ({
    label: item.label,
    value: item.total,
    note: `${item.visitors.toLocaleString("en-KE")} visitors`,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Page views (30d)" icon={Eye} {...metric("pageViews")} />
        <AdminStatCard label="Unique visitors (30d)" icon={UserRound} {...metric("visitors")} />
        <AdminStatCard label="Visits (30d)" icon={Footprints} {...metric("visits")} />
        <AdminStatCard label="Tracked clicks (30d)" icon={MousePointerClick} {...metric("clicks")} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <AdminSectionCard title="Website Traffic" description={`Page views per day over the last 30 days. ${TRAFFIC_DESCRIPTION}`}>
          {first && last ? (
            <>
              <div
                role="img"
                aria-label={`Page views per day from ${first.label} to ${last.label}. Highest day: ${maxViews.toLocaleString("en-KE")} page views.`}
                className="h-[220px] rounded-[18px] bg-[linear-gradient(180deg,var(--brand-tint)_0%,#ffffff_100%)] p-4"
              >
                <div className="flex h-full items-end gap-1">
                  {traffic.daily.map((day) => (
                    <div
                      key={day.day}
                      title={`${day.label}: ${day.pageViews} page views, ${day.visitors} visitors, ${day.visits} visits, ${day.clicks} clicks`}
                      className="flex h-full min-w-0 flex-1 flex-col justify-end"
                    >
                      <div
                        className="rounded-t-[6px] bg-primary"
                        style={{ height: day.pageViews > 0 ? `${Math.max((day.pageViews / maxViews) * 100, 3)}%` : "0%" }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-2 flex justify-between text-[11px] font-medium text-[#475467]">
                <span>{first.label}</span>
                <span>{last.label}</span>
              </div>
            </>
          ) : (
            <p className="text-[13px] text-[#6b7280]">No website traffic recorded yet.</p>
          )}
        </AdminSectionCard>

        <AdminSectionCard title="Top Pages And Clicks" description="Most viewed public pages and most used tracked buttons and links in the last 30 days.">
          <div className="space-y-6">
            <BreakdownList title="Top pages" items={withVisitors(traffic.topPages)} />
            <BreakdownList title="Top clicks" items={withVisitors(traffic.topClicks)} />
          </div>
        </AdminSectionCard>
      </div>
    </div>
  );
}

export function AdminAnalyticsLive({ data, traffic }: { data: AdminAnalyticsData; traffic: SiteTrafficData }) {
  const maxActivity = Math.max(
    ...data.activity.map((day) => day.users + day.listings + day.payments + day.tickets),
    1
  );

  return (
    <div className="space-y-8">
      <AdminPageHeader title="Platform Analytics" />

      <SiteTrafficSection traffic={traffic} />

      <div className="grid gap-4 xl:grid-cols-4">
        <AdminStatCard
          label={data.metrics.newUsers30Days.label}
          value={data.metrics.newUsers30Days.value.toLocaleString("en-KE")}
          icon={Users}
          asset="community-users"
          note={data.metrics.newUsers30Days.note}
        />
        <AdminStatCard
          label={data.metrics.newListings30Days.label}
          value={data.metrics.newListings30Days.value.toLocaleString("en-KE")}
          icon={SquarePen}
          note={data.metrics.newListings30Days.note}
        />
        <AdminStatCard
          label={data.metrics.paymentVolume30Days.label}
          value={formatCurrency(data.metrics.paymentVolume30Days.value, data.primaryCurrency)}
          icon={CircleDollarSign}
          asset="money-value"
          note={data.metrics.paymentVolume30Days.note}
        />
        <AdminStatCard
          label={data.metrics.openTickets.label}
          value={data.metrics.openTickets.value.toLocaleString("en-KE")}
          icon={MessageSquareText}
          asset="chat-bubbles"
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
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
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

              <div className="h-[280px] rounded-[18px] bg-[linear-gradient(180deg,var(--brand-tint)_0%,#ffffff_100%)] p-5">
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
                              <div style={{ height: `${userHeight}%` }} className="bg-primary" />
                            </>
                          ) : (
                            <div className="h-1 rounded-t-[12px] bg-brand-tint-strong" />
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
