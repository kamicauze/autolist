# Autolist Admin Portal Client Demo Script

**Audience:** Client stakeholders  
**Duration:** 25-35 minutes  
**Environment:** Staging admin portal  
**Presenter goal:** Show that the admin portal is a live operational console for marketplace oversight, content management, moderation, support, and configuration.

---

## Pre-Demo Checklist

1. Log in with an admin or super-admin account before the call starts.
2. Open `/admin/dashboard` as the first tab.
3. Keep these routes ready in the sidebar:
   - `/admin/dashboard`
   - `/admin/listings`
   - `/admin/review`
   - `/admin/verification`
   - `/admin/cms`
   - `/admin/ads-banners`
   - `/admin/blogs-content`
   - `/admin/special-offers`
   - `/admin/featured-listings`
   - `/admin/car-inquiries`
   - `/admin/insurance-requests`
   - `/admin/roles-permissions`
   - `/admin/settings`
   - `/admin/analytics`
   - `/admin/payments`
   - `/admin/audit-logs`
4. If there is little staging data, frame the demo as workflow validation and point out the empty states.
5. Avoid destructive actions unless the client explicitly asks. For delete/reject flows, open the modal, explain it, then cancel.

---

## Opening Talk Track

"This is the Autolist admin portal. The goal is to give the operations team one place to manage the marketplace: listings, reviews, dealer verification, content, marketing placements, support queues, settings, roles, and reporting. I will walk through it the same way an admin would use it during a normal workday: start with the dashboard, clear queues, review inventory, manage content, then check controls and reporting."

---

## 1. Dashboard: Daily Command Center

**Route:** `/admin/dashboard`

**Show:**
- KPI cards for marketplace health.
- Recent listings, users, and tickets.
- Sidebar badge counts and the primary action button.
- Help/tour button if you want to show guided onboarding.

**Talk track:**
"The dashboard is the daily landing page. It surfaces the main operating numbers and recent activity so the team can quickly see what needs attention. If there are pending reviews, KYC submissions, or support items, the admin can jump straight into the relevant queue."

**Capability message:**
- Real operational snapshot.
- Queue-driven workflow.
- Designed for repeated daily use, not just reporting.

---

## 2. Listings: Full Inventory Management

**Route:** `/admin/listings`

**Show:**
- Search.
- Status, seller type, and visibility filters.
- Expandable listing rows.
- Row action menu.

**Talk track:**
"This is the full inventory control room. Admins can search and filter listings, inspect details, and take operational actions from the row menu. The actions are wired to server-side updates, so changes affect admin, seller, and public views consistently."

**Action menu capabilities to mention:**
- View listing.
- Approve or set active.
- Send to review.
- Reject listing with a reason.
- Feature or unfeature.
- Hold/reserve.
- Mark sold.
- Expire.
- Delete with confirmation.

**Safe demo move:**
Open the action menu, explain the options, open a reject or delete modal, then cancel.

---

## 3. Review Queue: Moderation and Duplicate Detection

**Route:** `/admin/review`

**Show:**
- Pending listings.
- Approve and reject buttons.
- Duplicate Review Assistant card when suggestions exist.
- Rejection reason modal.

**Talk track:**
"The review queue is where new listings get checked before going live. Admins can approve clean submissions or reject with a note. The duplicate review assistant compares pending listings against existing inventory and gives a reviewer-friendly summary so the moderation team can catch repeated or suspicious submissions faster."

**Capability message:**
- Human-in-the-loop moderation.
- AI-assisted duplicate detection.
- Audit-friendly rejection reasons.

---

## 4. Verification (KYC): Dealer Approval Workflow

**Route:** `/admin/verification`

**Show:**
- Pending dealer submissions.
- Business/contact details.
- Uploaded documents and image previews.
- Approve and reject controls.
- Rejection reason modal.

**Talk track:**
"This is the dealer verification workflow. Dealers submit business information and supporting documents. Admins review the documents, approve legitimate dealers, or reject with a clear reason. This protects marketplace trust before dealers can operate at scale."

**Capability message:**
- Dealer KYC queue.
- Document review.
- Approval/rejection workflow.
- Consistent admin header and guided tour anchor.

---

## 5. CMS: Homepage, Pages, and Media

**Route:** `/admin/cms`

**Show:**
- Area switcher: Homepage, Pages, Media.
- Homepage block editor.
- Draft and publish controls.
- Static page editor.
- Media library upload and optimized image handling.

**Talk track:**
"The CMS lets the team update public-facing content without engineering support. Homepage sections, static pages, and shared media all live here. Changes can be saved as drafts and published when ready, which gives the team control without making every content update a deployment."

**Capability message:**
- Homepage management.
- Static page management.
- Media upload library.
- Draft-to-publish flow.

---

## 6. Marketing Modules: Banners, Blogs, Offers, Featured Listings

### Ads and Banners

**Route:** `/admin/ads-banners`

**Show:**
- Campaign list.
- Editor.
- Placement, creative, target URL, status, schedule, and performance.
- Delete confirmation modal.

**Talk track:**
"Ads and banners are managed as campaigns. The team can create a draft, choose placement, assign desktop and mobile creative, set a target URL, schedule start and end dates, and track basic performance."

### Blogs and Content

**Route:** `/admin/blogs-content`

**Show:**
- Blog list.
- Post editor.
- Draft/publish controls.

**Talk track:**
"The blog module gives the team a publishing workflow for news, guides, and SEO content. Posts can be drafted, reviewed, and published from the admin portal."

### Special Offers

**Route:** `/admin/special-offers`

**Show:**
- Offer list.
- Offer editor.
- Active/pause state.
- Sort or reorder capability if visible.

**Talk track:**
"Special offers are promotional cards or campaigns. The team can create offers, schedule them, pause them, and control ordering."

### Featured Listings

**Route:** `/admin/featured-listings`

**Show:**
- Search inventory.
- Pin listing.
- Start/end windows.
- Sort order.
- Currently pinned rail.

**Talk track:**
"Featured listings let the team curate high-value or paid placements. Admins can search active inventory, pin vehicles, set campaign windows, and control ordering in the featured rail."

---

## 7. Support Operations: Inquiries, Insurance, Reports

### Car Inquiries

**Route:** `/admin/car-inquiries`

**Show:**
- Ticket queue.
- Detail panel.
- Latest message preview.
- Assignment, status, internal note, resolution note.

**Talk track:**
"Car inquiries give support visibility into buyer questions. The current panel shows the latest message preview and lets admins assign, update status, and document the internal resolution."

### Insurance Requests

**Route:** `/admin/insurance-requests`

**Show:**
- Request queue.
- Buyer and listing details.
- Status and quote tracking.

**Talk track:**
"Insurance requests are handled as an operational queue. The team can review buyer details, listing context, notes, and move the request through status updates or quote tracking."

### Reports

**Route:** `/admin/reports`

**Show:**
- Reports queue.
- Activity panel.
- Status/resolution controls if data exists.

**Talk track:**
"Reports are the trust and safety queue. If users flag listings or suspicious behavior, those reports land here for admin review and follow-up."

---

## 8. Access Control: Roles and Permissions

**Route:** `/admin/roles-permissions`

**Show:**
- Role coverage cards.
- Staff assignments.
- Permission matrix.
- Read-only behavior for non-super-admin users if applicable.

**Talk track:**
"Roles and permissions define who can do what inside the platform. The permission matrix makes access easy to audit, and staff assignments keep the admin team scoped to the right level of control."

**Capability message:**
- Staff access governance.
- Permission visibility.
- Super-admin controlled assignment flow.

---

## 9. Settings: Platform Configuration

**Route:** `/admin/settings`

**Show:**
- Platform settings form.
- Schema readiness notice.
- Save button.
- Success/error feedback banner.

**Talk track:**
"Settings are platform-wide controls. These include operational defaults like support contacts, review SLA, and feature toggles. Saves persist to the platform settings table when the schema is available, and feedback appears directly in the admin UI."

**Safe demo move:**
Change a non-critical field only if the client approves; otherwise explain the save flow without submitting.

---

## 10. Read-Only Monitoring: Users, Payments, Analytics, Audit Logs

### Users

**Route:** `/admin/users`

**Talk track:**
"Users is currently a read-only account overview. It helps support find accounts, check role and status, and understand recent activity. Role changes are handled through the roles and permissions workflow."

### Payments

**Route:** `/admin/payments`

**Talk track:**
"Payments is a read-only transaction ledger for reconciliation. It shows recorded payment activity and related user/listing context when available. Refund/dispute operations are a planned expansion."

### Analytics

**Route:** `/admin/analytics`

**Talk track:**
"Analytics summarizes marketplace performance over the current reporting window. It gives leadership a quick view of marketplace activity, revenue, and conversion signals."

### Audit Logs

**Route:** `/admin/audit-logs`

**Talk track:**
"Audit logs show who did what and when. This is important for accountability, support escalations, and post-mortems."

---

## Closing Summary

"The admin portal now covers the core operating needs of the marketplace: moderation, KYC, inventory control, support queues, content publishing, campaign management, featured placements, roles, settings, reporting, and audit visibility. Some areas are intentionally read-only today, such as Users, Payments, Analytics, and Audit Logs, but the foundation is already there and the workflows are separated clearly so the team can operate safely while the next action layers are added."

---

## Suggested Client Q&A Answers

**Q: Can our team update homepage content without developers?**  
"Yes. The CMS supports homepage blocks, static pages, media uploads, drafts, and publishing."

**Q: Can we prevent fake dealers from going live?**  
"Yes. Dealer verification is reviewed manually, with document previews and approve/reject decisions."

**Q: Can admins control listings after they are submitted?**  
"Yes. Admins can approve, reject, feature, hold, mark sold, expire, or delete listings from the listings module."

**Q: Is there AI in the admin portal?**  
"Yes. The listing review queue includes duplicate-detection assistance that summarizes similarity to existing listings."

**Q: Are all modules fully action-enabled?**  
"The operational modules are action-enabled. Some monitoring modules are read-only today, including Users, Payments, Analytics, and Audit Logs. Those are ready for future action layers like user suspension, refunds, filters, and custom analytics ranges."

**Q: What should we build next?**  
"The most valuable next steps are user actions, audit log filtering, payment detail/refund workflows, and real pagination across large tables."
