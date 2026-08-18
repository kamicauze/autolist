# Design QA — Listing appointment request

## Visual source and implementation

- Source visual truth: local stakeholder reference image (not checked in)
- Source dimensions: 1024 × 1536 px
- Desktop implementation evidence: local upper-state and form/action screenshots (not checked in)
- Desktop viewport: 1280 × 720 CSS px at the in-app browser's standard density
- Mobile implementation evidence: local responsive screenshot (not checked in)
- Mobile viewport: 390 × 844 CSS px

The reference is a full-page concept, while the implementation is a responsive modal within the existing listing page. The comparison therefore evaluates hierarchy, date/time controls, request-only messaging, summary, form, privacy treatment, and primary action rather than matching full-page geometry.

## Comparison history

1. The first implementation comparison found two material visual issues: a low-contrast close control and blue appointment accents that diverged from the reference and the active theme.
2. The close control was corrected to use accessible theme tokens.
3. Selected time and primary appointment action states were changed to the theme's orange secondary accent.
4. The source and both final desktop states were reviewed together in one comparison input. The two-week date grid, one-hour time choices, details form, request summary, request-only language, and orange action treatment are aligned with the source intent.
5. Availability dots and availability claims were intentionally omitted because the product does not currently collect seller availability. Showing them would communicate unsupported data.

## Interaction and responsive checks

- Opened the appointment request from the listing's seller card.
- Confirmed exactly 14 Nairobi calendar dates, from 7–20 August 2026 in the fixed verification state.
- Selected the 10:00 AM–11:00 AM time and confirmed the summary updated.
- Confirmed the details form, optional 250-character message, seller-confirmation checkbox, and request action remain accessible while scrolling.
- Exercised the missing-confirmation validation without submitting a real request.
- Confirmed the modal stacks and scrolls at 390 × 844 without horizontal overflow.
- Confirmed the seller's separate “Message the Seller” form remains available.

## Console and known differences

- No runtime console errors were observed.
- One pre-existing listing-image LCP warning was observed and is outside this appointment surface.
- The implementation uses the dedicated appointment-request endpoint and first-class appointment records; it does not claim real-time availability or create a reservation.
- No actionable P0, P1, or P2 visual defects remain.

## Final result

passed
