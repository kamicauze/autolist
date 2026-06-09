import Link from "next/link";
import {
  BadgeCheck,
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
  AdminStatCard,
  AdminStatusPill,
  adminGhostButtonClass,
} from "@/components/admin/admin-ui";
import type { AdminUserActivityData } from "@/lib/data/admin-user-detail";

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

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="User Activity"
        action={
          <Link href="/admin/users" className={adminGhostButtonClass}>
            Back to users
          </Link>
        }
      />

      {data.errors.length > 0 ? (
        <div className="rounded-[16px] border border-[#fed7aa] bg-[#fff7ed] px-5 py-4 text-[13px] leading-6 text-[#9a3412]">
          Some history could not be loaded: {data.errors.join(" ")}
        </div>
      ) : null}

      <AdminSectionCard
        title={profile.full_name || profile.email || "Unnamed user"}
        description="Admin-only profile, dealer, and activity context for this account."
        action={<AdminStatusPill label={profile.role} tone={statusTone(profile.role)} />}
      >
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-3 text-[13px] text-[#374151]">
            <p className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-[#2563eb]" />
              <span className="font-medium text-[#111827]">{profile.full_name || "No name"}</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#6b7280]" />
              {profile.email || "No email"}
            </p>
            <p>Phone: <span className="font-medium text-[#111827]">{profile.phone || "Not set"}</span></p>
            <p>WhatsApp: <span className="font-medium text-[#111827]">{profile.whatsapp || "Not set"}</span></p>
            <p>Location: <span className="font-medium text-[#111827]">{[profile.city, profile.address].filter(Boolean).join(" / ") || "Not set"}</span></p>
            <p>Joined: <span className="font-medium text-[#111827]">{formatDate(profile.created_at)}</span></p>
          </div>

          <div className="space-y-3 text-[13px] text-[#374151]">
            <p className="flex items-center gap-2">
              <Store className="h-4 w-4 text-[#2563eb]" />
              <span className="font-medium text-[#111827]">{dealer?.name || "No dealer profile"}</span>
            </p>
            {dealer ? (
              <>
                <p>Business: <span className="font-medium text-[#111827]">{dealer.business_name || "Not set"}</span></p>
                <p>Status: <AdminStatusPill label={dealer.status.toLowerCase()} tone={statusTone(dealer.status)} /></p>
                <p>Dealer contact: <span className="font-medium text-[#111827]">{dealer.mobile || dealer.email || "Not set"}</span></p>
                <p>Submitted: <span className="font-medium text-[#111827]">{formatDate(dealer.submitted_at)}</span></p>
                <p>Verified: <span className="font-medium text-[#111827]">{formatDate(dealer.verified_at)}</span></p>
              </>
            ) : (
              <p className="text-[#6b7280]">This account has no dealer application or dealer record.</p>
            )}
          </div>
        </div>
      </AdminSectionCard>

      <div className="grid gap-4 xl:grid-cols-5">
        {data.summary.map((item) => (
          <AdminStatCard
            key={item.label}
            label={item.label}
            value={item.value.toLocaleString("en-KE")}
            note={item.note}
            icon={
              item.label === "Listings" ? (
                <CarFront className="h-5 w-5" />
              ) : item.label === "Enquiries" ? (
                <Mail className="h-5 w-5" />
              ) : item.label === "Conversations" ? (
                <MessageSquareText className="h-5 w-5" />
              ) : item.label === "Commerce" ? (
                <ReceiptText className="h-5 w-5" />
              ) : (
                <BadgeCheck className="h-5 w-5" />
              )
            }
          />
        ))}
      </div>

      <AdminSectionCard
        title="Full Activity Timeline"
        description="Merged history across profile, dealer records, listings, enquiries, messages, payments, reviews, offers, and audit logs."
      >
        <div className="space-y-3">
          {data.timeline.length > 0 ? (
            data.timeline.map((item) => (
              <div
                key={item.id}
                className="grid gap-3 rounded-[12px] border border-[#e5e7eb] bg-white px-4 py-3 md:grid-cols-[36px_minmax(0,1fr)_170px]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eff6ff] text-[#2563eb]">
                  <ActivityIcon source={item.source} />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.href ? (
                      <Link href={item.href} className="text-[13px] font-semibold text-[#111827] hover:text-[#2563eb]">
                        {item.title}
                      </Link>
                    ) : (
                      <p className="text-[13px] font-semibold text-[#111827]">{item.title}</p>
                    )}
                    <AdminStatusPill label={formatEnum(item.source)} tone="slate" />
                  </div>
                  {item.detail ? (
                    <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-[#6b7280]">{item.detail}</p>
                  ) : null}
                </div>
                <p className="text-[12px] text-[#6b7280] md:text-right">{formatDate(item.occurredAt)}</p>
              </div>
            ))
          ) : (
            <p className="rounded-[12px] border border-[#e5e7eb] px-4 py-6 text-center text-[13px] text-[#6b7280]">
              No activity has been recorded for this account yet.
            </p>
          )}
        </div>
      </AdminSectionCard>

      <div className="grid gap-8 xl:grid-cols-2">
        <AdminSectionCard title="All Listings" description="Every listing owned by this user or dealer profile.">
          <AdminDataTable columns={["Listing", "Status", "Price", "Created"]}>
            {data.listings.length > 0 ? (
              data.listings.map((listing) => (
                <tr key={listing.id} className="border-b border-[#f1f5f9] last:border-b-0">
                  <td className="px-6 py-4">
                    <Link href={`/vehicle/${listing.id}`} className="text-[13px] font-semibold text-[#111827] hover:text-[#2563eb]">
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

        <AdminSectionCard title="Dealer Verification" description="Dealer record and submitted document metadata.">
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

      <div className="grid gap-8 xl:grid-cols-2">
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

      <div className="grid gap-8 xl:grid-cols-2">
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

      <div className="grid gap-8 xl:grid-cols-2">
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

      <div className="grid gap-8 xl:grid-cols-2">
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

        <AdminSectionCard title="Audit Logs" description="Operational audit events by this user or on their listings/dealer record.">
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
  );
}
