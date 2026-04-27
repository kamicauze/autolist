# Autolist - Kenya's Trusted Vehicle Marketplace (MVP)

Autolist is a Kenya-focused vehicle marketplace built to prioritize trust, structured listings, and operational clarity. It connects buyers with verified private sellers and dealerships, offering a secure and transparent platform for vehicle trade.

> **Note**: This is a private repository containing the MVP implementation.

## 🚀 MVP Intent & Scope

This MVP allows us to validate demand and trust in a structured marketplace while supporting dealers and sellers with clear workflows.

### ✅ In Scope
-   **Vehicle Listings**: Cars, Motorbikes, Vans, Trucks, Plant & Farm Vehicles.
-   **User Roles**: Buyer, Individual Seller, Dealer, Sales Agent, Support, Admin, Super Admin.
-   **Listing Lifecycle**: Draft → Pending Approval → Active → Reserved → Sold.
-   **Trust**: Mandatory dealer verification, progressive seller verification (phone), admin moderation.
-   **Payments**: M-Pesa & Stripe for **platform services only** (Featured listings, Dealer subscriptions).

### ❌ Out of Scope
-   Vehicle purchase checkout or escrow.
-   Payments for vehicles, deposits, or logistics.
-   Parts and accessories.
-   Fully automated moderation (AI is assistive only).

## 🛠 Tech Stack

-   **Frontend**: [Next.js 16](https://nextjs.org/) (App Router) on Vercel.
-   **Backend**: [Supabase](https://supabase.com/) (Postgres, Auth, RLS).
-   **Edge & Security**: Cloudflare (DNS, CDN, WAF, Rate Limiting).
-   **Storage**: Cloudflare R2 (Private & Public buckets).
-   **Payments**: M-Pesa (Daraja) & Stripe.

## 🏁 Getting Started

### Prerequisites
-   Node.js 20+
-   npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/autolist.git
    cd autolist
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env.local` file with Supabase and Cloudflare credentials.

    Optional provider integrations used by staging/QA:

    ```bash
    # Email delivery via Resend
    RESEND_API_KEY=
    EMAIL_FROM="Autolist <notifications@your-domain.com>"

    # WhatsApp Cloud API delivery
    WHATSAPP_ACCESS_TOKEN=
    WHATSAPP_PHONE_NUMBER_ID=
    WHATSAPP_API_VERSION=v21.0

    # Protected endpoint for queued notification delivery
    NOTIFICATION_PROCESS_SECRET=

    # Public URL used in invite links and notification deep links
    NEXT_PUBLIC_SITE_URL=http://localhost:3000
    ```

    Check provider readiness without printing secret values:

    ```bash
    npm run integrations:check
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

### Local Admin Access

To create or reset a local admin account against the configured Supabase project:

```bash
npm run admin:ensure -- --email admin@autolist.local --password TempAdmin123! --name "Local Admin"
```

The script will create the auth user if it does not exist, reset the password if it does, and upsert the `profiles.role`. Use `--role super_admin` for the first owner account so that account can manage role-permission mappings:

```bash
npm run admin:ensure -- --email owner@example.com --password "TempAdmin123!" --name "Owner Admin" --role super_admin
```

### Sales Agent Invites

Dealer owners add sales reps from `/dashboard/sales-agents`. The app generates a one-time invite link; the rep signs in or creates their own account with the invited email address, then accepts the invite at `/join/sales-agent/[token]`. Dealers should not assign or share sales-rep passwords.

## 📂 Project Structure

-   `app/`: Next.js App Router pages and layouts.
-   `components/`: Shared UI components.
-   `lib/`: Client utilities and API wrappers.
-   `db/`: Database schema and migrations.
-   `docs/`: Architecture and delivery documentation.

## 📚 Learn More

Check out the [ARCHITECTURE.md](./ARCHITECTURE.md) file for system design details.
