import Link from "next/link";
import {
  BadgeCheck,
  CalendarDays,
  CarFront,
  Clock3,
  CreditCard,
  FileText,
  Heart,
  Mail,
  MessageSquareText,
  ReceiptText,
  Star,
  Store,
  Tag,
  UserRound,
} from "lucide-react";
import {
  AdminDataTable,
  AdminPageHeader,
  AdminSectionCard,
  AdminStatusPill,
  adminGhostButtonClass,
} from "@/components/admin/admin-ui";
import {
  buildAdminUserActivityModules,
  groupAdminUserActivityTimelineByDay,
  type AdminUserActivityItem,
  type AdminUserActivityModule,
} from "@/lib/data/admin-user-activity";
import type { AdminUserActivityData } from "@/lib/data/admin-user-detail";
import { AdminUserDeactivateControl } from "@/components/admin/admin-user-deactivate-control";

function formatDate(value: string | null | undefined) {
  if (!value) return "Not set";
  return new Date(value).toLocaleString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTimelineDay(value: string) {
  return new Date(value).toLocaleDateString("en-KE", {
    timeZone: "Africa/Nairobi",
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTimelineTime(value: string) {
  return new Date(value).toLocaleTimeString("en-KE", {
    timeZone: "Africa/Nairobi",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: currency || "KES",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

function formatEnum(value: string) {
  return value.replace(/_/g, " ");
}

function compactListingTitle(listing: { year: number | null; make: string; model: string } | null | undefined) {
  if (!listing) return "Unknown listing";
  return [listing.year, listing.make, listing.model].filter(Boolean).join(" ");
}

function firstRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] || null : value || null;
}

function statusTone(status: string) {
  if (["active", "APPROVED", "succeeded", "resolved", "closed", "accepted"].includes(status)) {
    return "green" as const;
  }
  if (["pending", "PENDING", "triaged", "waiting_on_seller", "waiting_on_buyer", "countered"].includes(status)) {
    return "amber" as const;
  }
  if (["rejected", "REJECTED", "failed", "refunded", "withdrawn", "expired"].includes(status)) {
    return "red" as const;
  }
  return "slate" as const;
}

function latestActivityDate(data: AdminUserActivityData) {
  return data.timeline[0]?.occurredAt || data.profile?.updated_at || data.profile?.created_at || null;
}

function summaryValue(data: AdminUserActivityData, label: string) {
  return data.summary.find((item) => item.label === label)?.value ?? 0;
}

function userInitials(name: string | null | undefined, email: string | null | undefined) {
  const source = name || email || "User";
  const words = source
    .replace(/@.*/, "")
    .split(/\s+/)
    .filter(Boolean);

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

function ActivityIcon({ source }: { source: string }) {
  const className = "h-4 w-4";
  if (source === "listing") return <CarFront className={className} />;
  if (source.includes("enquiry")) return <Mail className={className} />;
  if (source === "conversation" || source === "message") return <MessageSquareText className={className} />;
  if (source === "support_ticket") return <FileText className={className} />;
  if (source === "payment") return <CreditCard className={className} />;
  if (source === "favorite") return <Heart className={className} />;
  if (source === "review") return <Star className={className} />;
  if (source === "offer") return <Tag className={className} />;
  if (source === "dealer") return <Store className={className} />;
  return <Clock3 className={className} />;
}

function EmptyRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-8 text-center text-[13px] text-[#6b7280]">
        {label}
      </td>
    </tr>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="font-heading text-[16px] font-semibold text-[#111827]">{children}</h3>;
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-3 border-t border-[#eef2f7] py-3 text-[13px]">
      <dt className="text-[#64748b]">{label}</dt>
      <dd className="min-w-0 font-medium text-[#111827]">{value}</dd>
    </div>
  );
}

function SummaryMetric({
  label,
  value,
  note,
  icon,
}: {
  label: string;
  value: number;
  note: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="border-t border-[#e5e7eb] py-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#f8fafc] text-primary">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-[#64748b]">{label}</p>
          <div className="mt-1 flex flex-wrap items-baseline gap-2">
            <span className="font-mono text-[22px] font-semibold text-[#0f172a]">{value.toLocaleString("en-KE")}</span>
            <span className="text-[12px] text-[#64748b]">{note}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleIcon({ moduleKey }: { moduleKey: AdminUserActivityModule["key"] }) {
  const className = "h-4 w-4";
  if (moduleKey === "timeline") return <Clock3 className={className} />;
  if (moduleKey === "listings") return <CarFront className={className} />;
  if (moduleKey === "dealer") return <Store className={className} />;
  if (moduleKey === "enquiries") return <Mail className={className} />;
  if (moduleKey === "messages") return <MessageSquareText className={className} />;
  if (moduleKey === "commerce") return <ReceiptText className={className} />;
  if (moduleKey === "engagement") return <Heart className={className} />;
  return <BadgeCheck className={className} />;
}

function ModuleLauncher({ modules }: { modules: AdminUserActivityModule[] }) {
  return (
    <section
      aria-labelledby="history-index-title"
      className="overflow-hidden rounded-[16px] border border-[#dbe3ef] bg-[#dbe3ef]"
    >
      <div className="flex items-center justify-between gap-4 bg-white px-4 py-3 md:px-5">
        <div>
          <p
            id="history-index-title"
            className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#64748b]"
          >
            History index
          </p>
          <p className="mt-0.5 text-[12px] text-[#64748b]">
            Jump directly to a record family.
          </p>
        </div>
        <span className="font-mono text-[12px] text-[#64748b]">{modules.length} sections</span>
      </div>

      <nav
        aria-label="User history sections"
        className="grid grid-cols-2 gap-px sm:grid-cols-4 xl:grid-cols-8"
      >
        {modules.map((module) => (
          <Link
            key={module.key}
            href={module.href}
            title={module.description}
            className="group min-h-[82px] bg-[#fbfdff] px-3 py-3 transition duration-150 hover:bg-white active:translate-y-[1px] md:px-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#64748b] transition group-hover:text-primary">
                <ModuleIcon moduleKey={module.key} />
              </span>
              <span className="font-mono text-[17px] font-semibold text-[#0f172a]">
                {module.count.toLocaleString("en-KE")}
              </span>
            </div>
            <p className="mt-2 truncate text-[12px] font-semibold text-[#111827]">{module.label}</p>
            <p className="mt-0.5 truncate text-[10px] text-[#64748b]">{module.meta}</p>
            <span className="sr-only">{module.description}</span>
          </Link>
        ))}
      </nav>
    </section>
  );
}

function TimelineEventRow({ item }: { item: AdminUserActivityItem }) {
  return (
    <div className="grid grid-cols-[28px_minmax(0,1fr)_68px] gap-3 px-4 py-3 transition hover:bg-[#f8fafc] md:px-5">
      <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-brand-tint text-primary">
        <ActivityIcon source={item.source} />
      </div>
      <div className="min-w-0">
        {item.href ? (
          <Link
            href={item.href}
            className="text-[13px] font-semibold text-[#111827] transition hover:text-primary"
          >
            {item.title}
          </Link>
        ) : (
          <p className="text-[13px] font-semibold text-[#111827]">{item.title}</p>
        )}
        <div className="mt-1 flex min-w-0 items-center gap-2 text-[11px] text-[#64748b]">
          <span className="shrink-0 font-medium uppercase tracking-[0.08em]">
            {formatEnum(item.source)}
          </span>
          {item.detail ? (
            <>
              <span aria-hidden="true" className="text-[#cbd5e1]">·</span>
              <span className="truncate">{item.detail}</span>
            </>
          ) : null}
        </div>
      </div>
      <time
        dateTime={item.occurredAt}
        title={formatDate(item.occurredAt)}
        className="pt-0.5 text-right font-mono text-[11px] text-[#64748b]"
      >
        {formatTimelineTime(item.occurredAt)}
      </time>
    </div>
  );
}

function TimelineDay({
  items,
  dateKey,
}: {
  items: AdminUserActivityItem[];
  dateKey: string;
}) {
  const visibleItems = items.slice(0, 4);
  const hiddenItems = items.slice(4);

  return (
    <section
      aria-labelledby={`timeline-day-${dateKey}`}
      className="border-b border-[#e5e7eb] last:border-b-0"
    >
      <div className="flex items-center justify-between gap-4 bg-[#f8fafc] px-4 py-2.5 md:px-5">
        <h3 id={`timeline-day-${dateKey}`} className="text-[12px] font-semibold text-[#334155]">
          {formatTimelineDay(items[0].occurredAt)}
        </h3>
        <span className="font-mono text-[11px] text-[#64748b]">
          {items.length} {items.length === 1 ? "event" : "events"}
        </span>
      </div>
      <div className="divide-y divide-[#eef2f7]">
        {visibleItems.map((item) => (
          <TimelineEventRow key={item.id} item={item} />
        ))}
      </div>
      {hiddenItems.length > 0 ? (
        <details className="group border-t border-[#eef2f7]">
          <summary className="flex cursor-pointer list-none items-center justify-center gap-2 px-4 py-3 text-[12px] font-semibold text-primary transition hover:bg-brand-tint [&::-webkit-details-marker]:hidden">
            <span
              aria-hidden="true"
              className="text-[16px] leading-none transition group-open:rotate-45"
            >
              +
            </span>
            <span className="group-open:hidden">
              Show {hiddenItems.length} earlier {hiddenItems.length === 1 ? "event" : "events"}
            </span>
            <span className="hidden group-open:inline">Hide earlier events</span>
          </summary>
          <div className="divide-y divide-[#eef2f7] border-t border-[#eef2f7]">
            {hiddenItems.map((item) => (
              <TimelineEventRow key={item.id} item={item} />
            ))}
          </div>
        </details>
      ) : null}
    </section>
  );
}

export function AdminUserActivityLive({ data }: { data: AdminUserActivityData }) {
  const { profile, dealer } = data;

  if (!profile) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="User Activity"
          action={
            <Link href="/admin/users" className={adminGhostButtonClass}>
              Back to users
            </Link>
          }
        />
        <AdminSectionCard title="User not found" description="No profile exists for this account id.">
          <p className="text-[13px] text-[#6b7280]">
            The user may have been removed, or the admin data client may not have access to profiles.
          </p>
        </AdminSectionCard>
      </div>
    );
  }

  const displayName = profile.full_name || profile.email || "Unnamed user";
  const latestAt = latestActivityDate(data);
  const enquiryCount = summaryValue(data, "Enquiries");
  const conversationCount = summaryValue(data, "Conversations");
  const commerceCount = summaryValue(data, "Commerce");
  const engagementCount = summaryValue(data, "Engagement");
  const timelineGroups = groupAdminUserActivityTimelineByDay(data.timeline);
  const modules = buildAdminUserActivityModules({
    timeline: data.timeline.length,
    listings: data.listings.length,
    dealerDocuments: data.dealerDocuments.length,
    sentEnquiries: data.sentEnquiries.length,
    receivedEnquiries: data.receivedEnquiries.length,
    conversations: data.conversations.length,
    messages: data.messages.length,
    supportTickets: data.supportTickets.length,
    payments: data.payments.length,
    entitlements: data.entitlements.length,
    favorites: data.favorites.length,
    reviewsWritten: data.reviewsWritten.length,
    reviewsReceived: data.reviewsReceived.length,
    offersMade: data.offersMade.length,
    offersReceived: data.offersReceived.length,
    auditLogs: data.auditLogs.length,
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="User Activity"
        action={
          <div className="flex items-center gap-3">
            <AdminUserDeactivateControl
              userId={profile.id}
              isDeactivated={Boolean(profile.deactivated_at)}
            />
            <Link href="/admin/users" className={adminGhostButtonClass}>
              Back to users
            </Link>
          </div>
        }
      />

      {data.errors.length > 0 ? (
        <div className="rounded-[16px] border border-[#fed7aa] bg-[#fff7ed] px-5 py-4 text-[13px] leading-6 text-[#9a3412]">
          Some history could not be loaded: {data.errors.join(" ")}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[18px] border border-[#dbe3ef] bg-[#f8fafc]">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="px-6 py-6 md:px-8 md:py-7">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="flex min-w-0 gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] bg-[#0f172a] font-heading text-[18px] font-semibold text-white">
                  {userInitials(profile.full_name, profile.email)}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-heading text-[26px] font-semibold tracking-tight text-[#0f172a]">
                      {displayName}
                    </h2>
                    <AdminStatusPill label={profile.role} tone={statusTone(profile.role)} />
                    {dealer ? (
                      <AdminStatusPill label={dealer.status.toLowerCase()} tone={statusTone(dealer.status)} />
                    ) : null}
                    {profile.deactivated_at ? (
                      <AdminStatusPill label="deactivated" tone="red" />
                    ) : null}
                  </div>
                  <p className="mt-2 max-w-[68ch] text-[13px] leading-6 text-[#475569]">
                    Case file for account ownership, dealer verification, buyer/seller communication,
                    marketplace commerce, and audit history.
                  </p>
                </div>
              </div>
              <div className="grid gap-2 text-[12px] text-[#64748b] md:min-w-[220px]">
                <span className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Joined {formatDate(profile.created_at)}
                </span>
                <span className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4" />
                  Last activity {formatDate(latestAt)}
                </span>
              </div>
            </div>

            <div className="mt-6 grid gap-3 border-t border-[#dbe3ef] pt-4 text-[12px] text-[#64748b] md:grid-cols-3">
              <span>Role: <span className="font-medium text-[#111827]">{profile.role}</span></span>
              <span>Account ID: <span className="font-mono text-[#111827]">{profile.id.slice(0, 8)}</span></span>
              <span>Dealer: <span className="font-medium text-[#111827]">{dealer?.status || "No record"}</span></span>
            </div>
          </div>

          <div className="border-t border-[#dbe3ef] bg-white px-6 py-6 lg:border-l lg:border-t-0">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#64748b]">Fast read</p>
            <div className="mt-3 grid grid-cols-2 gap-x-5">
              <SummaryMetric
                label="Listings"
                value={data.listings.length}
                note={`${data.listings.filter((listing) => listing.status === "active").length} active`}
                icon={<CarFront className="h-4 w-4" />}
              />
              <SummaryMetric
                label="Enquiries"
                value={enquiryCount}
                note={`${data.sentEnquiries.length} sent`}
                icon={<Mail className="h-4 w-4" />}
              />
              <SummaryMetric
                label="Messages"
                value={conversationCount}
                note={`${data.messages.length} recent`}
                icon={<MessageSquareText className="h-4 w-4" />}
              />
              <SummaryMetric
                label="Commerce"
                value={commerceCount}
                note={`${data.payments.length} payments`}
                icon={<ReceiptText className="h-4 w-4" />}
              />
              <SummaryMetric
                label="Engagement"
                value={engagementCount}
                note={`${data.favorites.length} saved`}
                icon={<Heart className="h-4 w-4" />}
              />
            </div>
          </div>
        </div>
      </section>

      <ModuleLauncher modules={modules} />

      <div className="grid gap-6 xl:grid-cols-[292px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-6 xl:self-start">
          <section className="overflow-hidden rounded-[16px] border border-[#e5e7eb] bg-white">
            <div className="px-5 py-5">
              <div className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#64748b]">
                <UserRound className="h-4 w-4" />
                Account context
              </div>
              <dl>
                <DetailRow label="Email" value={profile.email || "No email"} />
                <DetailRow label="Phone" value={profile.phone || "Not set"} />
                <DetailRow label="WhatsApp" value={profile.whatsapp || "Not set"} />
                <DetailRow
                  label="Location"
                  value={[profile.city, profile.address].filter(Boolean).join(" / ") || "Not set"}
                />
                <DetailRow label="Website" value={profile.website || "Not set"} />
              </dl>
            </div>

            <div className="border-t border-[#e5e7eb] bg-[#fbfdff] px-5 py-5">
              <div className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#64748b]">
                <Store className="h-4 w-4" />
                Dealer record
              </div>
              {dealer ? (
                <dl>
                  <DetailRow label="Dealer" value={dealer.name} />
                  <DetailRow label="Business" value={dealer.business_name || "Not set"} />
                  <DetailRow label="Status" value={<AdminStatusPill label={dealer.status.toLowerCase()} tone={statusTone(dealer.status)} />} />
                  <DetailRow label="Contact" value={dealer.mobile || dealer.email || "Not set"} />
                  <DetailRow label="Submitted" value={formatDate(dealer.submitted_at)} />
                  <DetailRow label="Verified" value={formatDate(dealer.verified_at)} />
                </dl>
              ) : (
                <p className="border-t border-[#eef2f7] pt-3 text-[13px] leading-6 text-[#64748b]">
                  No dealer application or dealer record is linked to this account.
                </p>
              )}
            </div>
          </section>
        </aside>

        <div className="space-y-6">
          <AdminSectionCard
            id="timeline"
            title="Activity Timeline"
            description="Newest operational events first, merged across profile, dealer records, listings, enquiries, messages, payments, reviews, offers, and audit logs."
            bodyClassName="px-0 pb-0"
          >
            <div>
              {timelineGroups.length > 0 ? (
                timelineGroups.map((group) => (
                  <TimelineDay key={group.dateKey} dateKey={group.dateKey} items={group.items} />
                ))
              ) : (
                <p className="px-6 py-10 text-center text-[13px] text-[#6b7280]">
                  No activity has been recorded for this account yet.
                </p>
              )}
            </div>
          </AdminSectionCard>

          <div className="grid gap-6 xl:grid-cols-2">
            <AdminSectionCard id="listings" title="All Listings" description="Every listing owned by this user or dealer profile.">
              <AdminDataTable columns={["Listing", "Status", "Price", "Created"]}>
                {data.listings.length > 0 ? (
                  data.listings.map((listing) => (
                    <tr key={listing.id} className="border-b border-[#f1f5f9] last:border-b-0">
                      <td className="px-6 py-4">
                        <Link href={`/vehicle/${listing.id}`} className="text-[13px] font-semibold text-[#111827] hover:text-primary">
                          {compactListingTitle(listing)}
                        </Link>
                        <p className="mt-1 text-[12px] text-[#6b7280]">{firstRelation(listing.dealer)?.name || "Private seller"}</p>
                      </td>
                      <td className="px-6 py-4"><AdminStatusPill label={formatEnum(listing.status)} tone={statusTone(listing.status)} /></td>
                      <td className="px-6 py-4 text-[13px] text-[#111827]">{formatMoney(listing.price, listing.currency)}</td>
                      <td className="px-6 py-4 text-[12px] text-[#6b7280]">{formatDate(listing.created_at)}</td>
                    </tr>
                  ))
                ) : (
                  <EmptyRow colSpan={4} label="No listings found for this account." />
                )}
              </AdminDataTable>
            </AdminSectionCard>

            <AdminSectionCard id="dealer-verification" title="Dealer Verification" description="Dealer record and submitted document metadata.">
              <div className="mb-5 space-y-2 text-[13px] text-[#374151]">
                <p>Review notes: <span className="font-medium text-[#111827]">{dealer?.review_notes || "None"}</span></p>
                <p>Verification notes: <span className="font-medium text-[#111827]">{dealer?.verification_notes || "None"}</span></p>
                <p>Rejection reason: <span className="font-medium text-[#111827]">{dealer?.rejection_reason || "None"}</span></p>
              </div>
              <AdminDataTable columns={["Document", "Type", "Uploaded"]}>
                {data.dealerDocuments.length > 0 ? (
                  data.dealerDocuments.map((document) => (
                    <tr key={document.id} className="border-b border-[#f1f5f9] last:border-b-0">
                      <td className="px-6 py-4 text-[13px] font-medium text-[#111827]">{document.display_name}</td>
                      <td className="px-6 py-4 text-[12px] text-[#6b7280]">{formatEnum(document.document_type)}</td>
                      <td className="px-6 py-4 text-[12px] text-[#6b7280]">{formatDate(document.created_at)}</td>
                    </tr>
                  ))
                ) : (
                  <EmptyRow colSpan={3} label="No dealer documents found." />
                )}
              </AdminDataTable>
            </AdminSectionCard>
          </div>

          <div id="enquiries" className="grid gap-6 xl:grid-cols-2">
            <AdminSectionCard title="Enquiries Sent" description="Buyer enquiries this user sent to listings or dealers.">
              <AdminDataTable columns={["Listing", "Message", "Status", "Created"]}>
                {data.sentEnquiries.length > 0 ? (
                  data.sentEnquiries.map((enquiry) => {
                    const listing = firstRelation(enquiry.listing);
                    return (
                      <tr key={enquiry.id} className="border-b border-[#f1f5f9] last:border-b-0">
                        <td className="px-6 py-4 text-[13px] font-medium text-[#111827]">{compactListingTitle(listing)}</td>
                        <td className="max-w-[280px] px-6 py-4 text-[12px] leading-5 text-[#6b7280]">{enquiry.message}</td>
                        <td className="px-6 py-4"><AdminStatusPill label={formatEnum(enquiry.status)} tone={statusTone(enquiry.status)} /></td>
                        <td className="px-6 py-4 text-[12px] text-[#6b7280]">{formatDate(enquiry.created_at)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <EmptyRow colSpan={4} label="No sent enquiries." />
                )}
              </AdminDataTable>
            </AdminSectionCard>

            <AdminSectionCard title="Enquiries Received" description="Inbound buyer enquiries on this seller or dealer inventory.">
              <AdminDataTable columns={["Listing", "Message", "Status", "Created"]}>
                {data.receivedEnquiries.length > 0 ? (
                  data.receivedEnquiries.map((enquiry) => {
                    const listing = firstRelation(enquiry.listing);
                    return (
                      <tr key={enquiry.id} className="border-b border-[#f1f5f9] last:border-b-0">
                        <td className="px-6 py-4 text-[13px] font-medium text-[#111827]">{compactListingTitle(listing)}</td>
                        <td className="max-w-[280px] px-6 py-4 text-[12px] leading-5 text-[#6b7280]">{enquiry.message}</td>
                        <td className="px-6 py-4"><AdminStatusPill label={formatEnum(enquiry.status)} tone={statusTone(enquiry.status)} /></td>
                        <td className="px-6 py-4 text-[12px] text-[#6b7280]">{formatDate(enquiry.created_at)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <EmptyRow colSpan={4} label="No received enquiries." />
                )}
              </AdminDataTable>
            </AdminSectionCard>
          </div>

          <div id="messages" className="grid gap-6 xl:grid-cols-2">
            <AdminSectionCard title="Conversation Threads" description="Buyer/seller/dealer conversations tied to this account.">
              <AdminDataTable columns={["Listing", "Counterparty", "Status", "Last message"]}>
                {data.conversations.length > 0 ? (
                  data.conversations.map((thread) => {
                    const buyer = firstRelation(thread.buyer);
                    const seller = firstRelation(thread.seller);
                    const listing = firstRelation(thread.listing);
                    const counterpart = thread.buyer_id === profile.id ? seller : buyer;
                    return (
                      <tr key={thread.id} className="border-b border-[#f1f5f9] last:border-b-0">
                        <td className="px-6 py-4 text-[13px] font-medium text-[#111827]">{compactListingTitle(listing)}</td>
                        <td className="px-6 py-4 text-[12px] text-[#6b7280]">{counterpart?.full_name || counterpart?.email || "Unknown"}</td>
                        <td className="px-6 py-4"><AdminStatusPill label={formatEnum(thread.status)} tone={statusTone(thread.status)} /></td>
                        <td className="max-w-[260px] px-6 py-4 text-[12px] leading-5 text-[#6b7280]">{thread.last_message_preview || "No preview"}</td>
                      </tr>
                    );
                  })
                ) : (
                  <EmptyRow colSpan={4} label="No conversation threads." />
                )}
              </AdminDataTable>
            </AdminSectionCard>

            <AdminSectionCard title="Recent Messages" description="Latest messages in this user's conversation history.">
              <AdminDataTable columns={["Sender", "Message", "Visibility", "Created"]}>
                {data.messages.length > 0 ? (
                  data.messages.slice(0, 40).map((message) => {
                    const sender = firstRelation(message.sender);
                    return (
                      <tr key={message.id} className="border-b border-[#f1f5f9] last:border-b-0">
                        <td className="px-6 py-4 text-[13px] font-medium text-[#111827]">{sender?.full_name || sender?.email || "Unknown"}</td>
                        <td className="max-w-[300px] px-6 py-4 text-[12px] leading-5 text-[#6b7280]">{message.body}</td>
                        <td className="px-6 py-4 text-[12px] text-[#6b7280]">{formatEnum(message.visibility)}</td>
                        <td className="px-6 py-4 text-[12px] text-[#6b7280]">{formatDate(message.created_at)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <EmptyRow colSpan={4} label="No messages found." />
                )}
              </AdminDataTable>
            </AdminSectionCard>
          </div>

          <div id="commerce" className="grid gap-6 xl:grid-cols-2">
            <AdminSectionCard title="Payments & Membership" description="Payment records and seller package entitlements.">
              <div className="space-y-5">
                <SectionHeading>Payments</SectionHeading>
                <AdminDataTable columns={["Reference", "Purpose", "Amount", "Status"]}>
                  {data.payments.length > 0 ? (
                    data.payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-[#f1f5f9] last:border-b-0">
                        <td className="px-6 py-4 text-[13px] font-medium text-[#111827]">{payment.reference}</td>
                        <td className="px-6 py-4 text-[12px] text-[#6b7280]">{formatEnum(payment.purpose)}</td>
                        <td className="px-6 py-4 text-[13px] text-[#111827]">{formatMoney(payment.amount, payment.currency)}</td>
                        <td className="px-6 py-4"><AdminStatusPill label={formatEnum(payment.status)} tone={statusTone(payment.status)} /></td>
                      </tr>
                    ))
                  ) : (
                    <EmptyRow colSpan={4} label="No payments found." />
                  )}
                </AdminDataTable>
                <SectionHeading>Membership</SectionHeading>
                <AdminDataTable columns={["Plan", "Status", "Limit", "Ends"]}>
                  {data.entitlements.length > 0 ? (
                    data.entitlements.map((entitlement) => (
                      <tr key={entitlement.id} className="border-b border-[#f1f5f9] last:border-b-0">
                        <td className="px-6 py-4 text-[13px] font-medium text-[#111827]">{formatEnum(entitlement.plan_id)}</td>
                        <td className="px-6 py-4"><AdminStatusPill label={formatEnum(entitlement.status)} tone={statusTone(entitlement.status)} /></td>
                        <td className="px-6 py-4 text-[12px] text-[#6b7280]">{entitlement.listing_limit ?? "Unlimited"}</td>
                        <td className="px-6 py-4 text-[12px] text-[#6b7280]">{formatDate(entitlement.ends_at)}</td>
                      </tr>
                    ))
                  ) : (
                    <EmptyRow colSpan={4} label="No membership records found." />
                  )}
                </AdminDataTable>
              </div>
            </AdminSectionCard>

            <AdminSectionCard title="Support Tickets" description="Tickets created by, assigned to, or connected to this account's listings and threads.">
              <AdminDataTable columns={["Subject", "Priority", "Status", "Updated"]}>
                {data.supportTickets.length > 0 ? (
                  data.supportTickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b border-[#f1f5f9] last:border-b-0">
                      <td className="px-6 py-4 text-[13px] font-medium text-[#111827]">{ticket.subject}</td>
                      <td className="px-6 py-4 text-[12px] text-[#6b7280]">{formatEnum(ticket.priority)}</td>
                      <td className="px-6 py-4"><AdminStatusPill label={formatEnum(ticket.status)} tone={statusTone(ticket.status)} /></td>
                      <td className="px-6 py-4 text-[12px] text-[#6b7280]">{formatDate(ticket.updated_at)}</td>
                    </tr>
                  ))
                ) : (
                  <EmptyRow colSpan={4} label="No support tickets found." />
                )}
              </AdminDataTable>
            </AdminSectionCard>
          </div>

          <div id="engagement" className="grid gap-6 xl:grid-cols-2">
            <AdminSectionCard title="Reviews, Favorites & Offers" description="Engagement and dealer-offer history connected to the account.">
              <div className="space-y-5">
                <SectionHeading>Favorites</SectionHeading>
                <AdminDataTable columns={["Listing", "Saved"]}>
                  {data.favorites.length > 0 ? (
                    data.favorites.map((favorite) => (
                      <tr key={favorite.id} className="border-b border-[#f1f5f9] last:border-b-0">
                        <td className="px-6 py-4 text-[13px] font-medium text-[#111827]">{compactListingTitle(firstRelation(favorite.listing))}</td>
                        <td className="px-6 py-4 text-[12px] text-[#6b7280]">{formatDate(favorite.created_at)}</td>
                      </tr>
                    ))
                  ) : (
                    <EmptyRow colSpan={2} label="No favorites found." />
                  )}
                </AdminDataTable>
                <SectionHeading>Offers</SectionHeading>
                <AdminDataTable columns={["Direction", "Listing", "Amount", "Status"]}>
                  {[...data.offersMade, ...data.offersReceived].length > 0 ? (
                    [...data.offersMade, ...data.offersReceived].map((offer) => (
                      <tr key={`${offer.id}-${offer.dealer_profile_id === profile.id ? "made" : "received"}`} className="border-b border-[#f1f5f9] last:border-b-0">
                        <td className="px-6 py-4 text-[12px] text-[#6b7280]">{offer.dealer_profile_id === profile.id ? "Made" : "Received"}</td>
                        <td className="px-6 py-4 text-[13px] font-medium text-[#111827]">{compactListingTitle(firstRelation(offer.listing))}</td>
                        <td className="px-6 py-4 text-[13px] text-[#111827]">{formatMoney(offer.amount, offer.currency)}</td>
                        <td className="px-6 py-4"><AdminStatusPill label={formatEnum(offer.status)} tone={statusTone(offer.status)} /></td>
                      </tr>
                    ))
                  ) : (
                    <EmptyRow colSpan={4} label="No offers found." />
                  )}
                </AdminDataTable>
                <SectionHeading>Reviews</SectionHeading>
                <AdminDataTable columns={["Direction", "Listing", "Rating", "Review"]}>
                  {[...data.reviewsWritten, ...data.reviewsReceived].length > 0 ? (
                    [...data.reviewsWritten, ...data.reviewsReceived].map((review) => (
                      <tr key={`${review.id}-${review.reviewer_id === profile.id ? "written" : "received"}`} className="border-b border-[#f1f5f9] last:border-b-0">
                        <td className="px-6 py-4 text-[12px] text-[#6b7280]">{review.reviewer_id === profile.id ? "Written" : "Received"}</td>
                        <td className="px-6 py-4 text-[13px] font-medium text-[#111827]">{compactListingTitle(firstRelation(review.listing))}</td>
                        <td className="px-6 py-4 text-[13px] text-[#111827]">{review.rating}/5</td>
                        <td className="max-w-[300px] px-6 py-4 text-[12px] leading-5 text-[#6b7280]">{review.body}</td>
                      </tr>
                    ))
                  ) : (
                    <EmptyRow colSpan={4} label="No reviews found." />
                  )}
                </AdminDataTable>
              </div>
            </AdminSectionCard>

            <AdminSectionCard id="audit" title="Audit Logs" description="Operational audit events by this user or on their listings/dealer record.">
              <AdminDataTable columns={["Action", "Entity", "Entity ID", "Created"]}>
                {data.auditLogs.length > 0 ? (
                  data.auditLogs.map((log) => (
                    <tr key={log.id} className="border-b border-[#f1f5f9] last:border-b-0">
                      <td className="px-6 py-4 text-[13px] font-medium capitalize text-[#111827]">{formatEnum(log.action)}</td>
                      <td className="px-6 py-4 text-[12px] text-[#6b7280]">{formatEnum(log.entity_type)}</td>
                      <td className="max-w-[180px] truncate px-6 py-4 font-mono text-[11px] text-[#6b7280]">{log.entity_id || "None"}</td>
                      <td className="px-6 py-4 text-[12px] text-[#6b7280]">{formatDate(log.created_at)}</td>
                    </tr>
                  ))
                ) : (
                  <EmptyRow colSpan={4} label="No audit logs found." />
                )}
              </AdminDataTable>
            </AdminSectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
