# Coastline — Final QC (post Phase D)

Generated: 2026-05-12
Build: `coastline-prototype` @ `ec1d836` (branch `claude/coastline-widget-prototype-zqrB2`)
Viewports tested: mobile 375×812, desktop 1440×900
Paths walked to completion: new-patient + returning-patient, on both viewports.

## Final verdict

**READY TO EMBED ON /work.**

All 14 build-checklist items pass (one with a wording nuance, noted). All 16 captured stages render and behave correctly across both viewports. Zero console errors. No blocking visual issues — the open items are documented decisions/limitations from the phased refactor, not defects.

---

## Build checklist — pass/fail

| # | Item | Result | Notes |
|---|---|---|---|
| 1 | Established-patient flow is 4 stages visible (Service → Gate → Schedule → Confirmation, with Gate gating new/returning) | ✅ PASS | Flow is Service → Gate ("Have you visited us before?") → Schedule → Confirmation. Confirmation is the terminal screen and is uncounted, so the visible progress counter spans the 3 counted steps; "4 stages" if Confirmation is counted as a stage. The Gate branches new vs returning. |
| 2 | Service menu visible on landing with category filters | ✅ PASS | Landing shows 4 category accordions — Injectables (2), Skin Treatments (2), Hair & Body (3), Wellness (1) — plus a "Search services" box. |
| 3 | Prices visible per `siteConfig.pricingVisibility = 'show'` | ✅ PASS | Service cards show literal prices: Botox $50, Dermal Filler $75, Microneedling $50, Chemical Peel $50, Laser Hair Removal $75, PRP/Hair Restoration $100, Body Contouring $100, IV Therapy $40. |
| 4 | No "consultation" framing for established-patient bookings | ✅ PASS | DOM scan for `/onsultation/i` on every screen of both paths → zero matches. Service names are "Botox", "Dermal Filler", etc.; headings "Book appointment" / "Choose your treatment" / "Pick a time & your details". |
| 5 | New patient routes through GFE messaging (yellow banner) | ✅ PASS | After "I'm new here", the Schedule screen shows the amber callout: "Heads up — since this is your first visit with us, you'll meet your provider for a brief good-faith exam before treatment. This is required in **Georgia** and supports your safety. Your treatment session can be booked right after, on the same visit when possible." (state name from `siteConfig.state`). |
| 6 | Returning patient skips GFE messaging | ✅ PASS | After "I've been here before", the Schedule screen has **no** GFE banner — it opens directly at "Pick a time & your details". Verified on both viewports (`mobile_07`, `desktop_07`). |
| 7 | Form fields at Schedule: name, email, phone, dob, reason, source, plus policy checkbox | ✅ PASS | Fields present: Full name*, Email*, Phone*, Date of birth*, Reason for visit / goals (optional), How did you hear about us?* — plus an "I agree to the cancellation policy." * checkbox and a "Read cancellation policy" expander. |
| 8 | Confirmation includes prep instructions for next session | ✅ PASS (wording note) | The confirmation's "What to expect" block (in the patient-email preview) reads: "Your appointment is confirmed. Please arrive 10 minutes early to complete intake paperwork. If you need to reschedule, call us at the number on your confirmation." → prep instructions for the upcoming visit. There is no literal "next/treatment session" reference on the confirmation (intentionally removed in Phase C — this is a direct-booking model; for new patients, the "treatment session can be booked right after" expectation is set on the Schedule screen's GFE banner). Prep guidance is present; the "next session" phrasing isn't. |
| 9 | No placeholder tokens visible (`[Med Spa Name]`, etc.) | ✅ PASS | DOM regex scan for `[Med Spa…]` / `[practice-domain…]` / `[Spa Phone…]` on every screen of both paths → zero matches. Address shows "123 Main St, Suite 100, Atlanta, GA 30309"; phone "(555) 123-4567"; email sender "Coastline Med Spa <bookings@coastlinemedspa.com>" — all from `siteConfig`. |
| 10 | No hardcoded codename branding ("Coastline" appears only as the intentional `siteConfig.brandName` demo value) | ✅ PASS (one fallback note) | Banner wordmark renders `siteConfig.brandName` = "Coastline Demo"; emails/footer/address render `siteConfig.practiceName` / `emailSenderName` = "Coastline Med Spa". Nothing in source hardcodes "Coastline" as a codename anymore. Note: `index.html`'s static `<title>` still says "Coastline — Booking Widget" as the pre-paint fallback before `main.jsx` overrides it to "Coastline Demo — Booking" on mount (documented as acceptable in Phase D — a brief flash on cold loads). Browser tab reads "Coastline Demo — Booking" once the app mounts. |
| 11 | No "HIPAA-compliant" claim anywhere | ✅ PASS | DOM scan for `/HIPAA/i` on every screen → zero matches. Footer is just "Powered by RIVR". |
| 12 | Step counter stable: "Step 1 of 3", "Step 2 of 3", "Step 3 of 3", no bar on confirmation | ✅ PASS | Verified on both viewports and both paths: Service → "Step 1 of 3: Service"; Gate → "Step 2 of 3: Patient"; Schedule → "Step 3 of 3: Schedule"; Confirmation → no progress bar (`stepIndex < 0` → renders `null`). Denominator never changed; no "X of N" with X > N. |
| 13 | Mobile (375×812) renders without overflow or broken layout | ✅ PASS | Reviewed `mobile_01`–`mobile_08`. No horizontal overflow, no clipped/overlapping elements, no untappable controls. The new-patient Schedule (the longest screen) and the Confirmation+email-previews stack cleanly. |
| 14 | Desktop (1440×900) renders cleanly | ✅ PASS | Reviewed `desktop_01`–`desktop_08`. The widget is a fixed-width embed (`max-w-[420px]`) centered on a white page — by design it doesn't expand to full-width; it renders cleanly with surrounding whitespace, no breakage. |

---

## Captured stages — pass/fail

All 16 captured; all PASS. Files in `phase-d-final-qc/`.

### Mobile (375×812)

| File | Stage | Result |
|---|---|---|
| `mobile_01_landing.png` | Service grid landing | ✅ "Step 1 of 3: Service"; "Coastline Demo" wordmark + teal gradient; "Book appointment" tag; "Choose your treatment" heading; "Book your appointment in under a minute." subhead; 4 category accordions + search; footer "Powered by RIVR". |
| `mobile_02_service_selected.png` | Botox selected | ✅ Botox highlighted (`aria-pressed=true`); format toggle pill row below the card ("FORMAT" + In-person* / Virtual); Continue enabled. |
| `mobile_03_gate.png` | Patient gate | ✅ "Step 2 of 3: Patient"; "Have you visited us before?"; subhead present; two tap targets ("I'm new here" / "I've been here before"); Back + (disabled) Continue. |
| `mobile_04_schedule_new_gfe.png` | New-patient Schedule | ✅ "Step 3 of 3: Schedule"; **yellow GFE banner referencing Georgia**; "Pick a time & your details"; "In-person at Coastline Med Spa" badge; "You'll be seeing Dr. Sarah Chen, MD…" + "See other providers"; calendar; 6 intake fields; policy checkbox + "Read cancellation policy"; Back + (disabled) Continue. |
| `mobile_05_schedule_filled.png` | Schedule filled | ✅ Date (Tue May 12 2026) + time (9:00 AM) picked, intake filled with test data, policy checked, Continue enabled. |
| `mobile_06_confirmation_new.png` | Confirmation (new) | ✅ "You're booked!"; no progress bar; appointment card has **no "Fee paid" row and no "Card" row**; Location "Coastline Med Spa · 123 Main St, Suite 100, Atlanta, GA 30309"; patient email "Your Botox is confirmed" from "Coastline Med Spa <bookings@coastlinemedspa.com>", "What to expect" prep text, **no Receipt block**; spa email subject **"New appointment booked — Botox"**, "Patient type: new", **no "Payment confirmed" line**; no placeholder tokens; no "consultation" anywhere. |
| `mobile_07_schedule_returning_no_gfe.png` | Returning-patient Schedule | ✅ "Step 3 of 3: Schedule"; **no GFE banner** — opens at "Pick a time & your details"; (Microneedling = single-provider → "Amanda Reyes, LE" assigned, no "See other providers" link, correctly). |
| `mobile_08_confirmation_returning.png` | Confirmation (returning) | ✅ "You're booked!"; no progress bar; Service "Microneedling"; no payment artifacts; "Patient type: returning"; spa subject "New appointment booked — Microneedling"; no placeholder tokens; no "consultation". |

### Desktop (1440×900)

| File | Stage | Result |
|---|---|---|
| `desktop_01_landing.png` | Service grid landing | ✅ Same as mobile, widget centered, fixed width — clean. |
| `desktop_02_service_selected.png` | Botox selected | ✅ Botox highlighted; format toggle pill row visible; Continue enabled. |
| `desktop_03_gate.png` | Patient gate | ✅ "Step 2 of 3: Patient"; "Have you visited us before?". |
| `desktop_04_schedule_new_gfe.png` | New-patient Schedule | ✅ "Step 3 of 3: Schedule"; yellow GFE banner with Georgia; all 6 intake fields + policy checkbox; clean layout. |
| `desktop_05_schedule_filled.png` | Schedule filled | ✅ Date/time picked, intake filled, policy checked, Continue enabled. |
| `desktop_06_confirmation_new.png` | Confirmation (new) | ✅ "You're booked!"; no progress bar; no "Fee paid"/"Card"; emails from "Coastline Med Spa <bookings@coastlinemedspa.com>"; spa subject "New appointment booked — Botox"; no "Payment confirmed"; address present; no placeholders; no "consultation". |
| `desktop_07_schedule_returning_no_gfe.png` | Returning-patient Schedule | ✅ "Step 3 of 3: Schedule"; **no GFE banner**. |
| `desktop_08_confirmation_returning.png` | Confirmation (returning) | ✅ "You're booked!"; no progress bar; Service "IV Therapy"; no payment artifacts; "Patient type: returning"; spa subject "New appointment booked — IV Therapy"; no placeholders; no "consultation". |

> Automation note: the returning-path desktop run initially stalled on the Schedule "Continue" because the test set the referral select to "Friend" (the actual option value is "Friend/Family") — a test-data slip, not a product bug. Re-running with the correct option value advanced cleanly to Confirmation. (Other selectable options confirmed: Google, Instagram, Friend/Family, Yelp, Other.)

---

## Console errors

**Zero.** Per-navigation error count was 0 on every step of every path/viewport. (The session-wide Playwright log carries a batch of stale `net::ERR_CONNECTION_REFUSED` entries from earlier dev-server restarts during this engagement — not produced by the app under test. No JS/React errors, no resource 404s, no warnings.)

---

## Visual issues observed

None blocking. For completeness:

- **`index.html` static `<title>`** still reads "Coastline — Booking Widget" (the pre-paint fallback). `main.jsx` sets `document.title` from `siteConfig.brandName` on mount → "Coastline Demo — Booking". Cold loads briefly show the static title before the override. Documented as acceptable in Phase D; could be eliminated via a Vite HTML transform if pre-paint title matters in production.
- **Format toggle placement.** When a multi-format service is selected, the In-person/Virtual toggle renders as a small pill row *directly below* the service card (not inside it — `<button>` nesting isn't valid HTML). Functionally fine; visually it reads as attached but is technically a sibling element.
- **Email-preview internal banner** (the "Confirmed / You're all set" header inside the patient-email mock) still uses Tailwind `coast-*` gradient classes rather than `siteConfig.primaryColor`. Out of Phase D's stated scope (which scoped the brand-color change to the widget `Banner` only); the rest of the widget UI likewise still uses `coast-*` classes — full theming would need CSS custom properties.
- **`requiresDeposit: true` + `pricingVisibility: 'hide'`** (an unusual config combo, not the default): the Checkout "Deposit" order-summary line correctly omits the amount, but the "Pay $X and Book" button still shows the amount. Intentional — you must disclose the charge on the payment screen. The brief's verification didn't flag this; documented in Phase D.
- The new-patient GFE banner is ~4 lines at 375px — fits within its `p-3` callout without overflow.

---

## Reference: phase history on this branch

`563bac7` (baseline) → `52c2a4a` Phase A (strip consultation framing + unverified claims) → `6dbe9b4` chore (gitignore QC dirs) → `25c76b4` Phase B (4-stage flow + new-patient gate) → `4029078` Phase C (confirmation cleanup + scrub "consultation" + GFE copy) → `8c633e4` Phase C followup (cancellation-policy copy) → `ec1d836` Phase D (centralized siteConfig, brand color, logo, per-service overrides).
