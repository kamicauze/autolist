# Autolist - Kenya's Trusted Vehicle Marketplace (MVP)

Autolist is a Kenya-focused vehicle marketplace built to prioritize trust, structured listings, and operational clarity. It connects buyers with verified private sellers and dealerships, offering a secure and transparent platform for vehicle trade.

> **Note**: This is a private repository containing the MVP implementation.

## 🚀 MVP Intent & Scope

This MVP allows us to validate demand and trust in a structured marketplace while supporting dealers and sellers with clear workflows.

### ✅ In Scope
-   **Vehicle Listings**: Cars, Motorbikes, Vans, Trucks, Plant & Farm Vehicles.
-   **User Roles**: Buyer, Individual Seller, Dealer, Admin.
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

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

## 📂 Project Structure

-   `app/`: Next.js App Router pages and layouts.
-   `components/`: Shared UI components.
-   `lib/`: Client utilities and API wrappers.
-   `db/`: Database schema and migrations.
-   `docs/`: Architecture and delivery documentation.

## 📚 Learn More

Check out the [ARCHITECTURE.md](./ARCHITECTURE.md) file for system design details.
