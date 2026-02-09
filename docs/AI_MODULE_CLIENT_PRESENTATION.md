# Autolist AI Module – Client Presentation Plan

**Prepared for:** Client Meeting
**Date:** February 2026
**Status:** Proposal / Discussion Document

---

## Executive Summary

This document outlines the AI capabilities we recommend for Autolist, organized into three tiers based on value, complexity, and cost. Our recommendation is to start with high-impact, low-cost features that don't require external AI services, then progressively add AI-powered features as the platform scales.

---

## AI Features Overview

### Tier 1: Smart Foundations (No AI API Required)

These features use rule-based logic and your own data. Zero ongoing AI costs.

| Feature | What It Does | User Benefit | Effort |
|---------|--------------|--------------|--------|
| **Listing Quality Checker** | Flags missing fields (mileage, transmission, photos) | Better listings, more enquiries | 3-5 days |
| **Price Intelligence** | Compares price against similar vehicles on Autolist | "Below Market" / "Fair Price" / "Above Market" labels | 3-5 days |
| **Duplicate Detection** | Flags potential duplicate listings for admin review | Cleaner marketplace, more trust | 1 week |
| **Smart Search Bar** | Parses natural language queries into filters | "Toyota SUV under 2M Nairobi" just works | 1 week |

**Total Effort:** 3-4 weeks
**Ongoing Cost:** KES 0

---

### Tier 2: AI-Enhanced Features (Light AI Usage)

These features use AI APIs for better accuracy. Low ongoing costs.

| Feature | What It Does | User Benefit | Monthly Cost* |
|---------|--------------|--------------|---------------|
| **Smart Search (AI Fallback)** | Understands complex queries AI helps when rules fail | Handles "reliable family car", typos, Swahili | ~KES 4,000-8,000 |
| **Description Improvement Suggestions** | AI suggests how to improve listing descriptions | Higher quality listings | ~KES 2,000-5,000 |
| **Listing Quality Scoring** | AI rates listing quality (1-10) with specific feedback | Sellers know exactly what to fix | ~KES 3,000-6,000 |

*Costs based on 10,000-20,000 monthly interactions using Claude Haiku (fast, affordable model)

**Total Effort:** 2-3 weeks (on top of Tier 1)
**Ongoing Cost:** ~KES 5,000-15,000/month at moderate scale

---

### Tier 3: Advanced AI Features (Post-MVP)

These require more infrastructure and higher AI usage. Recommended for Phase 2.

| Feature | What It Does | Why Wait |
|---------|--------------|----------|
| **Inventory Chatbot** | Conversational vehicle discovery | Higher cost, needs chat UI, better after Tier 1 proves value |
| **Image Quality Analysis** | AI reviews photos for clarity, angles, lighting | Requires vision API, higher cost |
| **Semantic Duplicate Detection** | Catches rewording, similar photos | Needs embeddings infrastructure |
| **Predictive Pricing** | Suggests optimal listing price | Needs historical sold data (6+ months) |
| **Fraud Detection** | Flags suspicious listings automatically | Needs training data on fraud patterns |
| **WhatsApp Integration** | Chat with inventory via WhatsApp | Separate integration project |

---

## Recommended MVP AI Scope

Based on your PRD and current development stage, we recommend:

### ✅ Include in MVP

1. **Listing Quality Checker** (Rule-based)
   - Validates completeness before submission
   - Flags: missing mileage, few photos, short description
   - Shows sellers exactly what to improve
   - *Zero AI cost*

2. **Price Positioning** (Rule-based)
   - Compares against similar vehicles in your database
   - Shows buyers: "Below Market" / "Fair Price" / "Above Market"
   - Builds trust, helps decision-making
   - *Zero AI cost*

3. **Basic Duplicate Detection** (Rule-based)
   - Flags listings with same make+model+year+similar mileage+similar price
   - Admin reviews before removal
   - Keeps marketplace clean
   - *Zero AI cost*

4. **Smart Search Bar** (Hybrid: Rules + AI fallback)
   - Parses: "toyota suv automatic under 3m nairobi"
   - Rule-based handles 70-80% of queries (free)
   - AI handles complex queries (low cost)
   - *~KES 5,000-10,000/month*

### ⏸️ Defer to Phase 2

- Full chatbot experience
- Image quality analysis
- Predictive pricing
- WhatsApp integration
- Advanced fraud detection

---

## How Each Feature Works

### 1. Listing Quality Checker

**Seller Experience:**
```
Creating Listing...

⚠️ Improve Your Listing:
├── ❌ Add mileage (listings with mileage get 40% more views)
├── ❌ Add at least 6 photos (you have 2)
├── ⚠️ Description is short (add more details about condition)
└── ✅ Price, make, model, year all complete

[Fix Issues] [Save as Draft]
```

**Admin Experience:**
- See quality score for each pending listing
- Prioritize review of high-quality submissions
- Reject low-effort listings with one click

---

### 2. Price Positioning

**Buyer Experience:**
```
┌─────────────────────────────────────┐
│ 2019 Toyota Land Cruiser Prado     │
│ KES 6,500,000                       │
│                                     │
│ 🟢 Below Market Price               │
│ Similar vehicles: KES 6.8M - 7.5M  │
└─────────────────────────────────────┘
```

**Seller Experience:**
```
Your Price: KES 6,500,000

📊 Market Comparison (12 similar vehicles):
├── Lowest:  KES 5,900,000
├── Average: KES 7,100,000
├── Highest: KES 8,200,000
└── Your position: Below average (competitive)

💡 Tip: Vehicles priced 5-10% below average sell 2x faster
```

---

### 3. Smart Search Bar

**Buyer Experience:**
```
┌─────────────────────────────────────────────────────┐
│ 🔍 "toyota hilux diesel under 4m mombasa"           │
└─────────────────────────────────────────────────────┘

Applied Filters: [Toyota] [Hilux] [Diesel] [< KES 4M] [Mombasa]

Found 18 vehicles
```

**What It Understands:**
- Makes & models: "toyota", "land cruiser", "hilux"
- Price: "under 2m", "below 3 million", "2-4m range"
- Location: "nairobi", "mombasa", "kisumu"
- Specs: "automatic", "diesel", "4x4"
- Year: "2020 or newer", "2018-2022"
- Mileage: "low mileage", "under 100k km"

---

## Integration with Dashboards

### Dealer Dashboard (Analytics)

| Metric | AI Enhancement |
|--------|----------------|
| Views per listing | + Quality score correlation |
| Enquiries per listing | + Price position correlation |
| Top performers | + "Why it's performing" insights |
| Underperformers | + "How to improve" suggestions |

### Admin Dashboard (Moderation)

| Feature | AI Enhancement |
|---------|----------------|
| Pending listings | + Quality score for prioritization |
| Duplicate alerts | + Confidence score |
| Suspicious listings | + Risk flags (future) |
| Bulk actions | + AI-assisted categorization |

---

## Cost Summary

### MVP (Recommended)

| Item | One-Time | Monthly |
|------|----------|---------|
| Listing Quality Checker | Dev cost | KES 0 |
| Price Positioning | Dev cost | KES 0 |
| Duplicate Detection | Dev cost | KES 0 |
| Smart Search (Hybrid) | Dev cost | KES 5,000-15,000 |
| **Total** | **3-4 weeks dev** | **KES 5,000-15,000** |

### Phase 2 (Optional Add-ons)

| Item | One-Time | Monthly |
|------|----------|---------|
| Full Chatbot | 2-3 weeks dev | KES 15,000-40,000 |
| Image Analysis | 1-2 weeks dev | KES 10,000-25,000 |
| WhatsApp Bot | 3-4 weeks dev | KES 20,000-50,000 |

*Costs scale with usage. Estimates based on 10,000-30,000 monthly active users.*

---

## Why This Approach?

### Start Simple, Prove Value

```
MVP Launch
    │
    ├── Measure: Do quality scores correlate with enquiries?
    ├── Measure: Does price positioning increase trust?
    ├── Measure: Does smart search increase conversions?
    │
    ▼
Data proves value → Invest in Phase 2 AI
```

### Low Risk

- Tier 1 features have **zero ongoing AI costs**
- Smart search AI is a **fallback**, not dependency
- If AI APIs have issues, system still works
- Can switch AI providers without rebuilding

### Aligned with PRD

Your PRD states:
> "AI will be introduced in a controlled, MVP-light manner to enhance quality without adding operational risk."

This plan follows that principle exactly.

---

## Questions for Discussion

1. **Priority:** Which AI feature is most important to your dealers?
   - Quality feedback that helps them improve?
   - Price insights that help them compete?
   - Easier search that brings more buyers?

2. **Budget:** What's the acceptable monthly AI cost?
   - KES 0 (rule-based only)
   - KES 5,000-15,000 (smart search + light AI)
   - KES 30,000+ (full AI suite)

3. **Timeline:** When do you want AI features live?
   - MVP launch (Tier 1 only)
   - 1 month post-launch (add Tier 2)
   - Phase 2 (full AI suite)

4. **Differentiation:** Which feature would set you apart from competitors?
   - Price transparency (builds trust)
   - Smart search (better UX)
   - Quality enforcement (cleaner marketplace)

---

## Recommended Next Steps

1. **Approve Tier 1 scope** for MVP inclusion
2. **Decide on Smart Search**: Rule-based only vs. Hybrid with AI
3. **Define success metrics** for AI features
4. **Plan Phase 2** AI roadmap based on MVP learnings

---

## Appendix: Technical Notes

### AI Provider Recommendation

| Provider | Best For | Cost |
|----------|----------|------|
| **Claude (Anthropic)** | Text understanding, function calling | $0.25-3 per 1M tokens |
| **OpenAI GPT-4** | General purpose | $0.50-10 per 1M tokens |
| **Local LLM** | High volume, cost control | Server costs only |

**Recommendation:** Start with Claude Haiku (fast, cheap, reliable) for MVP.

### Data Requirements

| Feature | Data Needed |
|---------|-------------|
| Price Positioning | 50+ listings per make/model for accuracy |
| Duplicate Detection | Listing history |
| Predictive Pricing | 6+ months of sold listings |

### Infrastructure

- No additional infrastructure for Tier 1
- Tier 2 requires API keys (Claude/OpenAI)
- Tier 3 may require vector database (Supabase pgvector)

---

*Document prepared by [Your Company] for Autolist client discussion.*
