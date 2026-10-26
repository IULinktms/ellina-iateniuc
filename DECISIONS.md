# Site v3 decisions

## 2026-10-26 — Scope split

Codex owns audit, verified Instagram, Russian surname correction, persisted language-switch path repair, audited heading clipping, and workstreams 2–4. Claude Code owns workstreams 5–8 on a separate worktree. Changes to shared styles are appended in labeled sections; Base changes are limited to the viewer and conversion surfaces. No production deployment or main push.

## Next-story navigation

Scroll-to-advance is an explicitly enabled desktop enhancement, with visible instructions, progress and Escape cancellation. Ordinary click/keyboard navigation remains available; touch and reduced-motion visitors get the ordinary link. An unannounced automatic page change would interfere with reading credits and booking. The image keeps the existing cover transition name.

## Viewer metadata

The caption line contains real frame number, project year and content caption/alt. No fabricated camera/EXIF settings are shown. Zoom is 1–4×, with adjacent preloading; swipe navigation is suspended during pinch/pan.

## Home proof and opening sequence

Unverified totals show a dash, not invented numbers. The existing five-working-day gallery promise is retained. Testimonials and client wordmarks are visibly TODO and editable in all languages; `proofPlaceholder` stays on until the owner approves replacements. New optional arrays default empty so older CMS entries remain valid.

The hero proposition is immediately readable. Its theatrical shutter happens on the first scroll and freezes onto the same source image used by the contact sheet's opening exposure. This preserves the visual story without hiding first-screen text behind an intro. Coordinated with Claude Code's deferred media delivery.

## Booking and direct contact

The form enhances four semantic fieldsets into steps; without JavaScript all fields remain visible. Date is optional, past dates are rejected, and the delivery calculator query parameter is retained. Errors focus the relevant field, request failures preserve input for retry, and successful requests show an editable three-step timeline. The endpoint, honeypot, timestamp and Turnstile contract are unchanged. Verification intercepts requests locally and sends no real email.

Messenger fields are editable and shared through CMS. Empty or invalid destinations and the existing zero-filled phone placeholder do not render as contact actions. Owner-supplied numbers/accounts are required before these buttons can go live; a generic messenger homepage is not a usable contact destination.

A final font-settled review corrected the upstream contact-sheet pin refresh order so the downstream film strip cannot cover the new proof section. Claude requested a small home film accessible-name adjustment and conditional SplitText heading labels; these integration changes are included without taking over workstreams 5–8.

## Round 2 — content and flow

- Keep events first and brand/social media content equally explicit in hero, services, home statement, about and SEO. Ian clarified that salons are only one example; the neutral category enum is `Brands`.
- No new brand project or stock-image portfolio claim. A CMS discipline can omit its hover image and inherit the first published matching project cover; an empty category has no public filter or tile.
- Retain the existing `Reel` enum for old content and add `Reels`, plus a separate `aspectRatio` field (landscape by default, portrait for 9:16). Claude owns the matching presentation/player work.
- Proof is evaluated per field, not by a manual public “demonstration” switch. Empty/TODO names and quotes, invalid optional attribution, and absent/zero counts do not render. No proof content means no section. The existing five-day gallery promise is valid content.
- Keep all four selected projects and seven run-of-show moments. Put selected work before explanatory sections, remove the decorative middle marquee, reduce blank space, and coordinate pin-distance changes with Claude.
