# Autolist Infrastructure & Operational Costs

**Date:** February 2026
**Currency:** KES (USD rates converted at ~150 KES/USD)

---

## Cost Summary by Scale

| Scale | Monthly Users | Listings | Monthly Cost (KES) |
|-------|---------------|----------|-------------------|
| **Launch** | < 1,000 | < 500 | 0 - 5,000 |
| **Early Growth** | 1,000 - 10,000 | 500 - 2,000 | 5,000 - 25,000 |
| **Growing** | 10,000 - 50,000 | 2,000 - 10,000 | 25,000 - 75,000 |
| **Scale** | 50,000+ | 10,000+ | 75,000 - 200,000+ |

---

## Base Infrastructure (All Features)

These costs apply regardless of which features you build.

| Service | Purpose | Free Tier | Launch | Growth | Scale |
|---------|---------|-----------|--------|--------|-------|
| **Vercel** | Hosting | 100GB bandwidth | KES 0 | KES 3,000 | KES 7,500 |
| **Supabase** | Database + Auth | 500MB, 50K MAU | KES 0 | KES 3,750 | KES 11,250+ |
| **Cloudflare R2** | Image Storage | 10GB storage | KES 0 | KES 1,500 | KES 7,500 |
| **Cloudflare** | CDN, DNS, WAF | Unlimited | KES 0 | KES 0 | KES 0 |
| **Domain** | autolist.co.ke | - | KES 250/mo | KES 250/mo | KES 250/mo |
| **TOTAL BASE** | | | **KES 250** | **KES 8,500** | **KES 26,500** |

---

## Feature-Specific Infrastructure Costs

### 1. Dealer/Seller Dashboard

| Component | Service | Cost |
|-----------|---------|------|
| Dashboard hosting | Vercel (included) | KES 0 |
| Data queries | Supabase (included) | KES 0 |
| **Monthly Cost** | | **KES 0** |

*No additional infrastructure — uses base stack.*

---

### 2. Admin Dashboard

| Component | Service | Cost |
|-----------|---------|------|
| Dashboard hosting | Vercel (included) | KES 0 |
| Audit logs storage | Supabase (included) | KES 0 |
| **Monthly Cost** | | **KES 0** |

*No additional infrastructure — uses base stack.*

---

### 3. Dealer Verification

| Component | Service | Launch | Growth |
|-----------|---------|--------|--------|
| Document storage | R2 Private Bucket | KES 0 | KES 500-1,500 |
| **Monthly Cost** | | **KES 0** | **KES 500-1,500** |

*Documents stored in R2. ~1MB per dealer verification.*

| Dealers Verified | Storage | Monthly Cost |
|------------------|---------|--------------|
| 100 | ~100MB | KES 0 (free tier) |
| 500 | ~500MB | KES 0 (free tier) |
| 2,000 | ~2GB | ~KES 500 |
| 10,000 | ~10GB | ~KES 1,500 |

---

### 4. Enquiry System

| Component | Service | Free Tier | Launch | Growth |
|-----------|---------|-----------|--------|--------|
| Email notifications | Resend | 3,000/mo | KES 0 | KES 3,000 |
| SMS notifications (optional) | Africa's Talking | - | KES 2/SMS | KES 2/SMS |
| **Monthly Cost (Email only)** | | | **KES 0** | **KES 3,000** |

**Email volume estimate:**

| Enquiries/Month | Emails Sent | Cost |
|-----------------|-------------|------|
| 500 | 1,000 | KES 0 (free tier) |
| 2,000 | 4,000 | KES 3,000 |
| 10,000 | 20,000 | KES 7,500 |

**SMS costs (if enabled):**

| SMS/Month | Cost |
|-----------|------|
| 500 | KES 1,000 |
| 2,000 | KES 4,000 |
| 10,000 | KES 20,000 |

---

### 5. Wishlist & Comparison

| Component | Service | Cost |
|-----------|---------|------|
| Data storage | Supabase (included) | KES 0 |
| **Monthly Cost** | | **KES 0** |

*No additional infrastructure — minimal database rows.*

---

### 6. Featured Listings & Ads

| Component | Service | Cost |
|-----------|---------|------|
| Featured flag storage | Supabase (included) | KES 0 |
| Scheduled jobs (expiry) | Vercel Cron / Supabase | KES 0 |
| **Monthly Cost** | | **KES 0** |

*Revenue-generating feature with zero additional infra cost.*

---

### 7. Payment Integration

#### M-Pesa (Daraja API)

| Component | Cost |
|-----------|------|
| API Access | KES 0 (free) |
| Transaction Fee | **1% of transaction** |
| Minimum balance | KES 0 |

**Transaction fee examples:**

| Transaction | Fee |
|-------------|-----|
| KES 1,000 (featured listing) | KES 10 |
| KES 5,000 (premium package) | KES 50 |
| KES 10,000 (dealer subscription) | KES 100 |

#### Stripe

| Component | Cost |
|-----------|------|
| Monthly fee | KES 0 |
| Transaction fee | **2.9% + KES 45** |

**Transaction fee examples:**

| Transaction | Fee |
|-------------|-----|
| KES 1,000 | KES 74 (7.4%) |
| KES 5,000 | KES 190 (3.8%) |
| KES 10,000 | KES 335 (3.4%) |

*M-Pesa is significantly cheaper for Kenya. Stripe better for international/cards.*

#### Payment Infrastructure Cost

| Monthly Revenue | M-Pesa Fees | Stripe Fees |
|-----------------|-------------|-------------|
| KES 50,000 | KES 500 | KES 1,900 |
| KES 200,000 | KES 2,000 | KES 6,250 |
| KES 1,000,000 | KES 10,000 | KES 29,450 |

**Monthly Cost: Variable (transaction fees only)**

---

### 8. AI Module

#### Tier 1: Rule-Based (No AI API)

| Component | Service | Cost |
|-----------|---------|------|
| Quality checker | Code logic | KES 0 |
| Price positioning | SQL queries | KES 0 |
| Duplicate detection | SQL queries | KES 0 |
| Smart search (rules) | Code logic | KES 0 |
| **Monthly Cost** | | **KES 0** |

#### Tier 2: AI-Enhanced (Claude API)

**Pricing (Claude Haiku - recommended for cost):**
- Input: $0.25 / 1M tokens (~KES 37.50)
- Output: $1.25 / 1M tokens (~KES 187.50)

**Cost per operation:**

| Operation | Tokens | Cost (KES) |
|-----------|--------|------------|
| Smart search query | ~500 | ~0.10 |
| Description suggestion | ~1,500 | ~0.30 |
| Quality analysis | ~1,000 | ~0.20 |

**Monthly cost by usage:**

| Usage Level | Searches | AI Calls | Monthly Cost |
|-------------|----------|----------|--------------|
| Low | 5,000 | 1,500 | KES 1,500 |
| Medium | 20,000 | 6,000 | KES 6,000 |
| High | 50,000 | 15,000 | KES 15,000 |
| Very High | 100,000 | 30,000 | KES 30,000 |

*With hybrid approach (70% rule-based, 30% AI), costs drop by ~70%.*

| Usage Level | Hybrid Monthly Cost |
|-------------|---------------------|
| Low | KES 450 |
| Medium | KES 1,800 |
| High | KES 4,500 |
| Very High | KES 9,000 |

---

### 9. Analytics & Monitoring (Recommended)

| Service | Purpose | Free Tier | Paid |
|---------|---------|-----------|------|
| **Plausible** | Web analytics | - | KES 1,350/mo |
| **PostHog** | Product analytics | 1M events | KES 0 - 7,500 |
| **Sentry** | Error tracking | 5K errors | KES 0 - 4,000 |
| **BetterUptime** | Uptime monitoring | 5 monitors | KES 0 |

**Recommended for launch:** PostHog (free) + Sentry (free) + BetterUptime (free) = **KES 0**

---

## Total Monthly Infrastructure Cost

### By Feature (at Growth Scale ~10K users)

| Feature | Monthly Cost (KES) | Notes |
|---------|-------------------|-------|
| Base Infrastructure | 8,500 | Vercel + Supabase + R2 + Domain |
| Dealer/Seller Dashboard | 0 | Included in base |
| Admin Dashboard | 0 | Included in base |
| Dealer Verification | 500 | Document storage |
| Enquiry System | 3,000 | Email notifications |
| Wishlist & Comparison | 0 | Included in base |
| Featured Listings | 0 | Included in base |
| Payments | Variable | Transaction fees (revenue offset) |
| AI Module (Tier 1) | 0 | Rule-based |
| AI Module (Tier 2) | 4,500 | Hybrid approach |
| Monitoring | 0 | Free tiers |
| **TOTAL (with AI)** | **~16,500** | |
| **TOTAL (without AI Tier 2)** | **~12,000** | |

---

### By Scale

| Scale | Users | Without AI | With AI Tier 2 |
|-------|-------|------------|----------------|
| **Launch** | < 1K | KES 2,000 - 5,000 | KES 3,500 - 7,000 |
| **Early Growth** | 1K - 10K | KES 8,000 - 15,000 | KES 12,000 - 20,000 |
| **Growth** | 10K - 50K | KES 20,000 - 40,000 | KES 30,000 - 55,000 |
| **Scale** | 50K+ | KES 50,000 - 100,000 | KES 70,000 - 130,000 |

*Excludes payment transaction fees (offset by revenue).*

---

## Cost Optimization Tips

### Free Tier Maximization

| Service | Free Limit | How to Stay Under |
|---------|------------|-------------------|
| Vercel | 100GB bandwidth | Use Cloudflare CDN for images |
| Supabase | 500MB database | Archive old data, optimize queries |
| Supabase | 50K MAU | Fine for MVP |
| R2 | 10GB storage | Compress images before upload |
| Resend | 3K emails/mo | Email only on important events |

### AI Cost Reduction

1. **Hybrid search**: Rules handle 70%+, AI only for complex queries
2. **Caching**: Same query = cached result (no API call)
3. **Rate limiting**: Max 10 AI searches per user per hour
4. **Batching**: Process quality checks in batches overnight

---

## Payment Revenue vs Costs

**Break-even analysis:**

| Revenue Source | Price | Transaction Fee | Net |
|----------------|-------|-----------------|-----|
| Featured (7 days) | KES 500 | KES 5 (M-Pesa) | KES 495 |
| Featured (30 days) | KES 1,500 | KES 15 (M-Pesa) | KES 1,485 |
| Dealer verification | KES 2,000 | KES 20 (M-Pesa) | KES 1,980 |
| Premium subscription | KES 5,000/mo | KES 50 (M-Pesa) | KES 4,950 |

**To cover infrastructure (KES 15,000/mo):**
- 30 featured listings (7-day) @ KES 500, OR
- 10 featured listings (30-day) @ KES 1,500, OR
- 3 dealer subscriptions @ KES 5,000

---

## 12-Month Projection

| Month | Users | Listings | Revenue | Infra Cost | Net |
|-------|-------|----------|---------|------------|-----|
| 1 | 500 | 100 | KES 10,000 | KES 3,000 | +7,000 |
| 3 | 2,000 | 400 | KES 40,000 | KES 8,000 | +32,000 |
| 6 | 8,000 | 1,500 | KES 150,000 | KES 15,000 | +135,000 |
| 12 | 25,000 | 5,000 | KES 400,000 | KES 35,000 | +365,000 |

*Assumes 5% of listings pay for featuring, 10% of dealers subscribe.*

---

## Summary for Client

### Key Points

1. **Launch cost is near zero** — free tiers cover MVP
2. **AI is optional** — Tier 1 (rules) costs nothing
3. **Costs scale with success** — more users = more revenue to cover costs
4. **Payments are profitable** — transaction fees are tiny vs revenue
5. **No big upfront infra investment** — pay as you grow

### Budget to Quote

| Phase | Monthly Infrastructure |
|-------|------------------------|
| **MVP Launch** | KES 3,000 - 5,000 |
| **First 6 months** | KES 10,000 - 20,000 |
| **At scale (1 year)** | KES 30,000 - 50,000 |

*All costs are operational only, excluding development.*
