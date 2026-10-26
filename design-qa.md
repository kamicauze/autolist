# Login vehicle-panel refinement QA

- Visual direction: the supplied mobile.de account reference plus the preceding
  local two-panel Autolist login implementation.
- Implementation: `http://localhost:3000/login`
- Vehicle asset: existing `public/hero-car.jpg` (1920 x 1280).
- Matched desktop comparison: previous and refined implementations reviewed side
  by side from a 1600 x 709 browser capture (1333 x 591 CSS viewport at the
  active browser density).
- Responsive check: 390 x 844 viewport.

## Review

- The login shell is vertically centered: the measured desktop card gaps were
  approximately 19 CSS pixels above and below the card.
- The right panel now uses a full-bleed, real vehicle photograph while preserving
  the existing Autolist benefits and truthful account copy.
- Benefit text sits in a floating glass panel using a 70%-opaque white surface,
  backdrop blur, translucent border, and soft shadow. Text contrast remains clear
  over the image.
- Form spacing and controls were compacted so the complete sign-in action remains
  visible without scrolling in the checked desktop viewport.
- At 390 x 844, the form and vehicle panel stack cleanly without horizontal
  overflow; the glass panel remains readable over the image.
- No P0, P1, or P2 visual issues remain in the checked unauthenticated login state.

## Previous verified surface

The preceding appointment-request QA record used a 1024 x 1536 stakeholder
reference, a 1280 x 720 desktop viewport, and a 390 x 844 mobile viewport. It
verified the 14-day Nairobi request flow, one-hour selection, request summary,
privacy/confirmation treatment, responsive scrolling, and the absence of
unsupported real-time availability claims. That surface passed with no P0, P1,
or P2 visual defects; one pre-existing listing-image LCP warning remained out of
scope.

## Final result

passed

---

# Careers, advertising, About and search follow-up QA — 26 October 2026

Source truth: Autolist Dev Team images15:31(Careers),15:38(Advertising),15:52(About),15:53(feedback CTA),16:02(equipment order),16:06(bike/truck dropdown). Comparison evidence lives in ignored output/playwright/visual-search-followup-2026-10-26/.

Source captures are3024x1898 pixels; hero crops1098x438(Careers),1097x438(Advertising); About crop778x1020. Mockups have no declared CSS viewport. Normalize source and rendered content regions to700px common width, excluding header/browser/WhatsApp chrome. Desktop implementation1440x900 CSS px at1x; mobile390x900 at1x. This is a composition comparison, not a claim of pixel-identical photography.

Combined comparison inputs: comparison-before-{careers,advertise-with-us,about}.png and comparison-after-{careers,advertise-with-us,about}.png. Final browser captures local-final-{careers,advertise-with-us,about}-{1440,390}.png. Focused controls: local-farm-order.png and local-plant-mobile.png. The About reference bottom is partially occluded in native capture; the explicit15:53 annotation supplies the exact CTA wording.

Initial P2: excessive hero height compared with reference. Reduced hero padding; Careers/Advertising image slots changed4:3 to3:2. Rebuilt, recaptured and compared again. Final heights525px(Careers),510px(Advertising),460px(About). No remaining actionable P0/P1/P2 in the scoped states.

Required fidelity surfaces:
- Typography: existing Satoshi/font-heading, navy heading hierarchy, small uppercase blue labels, readable body/support copy; natural mobile wrapping.
- Spacing/layout: paired desktop text/imagery, stacked mobile, values cards, CMS body and lower image CTA. No horizontal overflow at1440/390; controls remain visible.
- Colors/tokens: existing primary blue, navy/gray text, white/light-blue backgrounds and existing theme/footer conventions.
- Images: four separately generated WebPs reproduce the reference subjects and art direction; total under650KB. Actual image URLs load. These are illustrative scenes, not claimed photographs of Autolist staff/premises. Real editable text and links sit beside images.
- Copy: existing published CMS title/summary/body/date/metadata and unpublished handling preserved. About facts describe existing marketplace behavior rather than unconfirmed founding/team figures. Draft Careers jobs/benefits remain pending. Advertising keeps the approved offer/pricing content and secondary package navigation. About Road ahead explicitly uses Send us feedback.

Interactions: About CTA opens /inquiries-assistance#inquiry-form with actual contact/subject/message fields. Careers anchors work. Honda bike count1 matches1 result; Volvo truck count0 matches empty results. Farm/Plant show Location,Category,Manufacturer,Year in DOM/geometry; Tractors+John Deere count2 matches2 results. Plant custom manufacturer and Reset all work. Native Bike/Truck Make selects retain category catalogs; non-car Model stays manual because no catalog exists. No actual submissions/emails. IAB warning/error log empty for checked local flows. CMS route render assertions, focused tests, scoped lint and production TypeScript/build pass.

P3 follow-up: generated people/vehicles differ from the illustration, and responsive image panels replace full-width photographic composites. This preserves the source subject/hierarchy without embedding UI text into raster art. No pixel-identical asset claim.

Implementation checklist: scoped controls, four assets, CMS preservation, real CTA navigation, desktop/mobile coverage, post-fix combined comparison and browser-error review complete.

final result: passed
