# Autolist MVP – Development Roadmap & Budget

**Version:** 1.0
**Date:** February 2026
**Timeline:** 2-5 Months
**Status:** Planning

---

## Table of Contents

1. [Project Status](#1-project-status)
2. [Feature List & Requirements](#2-feature-list--requirements)
3. [Development Roadmap](#3-development-roadmap)
4. [Budget Breakdown](#4-budget-breakdown)
5. [Technical Requirements](#5-technical-requirements)
6. [Risk & Contingency](#6-risk--contingency)

---

## 1. Project Status

### Already Built ✅

| Component | Status | Notes |
|-----------|--------|-------|
| Database Schema | Complete | 8 core tables with RLS |
| Authentication | Complete | Email, phone, Google, Facebook SSO |
| Listing Search & Filters | Complete | 8+ filter dimensions |
| Vehicle Detail Pages | Complete | With similar listings |
| Image Upload (R2) | Complete | Presigned URLs, watermarking ready |
| Basic UI Components | Complete | Radix + Tailwind |
| Home Page | Complete | Hero, featured, services |

### Remaining to Build 🚧

| Component | Priority | Complexity |
|-----------|----------|------------|
| Dealer/Seller Dashboard | Critical | High |
| Admin Dashboard | Critical | High |
| Dealer Verification | Critical | Medium |
| Enquiry System | Critical | Low |
| Wishlist & Comparison | Important | Low |
| Featured Listings & Ads | Important | Medium |
| Payment Integration | Important | High |
| AI Module | Important | Medium |
| Analytics & Reporting | Important | Medium |

---

## 2. Feature List & Requirements

### 2.1 Dealer/Seller Dashboard

**Purpose:** Enable dealers and individual sellers to manage listings, track performance, and handle enquiries.

#### Features

| Feature | Description | Priority |
|---------|-------------|----------|
| **Listing Management** | Create, edit, duplicate, delete listings | Critical |
| **Listing Status Control** | Draft → Pending → Active → Reserved → Sold | Critical |
| **Image Management** | Upload, reorder, delete, set primary | Critical |
| **Enquiry Inbox** | View, respond, mark as read/closed | Critical |
| **Performance Analytics** | Views, enquiries, wishlist saves per listing | Important |
| **Profile Management** | Edit dealer/seller profile, contact info | Important |
| **Bulk Actions** | Mark multiple as sold, delete, renew | Nice-to-have |

#### Technical Requirements

```
Frontend:
├── Dashboard layout with sidebar navigation
├── Listing table with sorting, filtering, pagination
├── Listing form (create/edit) with multi-step wizard
├── Image uploader with drag-drop, reorder
├── Enquiry inbox with message threading
├── Analytics charts (views, enquiries over time)
└── Profile settings page

Backend:
├── Server actions: createListing, updateListing, deleteListing
├── Server actions: updateListingStatus, duplicateListing
├── Server actions: getMyListings, getMyEnquiries, markEnquiryRead
├── Analytics queries: getListingStats, getPerformanceOverTime
└── RLS policies already in place

Third-party:
├── Chart library (Recharts or Chart.js)
└── Date picker (for filtering)
```

#### Effort: 3-4 weeks

---

### 2.2 Admin Dashboard

**Purpose:** Enable platform admins to moderate listings, verify dealers, and monitor platform health.

#### Features

| Feature | Description | Priority |
|---------|-------------|----------|
| **Listing Moderation** | Review, approve, reject pending listings | Critical |
| **Dealer Verification** | Review docs, approve, reject dealers | Critical |
| **User Management** | View users, suspend, change roles | Critical |
| **Content Moderation** | Remove listings, flag users | Critical |
| **Platform Analytics** | Total listings, users, enquiries, trends | Important |
| **Audit Logs** | View all admin actions | Important |
| **Bulk Moderation** | Approve/reject multiple listings | Nice-to-have |

#### Technical Requirements

```
Frontend:
├── Admin layout (separate from main app)
├── Moderation queue with filters (pending, flagged)
├── Listing review modal (view details, images, approve/reject)
├── Dealer verification queue
├── Document viewer (ID, business registration)
├── User management table
├── Platform analytics dashboard
└── Audit log viewer

Backend:
├── Admin-only API routes (role check middleware)
├── Server actions: approveListing, rejectListing, bulkModerate
├── Server actions: approveDealer, rejectDealer, requestMoreDocs
├── Server actions: suspendUser, changeUserRole
├── Analytics queries: getPlatformStats, getModerationMetrics
├── Audit logging on all admin actions
└── Service role Supabase client for admin operations

Security:
├── Role-based access control (admin role check)
├── Audit trail for all actions
└── Rate limiting on admin endpoints
```

#### Effort: 2-3 weeks

---

### 2.3 Dealer Verification System

**Purpose:** Verify legitimate dealers to build marketplace trust.

#### Features

| Feature | Description | Priority |
|---------|-------------|----------|
| **Document Upload** | Upload business reg, ID, location proof | Critical |
| **Verification Status** | Pending → Approved / Rejected | Critical |
| **Verified Badge** | Display on dealer profile and listings | Critical |
| **Rejection Feedback** | Clear reason, ability to resubmit | Important |
| **Verification Reminder** | Prompt unverified dealers | Nice-to-have |

#### Technical Requirements

```
Frontend:
├── Verification wizard (multi-step form)
├── Document upload with preview
├── Verification status display
├── Rejection reason display + resubmit flow
└── Verified badge component

Backend:
├── Secure document storage (R2 private bucket)
├── Server actions: submitVerification, getVerificationStatus
├── Admin actions: approveDealer, rejectDealer
├── Email notifications (approved, rejected, reminder)
└── Schema already exists (dealers table)

Documents Required:
├── Business registration certificate OR dealer ID
├── National ID of business owner
├── Proof of location (utility bill, lease)
└── Business phone number (verified via OTP)
```

#### Effort: 1-2 weeks

---

### 2.4 Enquiry System

**Purpose:** Enable buyers to contact sellers about listings.

#### Features

| Feature | Description | Priority |
|---------|-------------|----------|
| **Send Enquiry** | Form on listing page | Critical |
| **Enquiry Inbox** | Sellers view all enquiries | Critical |
| **Reply to Enquiry** | In-app messaging | Important |
| **Email Notifications** | Notify seller of new enquiry | Critical |
| **Enquiry Status** | Pending → Read → Replied → Closed | Important |
| **Spam Protection** | Rate limiting, captcha | Important |

#### Technical Requirements

```
Frontend:
├── Enquiry form (name, phone, email, message)
├── Enquiry inbox in seller dashboard
├── Message thread view
├── Reply composer
└── Enquiry status badges

Backend:
├── Server actions: sendEnquiry, getEnquiries, replyToEnquiry
├── Email service integration (Resend, SendGrid, or Supabase)
├── Rate limiting (max 5 enquiries per hour per user)
├── Captcha integration (Cloudflare Turnstile - free)
└── Schema already exists (enquiries table)

Notifications:
├── Email to seller on new enquiry
├── Email to buyer on reply
└── Optional: SMS notification (future)
```

#### Effort: 1 week

---

### 2.5 Wishlist & Comparison

**Purpose:** Help buyers save and compare vehicles.

#### Features

| Feature | Description | Priority |
|---------|-------------|----------|
| **Save to Wishlist** | Heart icon on listings | Critical |
| **View Wishlist** | Dedicated page for saved vehicles | Critical |
| **Remove from Wishlist** | Easy removal | Critical |
| **Compare Vehicles** | Side-by-side comparison (2-3) | Important |
| **Comparison Attributes** | Price, year, mileage, specs | Important |
| **Share Comparison** | Shareable comparison link | Nice-to-have |

#### Technical Requirements

```
Frontend:
├── Wishlist button component (heart icon)
├── Wishlist page with saved listings grid
├── Comparison selector (checkbox on listings)
├── Comparison table/modal (side-by-side)
└── Share comparison (generate URL with listing IDs)

Backend:
├── Server actions: addToWishlist, removeFromWishlist, getWishlist
├── Server actions: getComparisonData (multiple listing IDs)
├── Schema already exists (wishlists table)
└── Comparison doesn't need storage (URL params)

State Management:
├── Wishlist state (server + optimistic UI)
├── Comparison state (local, max 3 vehicles)
└── Persist comparison in URL for sharing
```

#### Effort: 1 week

---

### 2.6 Featured Listings & Ads

**Purpose:** Monetization through premium listing placement.

#### Features

| Feature | Description | Priority |
|---------|-------------|----------|
| **Featured Placement** | Top of search results, homepage | Critical |
| **Feature Duration** | 7, 14, 30 day packages | Critical |
| **Purchase Flow** | Select package → Pay → Activate | Critical |
| **Featured Badge** | Visual indicator on listing | Important |
| **Dealer Spotlight** | Featured dealer section | Nice-to-have |
| **Ad Performance** | Track featured listing performance | Important |

#### Technical Requirements

```
Frontend:
├── "Feature this listing" button in seller dashboard
├── Package selection UI (7/14/30 days, pricing)
├── Payment flow integration
├── Featured badge component
├── Featured section on homepage
└── Featured listings priority in search

Backend:
├── Listings table: is_featured, featured_until columns
├── Server actions: purchaseFeature, checkFeatureExpiry
├── Scheduled job: expire featured listings daily
├── Payment webhook handler
└── Search query modification (featured first)

Business Logic:
├── Featured listings appear first in search
├── Featured expires automatically
├── Renewal reminders before expiry
└── Analytics on featured vs regular performance
```

#### Effort: 1-2 weeks

---

### 2.7 Payment Integration

**Purpose:** Accept payments for featured listings, verification fees, future subscriptions.

#### Features

| Feature | Description | Priority |
|---------|-------------|----------|
| **M-Pesa Integration** | Primary payment method for Kenya | Critical |
| **Stripe Integration** | Card payments (international, backup) | Important |
| **Payment History** | View past transactions | Important |
| **Receipts** | Email receipt after payment | Important |
| **Refunds** | Admin-initiated refunds | Nice-to-have |

#### Technical Requirements

```
Frontend:
├── Payment method selector (M-Pesa / Card)
├── M-Pesa flow (enter phone → STK push → confirm)
├── Stripe checkout (embedded or redirect)
├── Payment confirmation page
├── Payment history in dashboard
└── Receipt download/email

Backend:
├── M-Pesa Daraja API integration
│   ├── STK Push initiation
│   ├── Callback URL handler
│   └── Transaction status query
├── Stripe integration
│   ├── Checkout session creation
│   ├── Webhook handler (payment_intent.succeeded)
│   └── Customer management
├── Server actions: initiatePayment, verifyPayment
├── Payment recording in database
└── Schema already exists (payments table)

Security:
├── Webhook signature verification
├── Idempotency keys (prevent double charges)
├── Payment status reconciliation
└── PCI compliance (use Stripe hosted fields)

Environment:
├── M-Pesa sandbox → production credentials
├── Stripe test → live keys
└── Webhook endpoints (public, secured)
```

#### Effort: 2-3 weeks

---

### 2.8 AI Module

**Purpose:** Enhance listing quality, buyer discovery, and marketplace trust.

#### Tier 1 Features (Rule-Based)

| Feature | Description | Effort |
|---------|-------------|--------|
| **Listing Quality Checker** | Flag missing fields, suggest improvements | 3-5 days |
| **Price Positioning** | Below/Fair/Above market labels | 3-5 days |
| **Duplicate Detection** | Flag similar listings for admin review | 1 week |
| **Smart Search Bar** | Parse natural language queries | 1 week |

#### Tier 2 Features (AI-Enhanced)

| Feature | Description | Effort |
|---------|-------------|--------|
| **AI Search Fallback** | Claude handles complex queries | 3-5 days |
| **Description Suggestions** | AI improves listing descriptions | 3-5 days |
| **Quality Scoring** | AI rates listing quality 1-10 | 3-5 days |

#### Technical Requirements

```
Tier 1 (Rule-Based):
├── Quality checker utility functions
├── Price comparison SQL queries
├── Duplicate detection queries
├── Search query parser (regex + rules)
└── No external dependencies

Tier 2 (AI-Enhanced):
├── Anthropic SDK (@anthropic-ai/sdk)
├── Claude API key (environment variable)
├── Server actions for AI calls
├── Response caching (reduce API costs)
└── Fallback handling (if API fails)

Integration Points:
├── Listing form: quality checker inline
├── Listing display: price positioning badge
├── Admin queue: duplicate alerts
├── Search page: smart search bar
└── Seller dashboard: AI suggestions
```

#### Effort: 3-4 weeks (Tier 1 + Tier 2)

---

### 2.9 Analytics & Reporting

**Purpose:** Provide insights to dealers and platform admins.

#### Dealer Analytics

| Metric | Description |
|--------|-------------|
| Total listings | Active, reserved, sold counts |
| Views | Per listing, total, over time |
| Enquiries | Per listing, conversion rate |
| Wishlist saves | Demand indicator |
| Top performers | Best listings by enquiries |
| Underperformers | Listings needing attention |

#### Admin Analytics

| Metric | Description |
|--------|-------------|
| Platform totals | Listings, users, dealers, enquiries |
| Growth trends | New listings/users over time |
| Category breakdown | Listings by vehicle type |
| Verification stats | Verified vs unverified |
| Moderation metrics | Approval/rejection rates |
| Revenue | Featured listings, verification fees |

#### Technical Requirements

```
Frontend:
├── Dashboard cards (totals, key metrics)
├── Line charts (trends over time)
├── Bar charts (category breakdown)
├── Tables (top/bottom performers)
└── Date range selector

Backend:
├── Analytics queries (aggregations, time series)
├── Materialized views for performance (optional)
├── Server actions: getDealerAnalytics, getAdminAnalytics
└── Consider: analytics events table for detailed tracking

Libraries:
├── Recharts or Chart.js for visualizations
├── date-fns for date manipulation
└── Optional: analytics service (Plausible, PostHog)
```

#### Effort: 1-2 weeks (included in dashboard estimates)

---

## 3. Development Roadmap

### Timeline: 3-4 Months (Recommended)

```
MONTH 1: Core Seller Experience
├── Week 1-2: Dealer/Seller Dashboard (listing management)
├── Week 3: Dealer/Seller Dashboard (enquiry inbox)
└── Week 4: Dealer Verification Flow

MONTH 2: Admin & Moderation
├── Week 5-6: Admin Dashboard (moderation queue)
├── Week 7: Admin Dashboard (analytics, user management)
└── Week 8: Enquiry System + Wishlist/Comparison

MONTH 3: Monetization & AI
├── Week 9-10: Payment Integration (M-Pesa + Stripe)
├── Week 11: Featured Listings
└── Week 12: AI Module (Tier 1)

MONTH 4: Polish & Launch
├── Week 13: AI Module (Tier 2) + Smart Search
├── Week 14: Testing, bug fixes
├── Week 15: Performance optimization
└── Week 16: Soft launch, monitoring, iteration
```

### Timeline: 2 Months (Aggressive)

```
MONTH 1: Core Features
├── Week 1-2: Dealer/Seller Dashboard (essential features only)
├── Week 3: Admin Dashboard (moderation only)
└── Week 4: Verification + Enquiry System

MONTH 2: Monetization & Launch
├── Week 5-6: Payment Integration (M-Pesa only)
├── Week 7: Featured Listings + AI (Tier 1 rules only)
└── Week 8: Testing + Launch

Deferred to Phase 2:
├── Full analytics dashboards
├── Stripe integration
├── AI Tier 2
├── Wishlist/Comparison
└── Bulk actions
```

### Timeline: 5 Months (Comfortable)

```
MONTH 1: Dealer/Seller Experience
├── Week 1-2: Dashboard foundation + listing management
├── Week 3: Enquiry system
└── Week 4: Analytics (dealer-facing)

MONTH 2: Admin & Trust
├── Week 5-6: Admin dashboard (full)
├── Week 7: Dealer verification
└── Week 8: User management + audit logs

MONTH 3: Buyer Features
├── Week 9: Wishlist + Comparison
├── Week 10: Smart Search (rule-based)
└── Week 11-12: AI Module Tier 1

MONTH 4: Monetization
├── Week 13-14: Payment integration (M-Pesa + Stripe)
├── Week 15: Featured listings
└── Week 16: AI Module Tier 2

MONTH 5: Launch Prep
├── Week 17-18: Testing, QA, bug fixes
├── Week 19: Performance, security audit
└── Week 20: Soft launch + iteration
```

---

## 4. Budget Breakdown

### Development Costs

| Module | Effort | Rate (KES/week)* | Cost (KES) |
|--------|--------|------------------|------------|
| Dealer/Seller Dashboard | 3-4 weeks | 150,000 | 450,000 - 600,000 |
| Admin Dashboard | 2-3 weeks | 150,000 | 300,000 - 450,000 |
| Dealer Verification | 1-2 weeks | 150,000 | 150,000 - 300,000 |
| Enquiry System | 1 week | 150,000 | 150,000 |
| Wishlist & Comparison | 1 week | 150,000 | 150,000 |
| Featured Listings | 1-2 weeks | 150,000 | 150,000 - 300,000 |
| Payment Integration | 2-3 weeks | 150,000 | 300,000 - 450,000 |
| AI Module (Tier 1+2) | 3-4 weeks | 150,000 | 450,000 - 600,000 |
| Testing & Polish | 2-3 weeks | 150,000 | 300,000 - 450,000 |
| **TOTAL** | **16-23 weeks** | - | **2,400,000 - 3,450,000** |

*Rate assumption: Mid-level developer at ~KES 150,000/week. Adjust based on your actual rates.

### Development Cost by Timeline

| Timeline | Scope | Dev Cost (KES) |
|----------|-------|----------------|
| **2 months** | Core MVP (reduced scope) | 1,200,000 - 1,500,000 |
| **3-4 months** | Full MVP | 2,400,000 - 2,800,000 |
| **5 months** | Full MVP + extras | 3,000,000 - 3,500,000 |

---

### Operational Costs (Monthly)

| Service | Free Tier | Estimated Monthly | Notes |
|---------|-----------|-------------------|-------|
| **Vercel** (Hosting) | Yes | 0 - 5,000 | Free tier likely sufficient for MVP |
| **Supabase** (Database) | Yes | 0 - 7,500 | Free tier: 500MB, 2GB transfer |
| **Cloudflare R2** (Storage) | 10GB free | 1,000 - 5,000 | $0.015/GB storage |
| **Cloudflare** (CDN/Security) | Yes | 0 | Free tier sufficient |
| **Resend** (Email) | 3K/month free | 0 - 3,000 | For notifications |
| **M-Pesa Daraja** | - | Transaction fees | 1-2% per transaction |
| **Stripe** | - | Transaction fees | 2.9% + $0.30 per transaction |
| **Claude API** (AI) | - | 5,000 - 15,000 | If AI Tier 2 enabled |
| **Domain** | - | 1,500 - 3,000 | Annual, prorated |
| **TOTAL (Low traffic)** | - | **5,000 - 15,000** | Early stage |
| **TOTAL (Growing)** | - | **20,000 - 50,000** | With paid tiers + AI |

---

### Cost Per Feature (Development + 6-Month Operations)

| Feature | Dev Cost (KES) | 6-Mo Ops (KES) | Total (KES) |
|---------|----------------|----------------|-------------|
| Dealer/Seller Dashboard | 525,000 | 0 | 525,000 |
| Admin Dashboard | 375,000 | 0 | 375,000 |
| Dealer Verification | 225,000 | 6,000 | 231,000 |
| Enquiry System | 150,000 | 18,000 | 168,000 |
| Wishlist & Comparison | 150,000 | 0 | 150,000 |
| Featured Listings | 225,000 | 0 | 225,000 |
| Payment Integration | 375,000 | 30,000* | 405,000 |
| AI Module (Tier 1) | 300,000 | 0 | 300,000 |
| AI Module (Tier 2) | 225,000 | 60,000 | 285,000 |
| Testing & Polish | 375,000 | 0 | 375,000 |

*Payment ops cost = transaction fees, varies with volume

---

### Budget Summary

| Scenario | Dev Cost | Monthly Ops | 6-Mo Total |
|----------|----------|-------------|------------|
| **Minimum MVP** (2 months) | 1,350,000 | 10,000 | 1,410,000 |
| **Recommended MVP** (3-4 months) | 2,600,000 | 25,000 | 2,750,000 |
| **Full MVP** (5 months) | 3,250,000 | 40,000 | 3,490,000 |

---

## 5. Technical Requirements

### Development Environment

```
Required:
├── Node.js 18+
├── pnpm (package manager)
├── Git
├── VS Code or similar IDE
└── Supabase CLI

Accounts Needed:
├── Supabase (database, auth)
├── Cloudflare (R2, DNS, CDN)
├── Vercel (hosting)
├── Safaricom Developer Portal (M-Pesa)
├── Stripe (card payments)
├── Anthropic (AI - if Tier 2)
└── Resend or SendGrid (email)
```

### API Keys & Credentials

| Service | Keys Needed | Environment |
|---------|-------------|-------------|
| Supabase | URL, Anon Key, Service Role Key | All |
| Cloudflare R2 | Account ID, Access Key, Secret | All |
| M-Pesa | Consumer Key, Consumer Secret, Shortcode | Production |
| Stripe | Publishable Key, Secret Key | All |
| Claude | API Key | Production |
| Resend | API Key | All |

### Infrastructure Checklist

```
Before Development:
☐ Supabase project created
☐ R2 buckets configured (public + private)
☐ Domain registered and DNS configured
☐ SSL certificates (automatic via Cloudflare)

Before Payment Integration:
☐ Safaricom business account
☐ M-Pesa Daraja sandbox approved
☐ Stripe account verified
☐ Webhook endpoints deployed

Before Launch:
☐ Production environment variables set
☐ Database backups configured
☐ Monitoring/alerting set up
☐ Error tracking (Sentry or similar)
☐ Analytics (Plausible, PostHog, or GA)
```

---

## 6. Risk & Contingency

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| M-Pesa integration delays | High | Start early, have Stripe as backup |
| Supabase free tier limits | Medium | Monitor usage, budget for upgrade |
| AI API costs higher than expected | Low | Tier 1 has zero AI cost fallback |
| Performance issues at scale | Medium | Load testing before launch |

### Timeline Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Scope creep | High | Strict MVP definition, defer to Phase 2 |
| Underestimated complexity | Medium | Buffer weeks in timeline |
| Third-party integration issues | Medium | Early prototyping of integrations |
| Testing takes longer | Low | Parallel testing during development |

### Contingency: What to Cut for 2-Month Timeline

If timeline compresses to 2 months, defer these:

1. ~~Stripe integration~~ → M-Pesa only
2. ~~AI Tier 2~~ → Rule-based only
3. ~~Wishlist/Comparison~~ → Phase 2
4. ~~Full analytics~~ → Basic metrics only
5. ~~Bulk actions~~ → Single-item only
6. ~~Dealer spotlight~~ → Featured listings only

---

## Appendix: Feature Dependencies

```
                    ┌─────────────────┐
                    │   Auth (Done)   │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Seller Dashboard│ │ Admin Dashboard │ │  Buyer Features │
│  (Week 1-4)     │ │   (Week 5-7)    │ │   (Week 8)      │
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘
         │                   │                   │
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   Verification  │ │   Moderation    │ │    Wishlist     │
│   (Week 4)      │ │   (Week 5-6)    │ │   Comparison    │
└────────┬────────┘ └─────────────────┘ └─────────────────┘
         │
         ▼
┌─────────────────┐
│    Payments     │──────────────────────┐
│   (Week 9-10)   │                      │
└────────┬────────┘                      │
         │                               │
         ▼                               ▼
┌─────────────────┐              ┌─────────────────┐
│Featured Listings│              │   AI Module     │
│   (Week 11)     │              │  (Week 12-13)   │
└─────────────────┘              └─────────────────┘
```

---

## Next Steps

1. **Confirm timeline**: 2, 3-4, or 5 months?
2. **Confirm budget**: Validate development rate assumptions
3. **Prioritize features**: Rank by importance if cuts needed
4. **Set up accounts**: Supabase, M-Pesa, Stripe, etc.
5. **Begin development**: Start with Dealer/Seller Dashboard

---

*Document prepared for Autolist MVP planning.*
