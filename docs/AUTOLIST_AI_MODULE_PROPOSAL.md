# Autolist AI Module Proposal

**Client Presentation Document**

---

**Prepared for:** Autolist Stakeholders
**Date:** February 2026
**Version:** 2.0
**Timeline:** 2-5 Months

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [AI Vision: What Sets Autolist Apart](#2-ai-vision-what-sets-autolist-apart)
3. [AI Features by Tier](#3-ai-features-by-tier)
4. [Feature Details & Viability](#4-feature-details--viability)
5. [Infrastructure & Costs](#5-infrastructure--costs)
6. [Implementation Timeline](#6-implementation-timeline)
7. [Discussion Points](#7-discussion-points)
8. [Appendix](#8-appendix)

---

## 1. Executive Summary

### The Opportunity

Autolist aims to be Kenya's most trusted vehicle marketplace. AI-powered features can differentiate the platform by:

- **Improving listing quality** — better listings attract more buyers
- **Building trust** — price transparency helps buyers decide confidently
- **Enhancing discovery** — smart search makes finding vehicles effortless
- **Reducing fraud** — duplicate detection keeps the marketplace clean
- **Providing decision intelligence** — help buyers choose, not just search

### Strategic Positioning

> **Autolist shouldn't compete on:**
> ❌ Number of listings
> ❌ Cheapest prices
>
> **Autolist should win on:**
> ✅ Clarity
> ✅ Trust
> ✅ Decision intelligence
> ✅ Local (Kenyan) context

### Our Recommendation

| Tier | Monthly Cost | Timeline | Recommendation |
|------|--------------|----------|----------------|
| Tier 1: Smart Foundations | KES 0 | MVP | ✅ Include |
| Tier 2: AI-Enhanced | KES 5-20K | Post-launch | ✅ Include |
| Tier 3: Decision Intelligence | KES 20-50K | Phase 2 | ⏸️ Roadmap |
| Tier 4: Market Authority | KES 50K+ | Phase 3 | ⏸️ Future |

### Key Takeaway

> Start with **zero-cost rule-based features**, add **AI-enhanced search and pricing** post-launch, then build toward **decision intelligence** that makes Autolist the market oracle — not just a listing board.

---

## 2. AI Vision: What Sets Autolist Apart

### From Search Engine → Advisor

Most marketplaces are passive: filter, scroll, hope.

Autolist should be active: **understand intent, recommend intelligently, build trust**.

```
COMPETITOR EXPERIENCE:
User → Filters → 500 results → Overwhelm → Leave

AUTOLIST EXPERIENCE:
User → "I need a reliable family car under 3M" → 5 ranked recommendations with reasons → Confident decision → Enquiry
```

### The Intelligence Stack

```
┌─────────────────────────────────────────────────────────────┐
│  TIER 4: MARKET AUTHORITY (Phase 3)                         │
│  Market trends, import intelligence, predictive demand      │
├─────────────────────────────────────────────────────────────┤
│  TIER 3: DECISION INTELLIGENCE (Phase 2)                    │
│  Ownership cost, condition scoring, lifestyle fit           │
├─────────────────────────────────────────────────────────────┤
│  TIER 2: AI-ENHANCED (Post-Launch)                          │
│  Smart search AI, price advisor, ask-the-car                │
├─────────────────────────────────────────────────────────────┤
│  TIER 1: SMART FOUNDATIONS (MVP)                            │
│  Quality checker, price positioning, duplicate detection    │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. AI Features by Tier

### Tier 1: Smart Foundations (MVP) — KES 0/month

| Feature | What It Does | Data Required | Effort |
|---------|--------------|---------------|--------|
| **Listing Quality Checker** | Flags missing fields, scores listings | Listing data | 3-5 days |
| **Price Positioning** | "Below/Fair/Above Market" labels | 10+ similar listings | 3-5 days |
| **Duplicate Detection** | Flags similar listings for admin | Listing history | 1 week |
| **Smart Search (Rules)** | Parses "Toyota SUV under 2M" | Filter constants | 1 week |
| **Make/Model Intelligence** | "About Toyota Land Cruiser" pages | Static content + specs | 3-5 days |

**Total: 3-4 weeks, KES 0/month**

---

### Tier 2: AI-Enhanced (Post-Launch) — KES 5-20K/month

| Feature | What It Does | Data Required | Effort |
|---------|--------------|---------------|--------|
| **Smart Search (AI Fallback)** | Handles "reliable family car" | Claude API | 3-5 days |
| **Price Negotiation Assistant** | "Listed 18% above median, suggest X" | Market data | 1 week |
| **Description Suggestions** | AI improves listing text | Claude API | 3-5 days |
| **Ask-the-Car** | Conversational Q&A per listing | Claude API + listing data | 1-2 weeks |
| **Vehicle Fit Scores** | City/Family/Off-road fit badges | Spec-based rules | 1 week |

**Total: 4-5 weeks, KES 5-20K/month**

---

### Tier 3: Decision Intelligence (Phase 2) — KES 20-50K/month

| Feature | What It Does | Data Required | Effort |
|---------|--------------|---------------|--------|
| **AI Vehicle Matchmaker** | Intent-based recommendations | Claude + user preferences | 2-3 weeks |
| **Ownership Cost Forecaster** | Fuel, maintenance, insurance estimates | External data + rules | 3-4 weeks |
| **Condition Confidence Score** | Mileage anomalies, photo analysis | Historical data + Vision API | 3-4 weeks |
| **Dealer Intelligence** | Reliability scores, insights | Transaction history | 2-3 weeks |
| **Fraud Prevention Engine** | Auto-flag suspicious listings | Pattern detection | 2-3 weeks |

**Total: 10-15 weeks, KES 20-50K/month**

---

### Tier 4: Market Authority (Phase 3) — KES 50K+/month

| Feature | What It Does | Data Required | Effort |
|---------|--------------|---------------|--------|
| **Market Trends & Insights** | "Prices trending up/down" | 6+ months data | 3-4 weeks |
| **Predictive Demand Signals** | "Diesel SUVs rising before rains" | Seasonal + search data | 4-6 weeks |
| **Import Intelligence** | Landed cost estimates, KRA warnings | Import data, regulations | 4-6 weeks |
| **Dealer Analytics Premium** | AI recommendations for inventory | Deep dealer data | 3-4 weeks |

**Total: 15-20 weeks, KES 50K+/month**

---

## 4. Feature Details & Viability

### MVP Features (Tier 1)

#### 4.1 Listing Quality Checker ✅ MVP

**Viability: HIGH** | **Cost: KES 0** | **Effort: 3-5 days**

```
┌─────────────────────────────────────────────────────┐
│  ⚠️  Improve Your Listing:                         │
│                                                     │
│  ❌ Add mileage (40% more views)                   │
│  ❌ Add at least 6 photos (you have 2)             │
│  ⚠️  Description too short                         │
│  ✅ Price, make, model complete                    │
│                                                     │
│  Quality Score: 6/10                                │
└─────────────────────────────────────────────────────┘
```

**Implementation:** Pure rule-based. No AI API needed.

---

#### 4.2 Price Positioning ✅ MVP

**Viability: HIGH** | **Cost: KES 0** | **Effort: 3-5 days**

**Buyer sees:**
```
🟢 Below Market Price
Similar vehicles: KES 6.8M - 7.5M
```

**Seller sees:**
```
📊 Market Comparison (12 similar vehicles):
Your position: Below average (competitive)
💡 Vehicles priced 5-10% below average sell 2x faster
```

**Implementation:** SQL queries against your own listing data.

**Requirement:** Needs 10+ comparable listings per make/model for accuracy.

---

#### 4.3 Duplicate Detection ✅ MVP

**Viability: HIGH** | **Cost: KES 0** | **Effort: 1 week**

Flags listings with >80% similarity (same make, model, year, similar mileage/price, same seller).

**Implementation:** SQL matching with weighted scoring.

---

#### 4.4 Smart Search (Rules) ✅ MVP

**Viability: HIGH** | **Cost: KES 0** | **Effort: 1 week**

```
🔍 "toyota hilux diesel under 4m mombasa"
     ↓
Applied: [Toyota] [Hilux] [Diesel] [< KES 4M] [Mombasa]
```

**Implementation:** Regex + keyword matching against known makes, models, locations.

---

#### 4.5 Make/Model Intelligence ✅ MVP

**Viability: HIGH** | **Cost: KES 0** | **Effort: 3-5 days**

Static pages for popular makes/models:

```
┌─────────────────────────────────────────────────────┐
│  About: Toyota Land Cruiser Prado                   │
│                                                     │
│  🚗 Popular in Kenya for: Off-road, family trips   │
│  ⛽ Fuel: 12-15 km/L (diesel variants)             │
│  🔧 Parts availability: Excellent                  │
│  💰 Price range on Autolist: KES 4.5M - 12M        │
│  📊 35 currently listed                            │
│                                                     │
│  [View all Land Cruiser Prados →]                   │
└─────────────────────────────────────────────────────┘
```

**Implementation:** Static content with dynamic listing counts/prices.

---

### Post-Launch Features (Tier 2)

#### 4.6 Smart Search (AI Fallback) ✅ Post-Launch

**Viability: HIGH** | **Cost: KES 5-10K/mo** | **Effort: 3-5 days**

Handles queries rules can't parse:
- "Reliable family car for Nairobi traffic"
- "Good first car for a new driver"
- "Something fuel efficient for long trips"

**Implementation:** Claude Haiku parses intent → structured filters.

---

#### 4.7 Price Negotiation Assistant ✅ Post-Launch

**Viability: HIGH** | **Cost: KES 0-5K/mo** | **Effort: 1 week**

**For buyers:**
```
💡 This car is listed 18% above market median.
   Similar listings typically close at KES 4.2M - 4.5M.

   Suggested approach: Offer KES 4.3M as starting point.
```

**For sellers:**
```
💡 Your listing is 12% above similar vehicles.
   Reducing by KES 200K could increase enquiries by ~35%.
```

**Implementation:** Mostly rule-based with market data. AI optional for phrasing.

---

#### 4.8 Vehicle Fit Scores ✅ Post-Launch

**Viability: HIGH** | **Cost: KES 0** | **Effort: 1 week**

Visual badges on each listing:

```
🏙️ City Fit: ★★★★☆
👨‍👩‍👧‍👦 Family Fit: ★★★★★
🏔️ Off-road Fit: ★★★☆☆
🔰 First-time Owner: ★★★★☆
```

**Calculation (rule-based):**

| Factor | City | Family | Off-road | First-time |
|--------|------|--------|----------|------------|
| Engine size | < 2.0L ↑ | Any | > 2.5L ↑ | < 1.8L ↑ |
| Ground clearance | Low OK | Medium+ | High ↑ | Any |
| Fuel consumption | Low ↑ | Any | Any | Low ↑ |
| Boot space | Any | Large ↑ | Any | Any |
| Parts availability | Any | High ↑ | Any | High ↑ |
| Safety features | Any | High ↑ | Any | High ↑ |

**Implementation:** Spec-based scoring rules. No AI needed.

---

#### 4.9 Ask-the-Car ⚠️ Post-Launch (Optional)

**Viability: MEDIUM** | **Cost: KES 5-15K/mo** | **Effort: 1-2 weeks**

Conversational layer on listing pages:

```
┌─────────────────────────────────────────────────────┐
│  💬 Ask about this vehicle:                         │
│  ┌─────────────────────────────────────────────┐   │
│  │ "Is this good for a new driver?"            │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  🤖 This 2020 Toyota Vitz is a good choice for     │
│     new drivers because:                            │
│     • Compact size for easy parking                │
│     • 1.3L engine (affordable fuel & insurance)    │
│     • Automatic transmission                        │
│     • Toyota parts widely available in Kenya       │
│     • Good safety rating for its class             │
└─────────────────────────────────────────────────────┘
```

**Implementation:** Claude API with listing context. Rate-limit per user.

**Risk:** Can increase API costs significantly if popular. Start with limit of 3 questions per listing per user.

---

### Phase 2 Features (Tier 3)

#### 4.10 AI Vehicle Matchmaker ⏸️ Phase 2

**Viability: MEDIUM-HIGH** | **Cost: KES 10-20K/mo** | **Effort: 2-3 weeks**

```
User: "I want a reliable car under 2.5M for Nairobi
       traffic and weekend trips to Nakuru."

AI Returns:
┌─────────────────────────────────────────────────────┐
│  🎯 Top 3 Matches for You:                          │
│                                                     │
│  1. 2019 Toyota Wish — KES 2.3M                    │
│     ✓ Great fuel economy for city                  │
│     ✓ Spacious for family trips                    │
│     ✓ Parts readily available                      │
│                                                     │
│  2. 2018 Mazda CX-5 — KES 2.4M                     │
│     ✓ Higher ground clearance for rough roads      │
│     ✓ Reliable engine                              │
│     ⚠️ Slightly higher maintenance cost            │
│                                                     │
│  3. 2020 Honda Fit — KES 1.9M                      │
│     ✓ Best fuel economy                            │
│     ✓ Under budget                                 │
│     ⚠️ Less space for long trips                   │
└─────────────────────────────────────────────────────┘
```

**Data needed:** Listing data + Kenya-specific vehicle knowledge base.

**Why Phase 2:** Needs refined prompts, testing, and trust in AI recommendations.

---

#### 4.11 Ownership Cost Forecaster ⏸️ Phase 2

**Viability: MEDIUM** | **Cost: KES 5-10K/mo** | **Effort: 3-4 weeks**

```
┌─────────────────────────────────────────────────────┐
│  💰 Estimated Ownership Cost (per year):            │
│                                                     │
│  Fuel:           KES 180,000 (15,000 km @ 12 km/L) │
│  Service:        KES 45,000 (2 services @ 22.5K)   │
│  Insurance:      KES 65,000 - 85,000               │
│  Common repairs: KES 20,000 - 40,000               │
│  ─────────────────────────────────────             │
│  Total:          KES 310,000 - 350,000 / year      │
│                                                     │
│  📉 Resale value (3 years): ~KES 4.8M - 5.2M       │
└─────────────────────────────────────────────────────┘
```

**Data needed:**
- Fuel prices (can be updated monthly)
- Service costs by make/model (need to build database)
- Insurance ranges (partnerships or estimates)
- Depreciation curves (need historical sold data)

**Why Phase 2:** Requires external data and careful accuracy claims.

---

#### 4.12 Condition Confidence Score ⏸️ Phase 2

**Viability: MEDIUM** | **Cost: KES 10-25K/mo** | **Effort: 3-4 weeks**

```
┌─────────────────────────────────────────────────────┐
│  🔍 Condition Confidence: MEDIUM                    │
│                                                     │
│  ✅ Mileage consistent with age                     │
│  ✅ Photos show clean interior                      │
│  ⚠️ Single owner claim not verifiable              │
│  ⚠️ Service history not provided                   │
│                                                     │
│  💡 Ask seller for service records before purchase │
└─────────────────────────────────────────────────────┘
```

**Components:**
1. **Mileage analysis** (rule-based): Flag if mileage seems low for age
2. **Photo analysis** (Claude Vision): Detect wear, mismatched panels
3. **Description analysis** (Claude): Detect vague or suspicious language

**Why Phase 2:** Vision API adds cost; needs careful UX to avoid false accusations.

---

#### 4.13 Fraud Prevention Engine ⏸️ Phase 2

**Viability: HIGH** | **Cost: KES 5-15K/mo** | **Effort: 2-3 weeks**

Automatically detects:
- Duplicate listings across different sellers
- Stock photos reused across listings
- Unrealistic price anomalies
- Suspicious description patterns

**Action:** Flag for admin review or auto-throttle visibility.

**Implementation:** Combination of SQL rules + image hashing + Claude for text analysis.

**Why Phase 2:** Needs baseline data to establish "normal" patterns.

---

### Phase 3 Features (Tier 4)

#### 4.14 Market Trends & Insights ⏸️ Phase 3

**Viability: HIGH (with data)** | **Cost: KES 10-20K/mo** | **Effort: 3-4 weeks**

**Public-facing:**
```
📊 Autolist Market Report — January 2026

Most Searched: Toyota Prado, Mazda CX-5, Nissan X-Trail
Prices Rising: Diesel SUVs (+8% this quarter)
Prices Falling: Sedans (-5% this quarter)
Hot Deal Alert: 15 vehicles priced 20%+ below market
```

**Why Phase 3:** Needs 6+ months of data for meaningful trends.

---

#### 4.15 Import Intelligence ⏸️ Phase 3

**Viability: MEDIUM** | **Cost: KES 15-30K/mo** | **Effort: 4-6 weeks**

```
┌─────────────────────────────────────────────────────┐
│  🚢 Import Intelligence:                            │
│                                                     │
│  Estimated landed cost: KES 2.8M - 3.2M            │
│  (Japan auction: ¥850K + shipping + duties)        │
│                                                     │
│  ⚠️ Warning: This spec (2.5L) often triggers       │
│     higher KRA valuation. Budget extra KES 200K.   │
│                                                     │
│  ✅ Right-hand drive (Kenya compatible)            │
│  ✅ Parts availability: High                        │
└─────────────────────────────────────────────────────┘
```

**Why Phase 3:** Requires import data sources, KRA rules database, currency tracking.

---

## 5. Infrastructure & Costs

### Cost Summary by Tier

| Tier | Features | Monthly Cost | Data Required |
|------|----------|--------------|---------------|
| **Tier 1** | Quality, pricing, duplicates, search | **KES 0** | Own listing data |
| **Tier 2** | AI search, negotiation, fit scores, ask-car | **KES 5-20K** | + Claude API |
| **Tier 3** | Matchmaker, ownership cost, condition, fraud | **KES 20-50K** | + External data, Vision API |
| **Tier 4** | Trends, import intel, dealer analytics | **KES 50K+** | + 6mo+ historical data |

---

### Base Platform Costs (All Tiers)

| Service | Purpose | Launch | Growth (10K users) |
|---------|---------|--------|-------------------|
| Vercel | Hosting | KES 0 | KES 3,000 |
| Supabase | Database + Auth | KES 0 | KES 3,750 |
| Cloudflare R2 | Image storage | KES 0 | KES 1,500 |
| Cloudflare | CDN, security | KES 0 | KES 0 |
| Domain | autolist.co.ke | KES 250 | KES 250 |
| **TOTAL** | | **KES 250** | **KES 8,500** |

---

### AI API Costs (Tier 2+)

| Model | Use Case | Cost per 1K calls | Monthly (10K users) |
|-------|----------|-------------------|---------------------|
| Claude Haiku | Search, simple Q&A | KES 100-150 | KES 3,000-8,000 |
| Claude Sonnet | Complex analysis | KES 400-600 | KES 8,000-15,000 |
| Claude Vision | Image analysis | KES 800-1,200 | KES 15,000-30,000 |

**Cost optimization:** Hybrid approach (70% rules, 30% AI) reduces costs by ~70%.

---

### Total Monthly Cost by Phase

| Phase | Users | Infrastructure | AI Costs | Total |
|-------|-------|----------------|----------|-------|
| **MVP (Tier 1)** | < 1K | KES 2,000 - 5,000 | KES 0 | **KES 2,000 - 5,000** |
| **Post-Launch (Tier 2)** | 1K - 10K | KES 8,000 - 15,000 | KES 5,000 - 15,000 | **KES 13,000 - 30,000** |
| **Phase 2 (Tier 3)** | 10K - 50K | KES 20,000 - 40,000 | KES 20,000 - 40,000 | **KES 40,000 - 80,000** |
| **Phase 3 (Tier 4)** | 50K+ | KES 50,000+ | KES 50,000+ | **KES 100,000+** |

---

### Break-Even Analysis

**To cover Tier 2 costs (~KES 25,000/month):**

| Revenue Source | Units Needed |
|----------------|--------------|
| Featured listings (7-day @ KES 500) | 50 listings |
| Featured listings (30-day @ KES 1,500) | 17 listings |
| Dealer subscriptions (@ KES 5,000) | 5 dealers |

**To cover Tier 3 costs (~KES 60,000/month):**

| Revenue Source | Units Needed |
|----------------|--------------|
| Dealer premium subscriptions (@ KES 15,000) | 4 dealers |
| Featured + basic subscriptions mix | ~20 paying customers |

---

## 6. Implementation Timeline

### Recommended: 4-Month MVP + Phase 2 Roadmap

```
MONTH 1: Core Dashboards
├── Week 1-2: Dealer/Seller Dashboard
├── Week 3: Admin Dashboard
└── Week 4: Dealer Verification

MONTH 2: Transactions & Trust
├── Week 5-6: Admin Moderation + Enquiries
├── Week 7: Payments (M-Pesa)
└── Week 8: Featured Listings

MONTH 3: AI Tier 1
├── Week 9: Listing Quality Checker
├── Week 10: Price Positioning
├── Week 11: Smart Search (rules)
└── Week 12: Make/Model Pages + Duplicate Detection

MONTH 4: Polish & Launch
├── Week 13: Vehicle Fit Scores
├── Week 14: Testing & QA
├── Week 15: Performance optimization
└── Week 16: Launch 🚀

POST-LAUNCH (Month 5-6): AI Tier 2
├── Smart Search AI fallback
├── Price Negotiation Assistant
├── Ask-the-Car (limited)
└── Monitor & optimize costs

PHASE 2 (Month 7-12): AI Tier 3
├── AI Vehicle Matchmaker
├── Ownership Cost Forecaster
├── Condition Confidence Score
├── Fraud Prevention Engine
```

---

### Aggressive: 2-Month MVP

```
MONTH 1
├── Week 1-2: Dashboards (basic)
├── Week 3: Admin + Verification
└── Week 4: Payments (M-Pesa only)

MONTH 2
├── Week 5: Featured Listings
├── Week 6: AI Tier 1 (quality + pricing)
├── Week 7: Smart Search (rules only)
└── Week 8: Testing + Launch

AI Scope: Tier 1 only (KES 0/month)
Defer: Tier 2+ to post-launch
```

---

## 7. Discussion Points

### Key Decisions Needed

**1. MVP AI Scope**

| Option | Features | Monthly Cost |
|--------|----------|--------------|
| Tier 1 only | Quality, pricing, search (rules) | KES 0 |
| Tier 1 + partial Tier 2 | + AI search, fit scores | KES 5-10K |
| Tier 1 + full Tier 2 | + Ask-the-car, negotiation | KES 15-20K |

**Recommendation:** Start Tier 1, add Tier 2 features incrementally post-launch.

---

**2. Phase 2 Priority**

Which Tier 3 feature to build first?

| Feature | Value | Complexity | Data Dependency |
|---------|-------|------------|-----------------|
| AI Matchmaker | High | Medium | Low |
| Ownership Cost | High | High | High (external data) |
| Condition Score | Medium | High | Medium (Vision API) |
| Fraud Prevention | High | Medium | Medium (patterns) |

**Recommendation:** AI Matchmaker → Fraud Prevention → Condition Score → Ownership Cost

---

**3. Differentiation Investment**

Which features truly set Autolist apart?

| Feature | Competitor Has? | Differentiation |
|---------|-----------------|-----------------|
| Price positioning | Rare | ⭐⭐⭐ |
| Vehicle fit scores | No | ⭐⭐⭐⭐ |
| Ask-the-car | No | ⭐⭐⭐⭐ |
| Ownership cost | No | ⭐⭐⭐⭐⭐ |
| Import intelligence | No | ⭐⭐⭐⭐⭐ |

---

### What Sets Autolist Apart

| Competitor Gap | Autolist Solution | Tier |
|----------------|-------------------|------|
| No price guidance | Price positioning + negotiation tips | 1 + 2 |
| Poor listings | Quality checker with feedback | 1 |
| Clunky search | Natural language smart search | 1 + 2 |
| No decision help | Vehicle fit scores + matchmaker | 2 + 3 |
| Hidden costs | Ownership cost forecaster | 3 |
| Fraud concerns | Condition scoring + fraud detection | 3 |
| No market insight | Trends + import intelligence | 4 |

---

## 8. Appendix

### A. Feature Viability Summary

| Feature | Viability | Cost | MVP? | Phase |
|---------|-----------|------|------|-------|
| Listing Quality Checker | ✅ High | KES 0 | Yes | 1 |
| Price Positioning | ✅ High | KES 0 | Yes | 1 |
| Duplicate Detection | ✅ High | KES 0 | Yes | 1 |
| Smart Search (Rules) | ✅ High | KES 0 | Yes | 1 |
| Make/Model Intelligence | ✅ High | KES 0 | Yes | 1 |
| Smart Search (AI) | ✅ High | KES 5-10K | Post-launch | 2 |
| Vehicle Fit Scores | ✅ High | KES 0 | Post-launch | 2 |
| Price Negotiation | ✅ High | KES 0-5K | Post-launch | 2 |
| Ask-the-Car | ⚠️ Medium | KES 5-15K | Optional | 2 |
| AI Matchmaker | ⚠️ Medium | KES 10-20K | No | 3 |
| Ownership Cost | ⚠️ Medium | KES 5-10K | No | 3 |
| Condition Score | ⚠️ Medium | KES 10-25K | No | 3 |
| Fraud Prevention | ✅ High | KES 5-15K | No | 3 |
| Market Trends | ✅ High | KES 10-20K | No | 4 |
| Import Intelligence | ⚠️ Medium | KES 15-30K | No | 4 |

### B. Data Requirements

| Feature | Internal Data | External Data |
|---------|---------------|---------------|
| Quality Checker | Listing fields | None |
| Price Positioning | Active listings | None |
| Fit Scores | Vehicle specs | None |
| Ownership Cost | Listings | Fuel prices, service costs, insurance |
| Import Intelligence | None | Auction data, shipping costs, KRA rules |
| Market Trends | 6+ months listings | None |

### C. Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS |
| Backend | Supabase (PostgreSQL, Auth, RLS) |
| Storage | Cloudflare R2 |
| Hosting | Vercel |
| Payments | M-Pesa Daraja, Stripe |
| AI | Claude API (Anthropic) |
| CDN/Security | Cloudflare |

---

## Summary

| Item | Recommendation |
|------|----------------|
| **MVP AI Scope** | Tier 1 (all features) |
| **Post-Launch** | Tier 2 (AI search, fit scores, negotiation) |
| **Phase 2** | Tier 3 (matchmaker, fraud, condition) |
| **Phase 3** | Tier 4 (trends, import intel) |
| **MVP AI Cost** | KES 0/month |
| **Post-Launch AI Cost** | KES 5-20K/month |
| **Total Infra (launch)** | KES 3,000 - 8,000/month |
| **Total Infra (growth)** | KES 15,000 - 30,000/month |
| **Break-even** | 50 featured listings OR 5 dealer subscriptions |
| **Timeline** | 4 months to MVP + 6 months to Phase 2 |

---

**Next Steps**

1. Confirm MVP timeline (2 or 4 months)
2. Approve Tier 1 scope for MVP
3. Prioritize Tier 2 features for post-launch
4. Define Phase 2 roadmap
5. Begin development

---

*Document prepared for Autolist stakeholder review.*
*Version 2.0 — Updated with full AI feature roadmap.*
