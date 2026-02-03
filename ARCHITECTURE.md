# System Architecture

## Overview

Autolist is built on a **Next.js App Router** frontend and a **Supabase** serverless backend. We prioritize backend-first contracts, enforcing security at the data layer via Row Level Security (RLS).

## 🏗 High-Level Architecture

```mermaid
graph TD
    User[Client / Browser] -->|HTTP/HTTPS| CF[Cloudflare (DNS, WAF, CDN)]
    CF --> Next[Next.js App Router]
    Next -->|SSR / RSC| DB[(Supabase Postgres)]
    Next -->|Uploads| Storage[Cloudflare R2]
    User -->|Auth| Auth[Supabase Auth]
    DB -->|Triggers| Workers[Async Workers (Optional)]
```

### Core Components

1.  **Cloudflare**: Acts as the first line of defense (WAF, Rate Limiting) and delivers static content via CDN.
2.  **Next.js App Router**: Handles routing, server components, and API execution on Vercel.
3.  **Supabase**:
    -   **Postgres**: Primary data store.
    -   **Auth**: Manages identity (Buyers, Sellers, Dealers).
    -   **RLS**: Granular access control policies.
4.  **Cloudflare R2 (Storage)**:
    -   **Private Bucket**: Stores original, raw images (never public).
    -   **Public Bucket**: Stores processed, resized, and watermarked derivatives.

## 💾 Database Schema & Logic

### Listing Lifecycle
The status workflow for listings is strictly defined:
`draft` -> `pending` (Approval) -> `active` -> `reserved` -> `sold` / `expired`.

### AI Strategy (Assistive Only)
AI is used solely to assist operations, not to replace human decision-making.
-   **Capabilities**: Quality suggestions, duplicate flagging, relative price positioning.
-   **Constraints**: AI **does not** auto-approve, auto-reject, or block listings.

## 🔐 Security & Access Control

-   **Backend-First**: All sensitive access is controlled via RLS policies in the database.
-   **Role-Based**:
    -   **Buyer**: Search, Wishlist, Enquire.
    -   **Seller/Dealer**: Create/Manage Listings (Dealer requires Admin verification).
    -   **Admin**: Moderate listings, Verify dealers, View analytics.
-   **Rate Limiting**: Applied to sensitive endpoints (auth, enquiry submission).

## 🌐 Data Fetching

Data is fetched primarily via **Server Components** for read operations, ensuring fast initial loads and SEO. Mutations are handled via **Server Actions**.

## 🚀 Deployment

-   **Frontend**: Vercel.
-   **Database**: Supabase (Managed).
-   **Storage**: Cloudflare R2.
-   **Background Jobs**: Optional VPS (Hetzner) for heavy async processing.
