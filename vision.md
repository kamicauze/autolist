Autolist (Private Repository)

Autolist is a Kenya-focused vehicle marketplace MVP, inspired by AutoTrader principles, built to prioritize trust, structured listings, and operational clarity.

This repository contains the private MVP implementation and internal documentation used by engineering, product, and operations teams.

⸻

Purpose of This Repository

This codebase exists to:
	•	Deliver the Autolist MVP as defined in the decision-locked scope
	•	Serve as a clean handover artifact to future engineering and SRE teams
	•	Act as the single source of truth for implementation decisions

This is not a public or open-source project.

⸻

MVP Intent

The MVP is designed to:
	•	Validate demand and trust in a structured vehicle marketplace
	•	Support dealers and sellers with clear workflows
	•	Enable buyers to make informed decisions
	•	Establish a scalable technical foundation

The MVP intentionally avoids over-automation, advanced AI, and full digital retailing.

⸻

In Scope (MVP)

Marketplace
	•	Vehicle listings only:
	•	Cars
	•	Motorbikes
	•	Vans
	•	Trucks
	•	Plant & farm vehicles
	•	User roles:
	•	Buyer
	•	Individual Seller
	•	Dealer
	•	Admin
	•	Listing lifecycle:
	•	Draft → Pending Approval → Active → Reserved → Sold
	•	Search, filters, sorting, pagination
	•	Vehicle comparison (2–3 vehicles)
	•	Wishlist / saved vehicles

Trust & Moderation
	•	Mandatory dealer verification (admin-approved)
	•	Progressive individual seller verification (phone required)
	•	Admin moderation for dealer listings
	•	Visible trust indicators (verified dealer, featured listing)

Analytics (MVP-light)
	•	Dealer analytics (directional):
	•	Views
	•	Enquiries
	•	Wishlist saves
	•	Admin analytics:
	•	Listings by category
	•	Seller mix
	•	Moderation activity

Payments
	•	M-Pesa and Stripe are supported for platform services only:
	•	Featured listings
	•	Dealer ads
	•	Dealer subscriptions
	•	No vehicle purchase payments, deposits, logistics, or delivery

AI (Assistive Only)
	•	Listing quality suggestions
	•	Possible duplicate flags (admin-reviewed)
	•	Relative price positioning (internal data only)

AI does not auto-approve, auto-reject, block listings, or guarantee pricing.

⸻

Explicitly Out of Scope (MVP)
	•	Vehicle purchase checkout or escrow
	•	Payments for vehicles or deposits
	•	Logistics or delivery
	•	Vehicle parts and accessories
	•	Fully automated moderation or fraud enforcement
	•	Predictive pricing or external market data
	•	Real-time analytics

⸻

Architecture Summary

Core Stack
	•	Frontend: Next.js (App Router) on Vercel
	•	Backend: Supabase (Postgres, Auth, Row Level Security)
	•	Edge & Security: Cloudflare (DNS, CDN, WAF, rate limiting)
	•	Media Storage: Cloudflare R2
	•	Private bucket: original images
	•	Public bucket: resized/watermarked derivatives
	•	Background Processing: Optional VPS (Hetzner) for async jobs
	•	Payments: M-Pesa (Daraja) + Stripe
	•	Observability: Sentry, basic monitoring

Architectural Principles
	•	Backend-first contracts (schema, roles, RLS)
	•	Security enforced at the data layer
	•	Async processing for heavy tasks
	•	Managed services preferred to reduce ops burden
	•	Designed for clean handover to another ops/SRE team

⸻

Repository Structure (Indicative)

/app            → Next.js application (routes, layouts)
/components     → Shared UI components
/lib            → Client utilities (Supabase, API wrappers)
/db             → Database schema & migrations
/workers        → Background jobs (optional)
/docs           → Architecture, delivery, and decision documents

Structure may evolve as the MVP matures.

⸻

Delivery & Process
	•	Backend skeleton is implemented first:
	•	Schema
	•	Roles
	•	RLS
	•	Listing lifecycle
	•	Frontend and backend progress in parallel once contracts are locked
	•	Scope changes must reference the decision-locked MVP documents

Week-by-week delivery plans live in /docs.

⸻

Security & Access Control
	•	All sensitive access controlled via Supabase Row Level Security
	•	No critical authorization logic exists only in the frontend
	•	Private media is never publicly accessible
	•	Admin actions are logged
	•	Rate limiting applied to sensitive endpoints

⸻

Environment & Setup (High-Level)
	1.	Clone the repository
	2.	Configure environment variables (.env.example)
	3.	Apply database migrations
	4.	Run the Next.js app locally
	5.	Verify access via Supabase Auth

Detailed setup instructions are in /docs/setup.md.

⸻

Ownership & Handover
	•	Infrastructure accounts are owned by Autolist
	•	Documentation is a required deliverable
	•	The system is designed for handover to a dedicated SRE/ops team post-MVP

⸻

Internal Guiding Principle

Build for trust, clarity, and maintainability first.
Features and automation come later.

