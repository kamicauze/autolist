"use client";

import * as React from "react";
import {
  ArrowUpRight,
  Bell,
  CheckCircle2,
  CircleDollarSign,
  Download,
  FileBadge2,
  FileText,
  Filter,
  LayoutTemplate,
  Mail,
  MessageSquareText,
  Plus,
  ReceiptText,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AdminDataTable,
  AdminPageHeader,
  AdminPagination,
  AdminSectionCard,
  AdminStatCard,
  AdminStatusPill,
  adminGhostButtonClass,
  adminInputClass,
  adminMetricIcons,
  adminPrimaryButtonClass,
  adminSelectClass,
  adminSurfaceClass,
  adminTextareaClass,
} from "./admin-ui";

type StatItem = {
  label: string;
  value: string;
  icon: React.ReactNode;
  note?: string;
};

type ModalScaffoldProps = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
};

type QueueItem = {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  tone: "blue" | "green" | "amber" | "red" | "slate";
  detail: string;
  meta: string[];
};

type AuditRow = {
  time: string;
  actor: string;
  action: string;
  target: string;
  status: "Success" | "Flagged" | "Warning";
};

const catalogRows = [
  {
    title: "2024 Toyota Land Cruiser ZX",
    seller: "Nairobi Prestige Motors",
    type: "Dealer",
    status: "Active",
    tone: "green" as const,
    price: "$92,000",
    city: "Nairobi",
    posted: "Today, 08:42",
  },
  {
    title: "2019 Mazda CX-5 Touring",
    seller: "Mercy Wanjiru",
    type: "Individual",
    status: "Pending",
    tone: "amber" as const,
    price: "$19,400",
    city: "Nakuru",
    posted: "Today, 07:15",
  },
  {
    title: "2021 Isuzu D-Max Double Cab",
    seller: "Apex Commercial",
    type: "Dealer",
    status: "Flagged",
    tone: "red" as const,
    price: "$33,500",
    city: "Mombasa",
    posted: "Yesterday",
  },
  {
    title: "2020 Subaru Forester Premium",
    seller: "Joseph Kimani",
    type: "Individual",
    status: "Sold",
    tone: "slate" as const,
    price: "$21,200",
    city: "Kisumu",
    posted: "Apr 6",
  },
];

const reportRows = [
  {
    type: "Fraud / scam attempt",
    subject: "Dealer profile impersonation",
    reporter: "Sharon Mwangi",
    against: "Auto Prime KE",
    status: "Open",
    tone: "red" as const,
    time: "12 min ago",
  },
  {
    type: "Misleading listing",
    subject: "Mileage discrepancy",
    reporter: "Paul Kibet",
    against: "2018 BMW X5",
    status: "Investigating",
    tone: "amber" as const,
    time: "1 hr ago",
  },
  {
    type: "Abusive chat",
    subject: "Buyer conversation issue",
    reporter: "Admin Bot",
    against: "Thread #CH-8841",
    status: "Resolved",
    tone: "green" as const,
    time: "Today",
  },
];

const paymentRows = [
  {
    reference: "PAY-10492",
    account: "Apex Commercial",
    purpose: "Featured listing bundle",
    amount: "$240.00",
    channel: "Card",
    status: "Successful",
    tone: "green" as const,
    date: "Apr 7, 2026",
  },
  {
    reference: "PAY-10473",
    account: "Mercy Wanjiru",
    purpose: "Boost package",
    amount: "$24.00",
    channel: "M-Pesa",
    status: "Pending",
    tone: "amber" as const,
    date: "Apr 7, 2026",
  },
  {
    reference: "PAY-10441",
    account: "Kingsway Motors",
    purpose: "Dealer subscription",
    amount: "$780.00",
    channel: "Bank transfer",
    status: "Refunded",
    tone: "slate" as const,
    date: "Apr 6, 2026",
  },
];

const offerRows = [
  {
    name: "April premium dealer bundle",
    audience: "Dealers",
    redemption: "46 claims",
    status: "Active",
    tone: "green" as const,
    validity: "Ends Apr 30",
  },
  {
    name: "First listing free boost",
    audience: "Individuals",
    redemption: "129 claims",
    status: "Scheduled",
    tone: "blue" as const,
    validity: "Starts Apr 12",
  },
  {
    name: "Weekend finance promo",
    audience: "All buyers",
    redemption: "Closed",
    status: "Draft",
    tone: "slate" as const,
    validity: "Not published",
  },
];

const roleRows = [
  {
    role: "Super Admin",
    description: "Full system oversight and approval authority.",
    members: "2 members",
    status: "Protected",
    tone: "amber" as const,
  },
  {
    role: "Moderator",
    description: "Handles listing review, reports, and KYC queues.",
    members: "8 members",
    status: "Active",
    tone: "green" as const,
  },
  {
    role: "Content Manager",
    description: "Owns banners, blogs, and CMS publishing.",
    members: "4 members",
    status: "Active",
    tone: "green" as const,
  },
  {
    role: "Finance Ops",
    description: "Access to payments, refunds, and invoices only.",
    members: "3 members",
    status: "Limited",
    tone: "blue" as const,
  },
];

const auditRows: AuditRow[] = [
  {
    time: "Apr 7, 2026 • 10:42",
    actor: "martin.admin@autolist.africa",
    action: "Approved listing",
    target: "2021 Mercedes-Benz GLE",
    status: "Success",
  },
  {
    time: "Apr 7, 2026 • 09:58",
    actor: "system@autolist.africa",
    action: "Triggered suspicious login challenge",
    target: "Account #USR-1092",
    status: "Flagged",
  },
  {
    time: "Apr 7, 2026 • 08:31",
    actor: "ops.admin@autolist.africa",
    action: "Updated payment refund rule",
    target: "Billing setting",
    status: "Warning",
  },
];

const inquiryItems: QueueItem[] = [
  {
    id: "INQ-4831",
    title: "2022 Toyota Prado VX",
    subtitle: "Buyer question about financing and mileage",
    status: "Needs reply",
    tone: "amber",
    detail:
      "Buyer asked whether the listed mileage is verifiable and whether the seller can share bank-financing options before viewing.",
    meta: ["Buyer: Cynthia N.", "Seller: City Motors", "Received 16 min ago"],
  },
  {
    id: "INQ-4810",
    title: "2019 Mazda CX-5",
    subtitle: "Request for extra underbody photos",
    status: "Waiting on seller",
    tone: "blue",
    detail:
      "The buyer wants additional underbody and interior photos before committing to a booking fee.",
    meta: ["Buyer: James T.", "Seller: Mercy W.", "Received 1 hr ago"],
  },
  {
    id: "INQ-4742",
    title: "2018 BMW X5",
    subtitle: "Lead dispute reopened",
    status: "Escalated",
    tone: "red",
    detail:
      "There is a disagreement on whether the seller responded within the expected SLA window after the original lead submission.",
    meta: ["Buyer: Admin Bot", "Seller: Prestige Auto", "Received today"],
  },
];

const insuranceItems: QueueItem[] = [
  {
    id: "INS-2204",
    title: "Motor comprehensive application",
    subtitle: "Pending underwriter confirmation",
    status: "Under review",
    tone: "amber",
    detail:
      "Applicant uploaded logbook and ID, but the underwriter requested a clearer valuation document and confirmation of the daily-use estimate.",
    meta: ["Applicant: David O.", "Vehicle: 2021 Subaru Forester", "Ksh 98,400 annual premium"],
  },
  {
    id: "INS-2197",
    title: "Third-party policy quote",
    subtitle: "Awaiting buyer approval",
    status: "Quoted",
    tone: "blue",
    detail:
      "Quote has been generated and sent to the buyer. The next step is approval and payment collection.",
    meta: ["Applicant: Rose A.", "Vehicle: 2015 Nissan Note", "Ksh 12,600 annual premium"],
  },
  {
    id: "INS-2178",
    title: "Dealer fleet renewal",
    subtitle: "Missing KRA PIN attachment",
    status: "Blocked",
    tone: "red",
    detail:
      "The renewal cannot be advanced until the missing KRA PIN certificate is uploaded and verified by operations.",
    meta: ["Applicant: Apex Commercial", "7 vehicles in batch", "Deadline Apr 10"],
  },
];

const bannerRows = [
  {
    name: "Homepage hero leaderboard",
    slot: "Home / Hero",
    status: "Live",
    tone: "green" as const,
    period: "Apr 1 - Apr 30",
    ctr: "3.8%",
  },
  {
    name: "Dealer week side rail",
    slot: "Search / Sidebar",
    status: "Scheduled",
    tone: "blue" as const,
    period: "Apr 12 - Apr 18",
    ctr: "Forecast 2.9%",
  },
  {
    name: "Finance partner strip",
    slot: "Vehicle detail",
    status: "Draft",
    tone: "slate" as const,
    period: "Unscheduled",
    ctr: "--",
  },
];

const blogRows = [
  {
    title: "7 things to check before buying a used SUV",
    author: "Editorial Desk",
    status: "Published",
    tone: "green" as const,
    updated: "Apr 7, 2026",
    channel: "Blog",
  },
  {
    title: "March price watch: Nairobi vs Mombasa listings",
    author: "Market Insights",
    status: "Scheduled",
    tone: "blue" as const,
    updated: "Apr 8, 2026",
    channel: "Insights",
  },
  {
    title: "Dealer onboarding checklist",
    author: "Ops Team",
    status: "Draft",
    tone: "slate" as const,
    updated: "Apr 5, 2026",
    channel: "Knowledge base",
  },
];

const cmsRows = [
  {
    page: "Homepage",
    owner: "Growth team",
    status: "Published",
    tone: "green" as const,
    updated: "5 min ago",
  },
  {
    page: "About us",
    owner: "Marketing",
    status: "Draft",
    tone: "slate" as const,
    updated: "Yesterday",
  },
  {
    page: "Help center",
    owner: "Support",
    status: "Review",
    tone: "amber" as const,
    updated: "Today",
  },
];

function StatGrid({ items }: { items: StatItem[] }) {
  return (
    <div className="grid gap-4 xl:grid-cols-4">
      {items.map((item) => (
        <AdminStatCard
          key={item.label}
          label={item.label}
          value={item.value}
          icon={item.icon}
          note={item.note}
        />
      ))}
    </div>
  );
}

function AdminPreviewNotice() {
  return (
    <div className="rounded-[14px] border border-[#bfdbfe] bg-[#eff6ff] px-4 py-4 text-[13px] leading-6 text-[#1e40af]">
      This section is visually implemented and ready for backend wiring. The current figures and rows
      are representative admin data, not yet live operational records.
    </div>
  );
}

function Toolbar({
  action,
  searchPlaceholder = "Search records...",
  filters = [],
}: {
  action?: React.ReactNode;
  searchPlaceholder?: string;
  filters?: string[];
}) {
  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="grid gap-3 md:grid-cols-[320px_repeat(2,160px)]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
          <input className={cn(adminInputClass, "pl-9")} placeholder={searchPlaceholder} />
        </div>
        {filters.map((label) => (
          <select key={label} className={adminSelectClass} defaultValue={label}>
            <option>{label}</option>
            <option>All</option>
            <option>Active</option>
            <option>Pending</option>
            <option>Draft</option>
          </select>
        ))}
      </div>
      {action}
    </div>
  );
}

function ModalScaffold({ open, title, children, onClose }: ModalScaffoldProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/45 px-4">
      <div className={cn(adminSurfaceClass, "w-full max-w-[520px] p-6")}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-[28px] font-semibold text-[#111827]">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className="text-[#9ca3af] hover:text-[#111827]">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function QueueDetailCard({ item }: { item: QueueItem }) {
  return (
    <AdminSectionCard title={item.title} description={item.subtitle}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <AdminStatusPill label={item.status} tone={item.tone} />
          <span className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#94a3b8]">
            {item.id}
          </span>
        </div>
        <p className="text-[14px] leading-6 text-[#4b5563]">{item.detail}</p>
        <div className="grid gap-3 md:grid-cols-3">
          {item.meta.map((entry) => (
            <div key={entry} className="rounded-[12px] border border-[#e5e7eb] bg-[#f8fafc] px-4 py-3 text-[13px] text-[#374151]">
              {entry}
            </div>
          ))}
        </div>
        <div className="rounded-[12px] border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-4 py-4 text-[13px] text-[#64748b]">
          Operator note space: add internal remarks, confirm documents, and move the case to the next state from this panel.
        </div>
      </div>
    </AdminSectionCard>
  );
}

function QueueWorkspace({
  title,
  description,
  stats,
  items,
}: {
  title: string;
  description: string;
  stats: StatItem[];
  items: QueueItem[];
}) {
  const [selectedId, setSelectedId] = React.useState(items[0]?.id ?? "");
  const selected = items.find((item) => item.id === selectedId) ?? items[0];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={title}
        action={
          <button type="button" className={adminGhostButtonClass}>
            <Download className="h-4 w-4" />
            Export Queue
          </button>
        }
      />

      <p className="-mt-5 max-w-3xl text-[15px] leading-7 text-[#6b7280]">{description}</p>
      <StatGrid items={stats} />

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <AdminSectionCard title="Open Cases" description="Select a record to inspect full details.">
          <div className="space-y-3">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={cn(
                  "w-full rounded-[14px] border px-4 py-4 text-left transition",
                  selected?.id === item.id
                    ? "border-[#2563eb] bg-[#eff6ff]"
                    : "border-[#e5e7eb] bg-white hover:border-[#bfdbfe]"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-heading text-[16px] font-semibold text-[#111827]">{item.id}</p>
                    <p className="mt-1 text-[14px] font-medium text-[#374151]">{item.title}</p>
                  </div>
                  <AdminStatusPill label={item.status} tone={item.tone} />
                </div>
                <p className="mt-2 text-[13px] text-[#6b7280]">{item.subtitle}</p>
              </button>
            ))}
          </div>
        </AdminSectionCard>

        {selected ? <QueueDetailCard item={selected} /> : null}
      </div>
    </div>
  );
}

export function AdminDashboardPage({
  pendingListings,
  pendingDealers,
}: {
  pendingListings: number;
  pendingDealers: number;
}) {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Admin Dashboard"
        action={
          <button type="button" className={adminPrimaryButtonClass}>
            <Sparkles className="h-4 w-4" />
            Generate Weekly Summary
          </button>
        }
      />

      <StatGrid
        items={[
          { label: "Pending Listings", value: String(pendingListings), icon: adminMetricIcons.pending },
          { label: "KYC Queue", value: String(pendingDealers), icon: adminMetricIcons.kyc },
          { label: "Unread Reports", value: "07", icon: adminMetricIcons.warning, note: "Needs action" },
          { label: "Today Revenue", value: "$3,420", icon: adminMetricIcons.payments, note: "+18%" },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
        <AdminSectionCard
          title="Marketplace Overview"
          description="Snapshot of the platform performance and moderation pressure."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["Live listings", "14,231", "+84 today"],
              ["New signups", "524", "+11% this week"],
              ["New inquiries", "1,824", "142 awaiting seller reply"],
              ["Conversion rate", "4.2%", "Target 5.0%"],
            ].map(([label, value, note]) => (
              <div key={label} className="rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] p-4">
                <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#94a3b8]">{label}</p>
                <p className="mt-2 font-heading text-[28px] font-semibold text-[#111827]">{value}</p>
                <p className="mt-1 text-[13px] text-[#6b7280]">{note}</p>
              </div>
            ))}
          </div>
        </AdminSectionCard>

        <AdminSectionCard title="Priority Queues" description="Operational areas currently demanding attention.">
          <div className="space-y-3">
            {[
              ["Listing Review", `${pendingListings} waiting`, "Proceed to moderation"],
              ["KYC Verification", `${pendingDealers} dealer records`, "Documents need operator check"],
              ["Car Inquiries", "23 unresolved", "Seller SLA at risk"],
              ["Insurance Requests", "3 blocked", "Missing attachments"],
            ].map(([label, value, note]) => (
              <div key={label} className="rounded-[14px] border border-[#e5e7eb] px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-heading text-[16px] font-semibold text-[#111827]">{label}</p>
                  <ArrowUpRight className="h-4 w-4 text-[#2563eb]" />
                </div>
                <p className="mt-1 text-[14px] font-medium text-[#2563eb]">{value}</p>
                <p className="mt-1 text-[13px] text-[#6b7280]">{note}</p>
              </div>
            ))}
          </div>
        </AdminSectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
        <AdminSectionCard title="Recent Admin Activity" description="Latest operational events across the console.">
          <div className="space-y-4">
            {auditRows.map((row) => (
              <div key={`${row.time}-${row.action}`} className="flex items-start justify-between gap-4 border-b border-[#f1f5f9] pb-4 last:border-b-0 last:pb-0">
                <div>
                  <p className="text-[14px] font-medium text-[#111827]">{row.action}</p>
                  <p className="mt-1 text-[13px] text-[#6b7280]">{row.actor}</p>
                  <p className="text-[12px] text-[#94a3b8]">{row.target}</p>
                </div>
                <div className="text-right">
                  <AdminStatusPill
                    label={row.status}
                    tone={row.status === "Success" ? "green" : row.status === "Flagged" ? "red" : "amber"}
                  />
                  <p className="mt-2 text-[12px] text-[#94a3b8]">{row.time}</p>
                </div>
              </div>
            ))}
          </div>
        </AdminSectionCard>

        <AdminSectionCard title="System Alerts" description="Config and workload alerts across the stack.">
          <div className="space-y-4">
            {[
              ["Cloud storage usage", "76% of monthly forecast", "amber"],
              ["Image review worker", "Healthy", "green"],
              ["AI fallback usage", "Higher than normal this morning", "blue"],
              ["Refund queue", "2 cases need signoff", "red"],
            ].map(([label, value, tone]) => (
              <div key={label} className="flex items-center justify-between rounded-[14px] border border-[#e5e7eb] px-4 py-4">
                <div>
                  <p className="text-[14px] font-medium text-[#111827]">{label}</p>
                  <p className="text-[13px] text-[#6b7280]">{value}</p>
                </div>
                <AdminStatusPill
                  label={tone === "green" ? "Healthy" : tone === "amber" ? "Watch" : tone === "blue" ? "Trend" : "Urgent"}
                  tone={tone as "blue" | "green" | "amber" | "red"}
                />
              </div>
            ))}
          </div>
        </AdminSectionCard>
      </div>
    </div>
  );
}

export function AdminAnalyticsSurface() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Platform Analytics"
        action={
          <button type="button" className={adminGhostButtonClass}>
            <Download className="h-4 w-4" />
            Download Report
          </button>
        }
      />
      <StatGrid
        items={[
          { label: "Sessions", value: "84.3K", icon: adminMetricIcons.analytics, note: "+12%" },
          { label: "Lead Conversion", value: "4.2%", icon: adminMetricIcons.inquiries, note: "+0.6%" },
          { label: "Paid Upgrades", value: "318", icon: adminMetricIcons.payments, note: "+28%" },
          { label: "Bounce Rate", value: "31%", icon: adminMetricIcons.users, note: "-2%" },
        ]}
      />
      <AdminPreviewNotice />

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <AdminSectionCard title="Traffic & Revenue Trend" description="Last 30 days of marketplace activity.">
          <div className="h-[280px] rounded-[18px] bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_100%)] p-5">
            <div className="flex h-full items-end gap-3">
              {[46, 52, 41, 64, 72, 58, 76, 84, 62, 68, 79, 88].map((value, index) => (
                <div key={index} className="flex-1">
                  <div
                    className="rounded-t-[10px] bg-[#2563eb]/90"
                    style={{ height: `${value}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </AdminSectionCard>
        <AdminSectionCard title="Top Performing Channels" description="Highest value acquisition and monetization channels.">
          <div className="space-y-3">
            {[
              ["Organic search", "$9,240", "42% of assisted leads"],
              ["WhatsApp shares", "$5,180", "21% of assisted leads"],
              ["Dealer boosts", "$3,740", "Highest upsell rate"],
              ["Display banners", "$1,920", "CTR improving"],
            ].map(([label, value, note]) => (
              <div key={label} className="rounded-[14px] border border-[#e5e7eb] px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-heading text-[16px] font-semibold text-[#111827]">{label}</p>
                  <p className="text-[15px] font-semibold text-[#2563eb]">{value}</p>
                </div>
                <p className="mt-1 text-[13px] text-[#6b7280]">{note}</p>
              </div>
            ))}
          </div>
        </AdminSectionCard>
      </div>
    </div>
  );
}

export function AdminListingsOverviewPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="All Listings"
        action={
          <button type="button" className={adminPrimaryButtonClass}>
            <Filter className="h-4 w-4" />
            Save Current View
          </button>
        }
      />
      <StatGrid
        items={[
          { label: "Live Listings", value: "14,231", icon: adminMetricIcons.listings },
          { label: "Pending Review", value: "42", icon: adminMetricIcons.pending },
          { label: "Flagged", value: "18", icon: adminMetricIcons.warning },
          { label: "Sold This Week", value: "238", icon: adminMetricIcons.cars, note: "+9%" },
        ]}
      />
      <AdminPreviewNotice />
      <Toolbar
        searchPlaceholder="Search listing title, VIN, or seller..."
        filters={["All Status", "All Seller Types"]}
        action={
          <button type="button" className={adminGhostButtonClass}>
            <Download className="h-4 w-4" />
            Export
          </button>
        }
      />
      <AdminDataTable
        columns={["Listing", "Seller", "Type", "Status", "Price", "Location", "Posted"]}
        footer={<AdminPagination label="Showing 1 to 4 of 14,231 listings" />}
      >
        {catalogRows.map((row) => (
          <tr key={row.title} className="border-b border-[#f1f5f9] last:border-b-0">
            <td className="px-6 py-4">
              <p className="text-[14px] font-medium text-[#111827]">{row.title}</p>
            </td>
            <td className="px-6 py-4 text-[13px] text-[#374151]">{row.seller}</td>
            <td className="px-6 py-4"><AdminStatusPill label={row.type} tone={row.type === "Dealer" ? "blue" : "slate"} /></td>
            <td className="px-6 py-4"><AdminStatusPill label={row.status} tone={row.tone} /></td>
            <td className="px-6 py-4 text-[13px] text-[#374151]">{row.price}</td>
            <td className="px-6 py-4 text-[13px] text-[#6b7280]">{row.city}</td>
            <td className="px-6 py-4 text-[13px] text-[#6b7280]">{row.posted}</td>
          </tr>
        ))}
      </AdminDataTable>
    </div>
  );
}

export function AdminReportsPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader title="Reports & Safety" />
      <StatGrid
        items={[
          { label: "Open Reports", value: "07", icon: adminMetricIcons.warning },
          { label: "High Priority", value: "02", icon: adminMetricIcons.pending },
          { label: "Resolved Today", value: "14", icon: <CheckCircle2 className="h-5 w-5" /> },
          { label: "Repeat Offenders", value: "03", icon: <ShieldCheck className="h-5 w-5" /> },
        ]}
      />
      <AdminPreviewNotice />
      <Toolbar searchPlaceholder="Search reports..." filters={["All Types", "All Status"]} />
      <AdminDataTable
        columns={["Type", "Subject", "Reporter", "Against", "Status", "Time"]}
        footer={<AdminPagination label="Showing 1 to 3 of 74 reports" />}
      >
        {reportRows.map((row) => (
          <tr key={row.subject} className="border-b border-[#f1f5f9] last:border-b-0">
            <td className="px-6 py-4 text-[13px] font-medium text-[#111827]">{row.type}</td>
            <td className="px-6 py-4 text-[13px] text-[#374151]">{row.subject}</td>
            <td className="px-6 py-4 text-[13px] text-[#6b7280]">{row.reporter}</td>
            <td className="px-6 py-4 text-[13px] text-[#6b7280]">{row.against}</td>
            <td className="px-6 py-4"><AdminStatusPill label={row.status} tone={row.tone} /></td>
            <td className="px-6 py-4 text-[13px] text-[#94a3b8]">{row.time}</td>
          </tr>
        ))}
      </AdminDataTable>
    </div>
  );
}

export function AdminInsuranceRequestsPage() {
  return (
    <div className="space-y-8">
      <AdminPreviewNotice />
      <QueueWorkspace
        title="Insurance Requests"
        description="Track policy applications, missing documents, and insurer handoffs from one queue."
        stats={[
          { label: "Open Requests", value: "23", icon: <ReceiptText className="h-5 w-5" /> },
          { label: "Quoted Today", value: "11", icon: <CircleDollarSign className="h-5 w-5" /> },
          { label: "Blocked Cases", value: "03", icon: adminMetricIcons.warning },
          { label: "Policies Bound", value: "07", icon: <ShieldCheck className="h-5 w-5" /> },
        ]}
        items={insuranceItems}
      />
    </div>
  );
}

export function AdminCarInquiriesPage() {
  return (
    <div className="space-y-8">
      <AdminPreviewNotice />
      <QueueWorkspace
        title="Car Inquiries"
        description="Monitor buyer-to-seller conversations that need intervention, follow-up, or SLA protection."
        stats={[
          { label: "Open Threads", value: "23", icon: <MessageSquareText className="h-5 w-5" /> },
          { label: "Escalated", value: "05", icon: adminMetricIcons.warning },
          { label: "Seller SLA Risk", value: "09", icon: <Bell className="h-5 w-5" /> },
          { label: "Resolved Today", value: "18", icon: <CheckCircle2 className="h-5 w-5" /> },
        ]}
        items={inquiryItems}
      />
    </div>
  );
}

export function AdminPaymentsPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Payments"
        action={
          <button type="button" className={adminGhostButtonClass}>
            <Download className="h-4 w-4" />
            Export Ledger
          </button>
        }
      />
      <StatGrid
        items={[
          { label: "Gross Volume", value: "$18,240", icon: adminMetricIcons.payments, note: "+14%" },
          { label: "Pending Payouts", value: "$2,410", icon: <ReceiptText className="h-5 w-5" /> },
          { label: "Refund Queue", value: "02", icon: adminMetricIcons.warning },
          { label: "Dealer Plans", value: "84", icon: adminMetricIcons.users },
        ]}
      />
      <AdminPreviewNotice />
      <Toolbar searchPlaceholder="Search reference or account..." filters={["All Channels", "All Status"]} />
      <AdminDataTable
        columns={["Reference", "Account", "Purpose", "Amount", "Channel", "Status", "Date"]}
        footer={<AdminPagination label="Showing 1 to 3 of 1,824 transactions" />}
      >
        {paymentRows.map((row) => (
          <tr key={row.reference} className="border-b border-[#f1f5f9] last:border-b-0">
            <td className="px-6 py-4 text-[13px] font-medium text-[#111827]">{row.reference}</td>
            <td className="px-6 py-4 text-[13px] text-[#374151]">{row.account}</td>
            <td className="px-6 py-4 text-[13px] text-[#6b7280]">{row.purpose}</td>
            <td className="px-6 py-4 text-[13px] font-medium text-[#111827]">{row.amount}</td>
            <td className="px-6 py-4 text-[13px] text-[#6b7280]">{row.channel}</td>
            <td className="px-6 py-4"><AdminStatusPill label={row.status} tone={row.tone} /></td>
            <td className="px-6 py-4 text-[13px] text-[#94a3b8]">{row.date}</td>
          </tr>
        ))}
      </AdminDataTable>
    </div>
  );
}

export function AdminAdsBannersPage() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Ads & Banners"
        action={
          <button type="button" onClick={() => setOpen(true)} className={adminPrimaryButtonClass}>
            <Plus className="h-4 w-4" />
            Add Banner
          </button>
        }
      />
      <StatGrid
        items={[
          { label: "Live Campaigns", value: "12", icon: <FileBadge2 className="h-5 w-5" /> },
          { label: "Scheduled", value: "04", icon: <Bell className="h-5 w-5" /> },
          { label: "Avg CTR", value: "3.8%", icon: adminMetricIcons.analytics },
          { label: "Expiring Soon", value: "02", icon: adminMetricIcons.warning },
        ]}
      />
      <AdminPreviewNotice />
      <AdminDataTable columns={["Banner", "Slot", "Status", "Run Period", "CTR"]}>
        {bannerRows.map((row) => (
          <tr key={row.name} className="border-b border-[#f1f5f9] last:border-b-0">
            <td className="px-6 py-4 text-[13px] font-medium text-[#111827]">{row.name}</td>
            <td className="px-6 py-4 text-[13px] text-[#6b7280]">{row.slot}</td>
            <td className="px-6 py-4"><AdminStatusPill label={row.status} tone={row.tone} /></td>
            <td className="px-6 py-4 text-[13px] text-[#6b7280]">{row.period}</td>
            <td className="px-6 py-4 text-[13px] text-[#111827]">{row.ctr}</td>
          </tr>
        ))}
      </AdminDataTable>

      <ModalScaffold open={open} onClose={() => setOpen(false)} title="Create Banner Campaign">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-[#374151]">Campaign name</label>
            <input className={adminInputClass} placeholder="Homepage hero leaderboard" />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-[#374151]">Placement slot</label>
            <select className={adminSelectClass}>
              <option>Home / Hero</option>
              <option>Search / Sidebar</option>
              <option>Vehicle detail</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-[#374151]">Target link</label>
            <input className={adminInputClass} placeholder="https://..." />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => setOpen(false)} className={adminGhostButtonClass}>Cancel</button>
            <button type="button" className={adminPrimaryButtonClass}>Save Campaign</button>
          </div>
        </div>
      </ModalScaffold>
    </div>
  );
}

export function AdminBlogsContentPage() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Blogs & Content"
        action={
          <button type="button" onClick={() => setOpen(true)} className={adminPrimaryButtonClass}>
            <Plus className="h-4 w-4" />
            New Article
          </button>
        }
      />
      <StatGrid
        items={[
          { label: "Published Posts", value: "184", icon: <FileText className="h-5 w-5" /> },
          { label: "Scheduled", value: "07", icon: <Bell className="h-5 w-5" /> },
          { label: "Drafts", value: "21", icon: <LayoutTemplate className="h-5 w-5" /> },
          { label: "Newsletter Slots", value: "03", icon: <Mail className="h-5 w-5" /> },
        ]}
      />
      <AdminPreviewNotice />
      <AdminDataTable columns={["Title", "Author", "Channel", "Status", "Updated"]}>
        {blogRows.map((row) => (
          <tr key={row.title} className="border-b border-[#f1f5f9] last:border-b-0">
            <td className="px-6 py-4 text-[13px] font-medium text-[#111827]">{row.title}</td>
            <td className="px-6 py-4 text-[13px] text-[#6b7280]">{row.author}</td>
            <td className="px-6 py-4 text-[13px] text-[#6b7280]">{row.channel}</td>
            <td className="px-6 py-4"><AdminStatusPill label={row.status} tone={row.tone} /></td>
            <td className="px-6 py-4 text-[13px] text-[#94a3b8]">{row.updated}</td>
          </tr>
        ))}
      </AdminDataTable>

      <ModalScaffold open={open} onClose={() => setOpen(false)} title="Create New Article">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-[#374151]">Title</label>
            <input className={adminInputClass} placeholder="Article headline" />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-[#374151]">Channel</label>
            <select className={adminSelectClass}>
              <option>Blog</option>
              <option>Insights</option>
              <option>Knowledge base</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-[#374151]">Summary</label>
            <textarea className={adminTextareaClass} placeholder="Short article summary" />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => setOpen(false)} className={adminGhostButtonClass}>Cancel</button>
            <button type="button" className={adminPrimaryButtonClass}>Create Draft</button>
          </div>
        </div>
      </ModalScaffold>
    </div>
  );
}

export function AdminSpecialOffersPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Special Offers"
        action={
          <button type="button" className={adminPrimaryButtonClass}>
            <Plus className="h-4 w-4" />
            Create Offer
          </button>
        }
      />
      <AdminPreviewNotice />
      <div className="grid gap-4 xl:grid-cols-3">
        {offerRows.map((offer) => (
          <AdminSectionCard
            key={offer.name}
            title={offer.name}
            description={offer.validity}
            className="p-5"
            action={<AdminStatusPill label={offer.status} tone={offer.tone} />}
          >
            <div className="space-y-3">
              <div className="rounded-[12px] bg-[#f8fafc] px-4 py-3 text-[13px] text-[#374151]">
                Target audience: <span className="font-medium text-[#111827]">{offer.audience}</span>
              </div>
              <div className="rounded-[12px] bg-[#f8fafc] px-4 py-3 text-[13px] text-[#374151]">
                Redemption: <span className="font-medium text-[#111827]">{offer.redemption}</span>
              </div>
            </div>
          </AdminSectionCard>
        ))}
      </div>
    </div>
  );
}

export function AdminCmsPage() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="CMS"
        action={
          <button type="button" onClick={() => setOpen(true)} className={adminPrimaryButtonClass}>
            <Plus className="h-4 w-4" />
            Add Page
          </button>
        }
      />
      <AdminPreviewNotice />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.9fr]">
        <AdminSectionCard title="Managed Pages" description="Public site pages and their publishing state.">
          <AdminDataTable columns={["Page", "Owner", "Status", "Updated"]}>
            {cmsRows.map((row) => (
              <tr key={row.page} className="border-b border-[#f1f5f9] last:border-b-0">
                <td className="px-6 py-4 text-[13px] font-medium text-[#111827]">{row.page}</td>
                <td className="px-6 py-4 text-[13px] text-[#6b7280]">{row.owner}</td>
                <td className="px-6 py-4"><AdminStatusPill label={row.status} tone={row.tone} /></td>
                <td className="px-6 py-4 text-[13px] text-[#94a3b8]">{row.updated}</td>
              </tr>
            ))}
          </AdminDataTable>
        </AdminSectionCard>
        <AdminSectionCard title="Reusable Blocks" description="Frequently reused homepage and landing-page modules.">
          <div className="space-y-3">
            {["Hero CTA", "Dealer spotlight carousel", "Finance calculator teaser", "Newsletter callout"].map((block) => (
              <div key={block} className="rounded-[14px] border border-[#e5e7eb] px-4 py-4">
                <p className="font-heading text-[16px] font-semibold text-[#111827]">{block}</p>
                <p className="mt-1 text-[13px] text-[#6b7280]">Editable content block ready for drag-and-drop placement.</p>
              </div>
            ))}
          </div>
        </AdminSectionCard>
      </div>

      <ModalScaffold open={open} onClose={() => setOpen(false)} title="Create CMS Page">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-[#374151]">Page title</label>
            <input className={adminInputClass} placeholder="About us" />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-[#374151]">Slug</label>
            <input className={adminInputClass} placeholder="/about-us" />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => setOpen(false)} className={adminGhostButtonClass}>Cancel</button>
            <button type="button" className={adminPrimaryButtonClass}>Create Page</button>
          </div>
        </div>
      </ModalScaffold>
    </div>
  );
}

export function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader title="Settings" />
      <AdminPreviewNotice />
      <div className="grid gap-6 xl:grid-cols-2">
        <AdminSectionCard title="Platform Settings" description="Core marketplace behavior and moderation defaults.">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#374151]">Default listing review SLA</label>
              <select className={adminSelectClass}>
                <option>24 hours</option>
                <option>12 hours</option>
                <option>48 hours</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#374151]">Support contact email</label>
              <input className={adminInputClass} defaultValue="support@autolist.africa" />
            </div>
            <label className="flex items-center gap-3 text-[13px] text-[#374151]">
              <input type="checkbox" className="h-4 w-4 rounded border-[#d1d5db]" defaultChecked />
              Enable AI fallback for smart search
            </label>
            <label className="flex items-center gap-3 text-[13px] text-[#374151]">
              <input type="checkbox" className="h-4 w-4 rounded border-[#d1d5db]" defaultChecked />
              Require manual approval for all dealer accounts
            </label>
          </div>
        </AdminSectionCard>

        <AdminSectionCard title="Notifications" description="Where the admin team receives critical system updates.">
          <div className="space-y-4">
            <div className="rounded-[14px] border border-[#e5e7eb] px-4 py-4">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-[#2563eb]" />
                <div>
                  <p className="text-[14px] font-medium text-[#111827]">Operational alerts</p>
                  <p className="text-[13px] text-[#6b7280]">Routing to Slack and email</p>
                </div>
              </div>
            </div>
            <div className="rounded-[14px] border border-[#e5e7eb] px-4 py-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[#2563eb]" />
                <div>
                  <p className="text-[14px] font-medium text-[#111827]">Payment failures</p>
                  <p className="text-[13px] text-[#6b7280]">Escalate to finance operations instantly</p>
                </div>
              </div>
            </div>
            <button type="button" className={adminPrimaryButtonClass}>
              <Settings2 className="h-4 w-4" />
              Save Settings
            </button>
          </div>
        </AdminSectionCard>
      </div>
    </div>
  );
}

export function AdminRolesPermissionsPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Roles & Permissions"
        action={
          <button type="button" className={adminPrimaryButtonClass}>
            <Plus className="h-4 w-4" />
            Create Role
          </button>
        }
      />
      <AdminPreviewNotice />
      <div className="grid gap-4 xl:grid-cols-2">
        {roleRows.map((row) => (
          <AdminSectionCard
            key={row.role}
            title={row.role}
            description={row.description}
            className="p-5"
            action={<AdminStatusPill label={row.status} tone={row.tone} />}
          >
            <p className="text-[13px] text-[#6b7280]">{row.members}</p>
          </AdminSectionCard>
        ))}
      </div>
    </div>
  );
}

export function AdminAuditLogsSurface() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Audit Logs"
        action={
          <button type="button" className={adminGhostButtonClass}>
            <Download className="h-4 w-4" />
            Export Logs
          </button>
        }
      />
      <AdminPreviewNotice />
      <Toolbar searchPlaceholder="Search actor, action, or target..." filters={["All Actions", "All Status"]} />
      <AdminDataTable
        columns={["Time", "Actor", "Action", "Target", "Status"]}
        footer={<AdminPagination label="Showing 1 to 3 of 18,402 log entries" />}
      >
        {auditRows.map((row) => (
          <tr key={`${row.time}-${row.target}`} className="border-b border-[#f1f5f9] last:border-b-0">
            <td className="px-6 py-4 text-[13px] text-[#94a3b8]">{row.time}</td>
            <td className="px-6 py-4 text-[13px] font-medium text-[#111827]">{row.actor}</td>
            <td className="px-6 py-4 text-[13px] text-[#374151]">{row.action}</td>
            <td className="px-6 py-4 text-[13px] text-[#6b7280]">{row.target}</td>
            <td className="px-6 py-4">
              <AdminStatusPill
                label={row.status}
                tone={row.status === "Success" ? "green" : row.status === "Flagged" ? "red" : "amber"}
              />
            </td>
          </tr>
        ))}
      </AdminDataTable>
    </div>
  );
}
