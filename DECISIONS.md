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

## Round 3 — New York editorial system

- Preserve the approved Inter Tight home hero and the existing motion engine. New design rules live in the marked **NY design system (round 3)** section at the end of global.css, separate from Claude's font/performance changes.
- Huge uppercase type is reserved for page openings and next-project invitations. Project indexes, captions and body copy use distinct sizes, tracking and leading. Selected-work titles get their own columns instead of overlapping photos.
- Contact is a statement followed by one light panel with large native links for WhatsApp, Telegram, Viber, call, Instagram, Pinterest and email. At 320px the channel list becomes one column; wider phones use two. Service information follows the actions in both DOM and visual order.
- Reuse CMS social/contact fields; do not invent accounts, services, statistics or client claims. Booking remains direct-only; no form is restored. Move existing contact UI copy into the three-language dictionary.
- Pinterest was supplied by Ian: https://www.pinterest.com/ellinayatsenyuk/ . Store it after Instagram in each locale's socials array. Existing footer/menu loops and JSON-LD sameAs inherit it; the contact component's large variant also exposes it.
- Keep compact inline messenger links in the menu/footer with 44px minimum hit areas. The phone menu scrolls internally when its content exceeds the viewport, with readable, fitted Russian labels.

## Round 3 — speed (Claude Code)

- The motion bundle and lazy photos start after the first contentful paint. The opening text never waits on them, and motion begins one frame later than before, which isn't visible. Window `load` is not a trigger, because it can fire before the first paint.
- Lazy `Frame` photos use deferred `srcset` plus `<noscript>`, not a JS-only lazy loader: no-JS visitors and crawlers still get real `<img>` tags.
- Fonts: `font-display: swap` with a measured fallback, not `optional`. `optional` would leave first-time phone visitors on Arial for the whole page, and the uppercase Inter Tight hero is the identity. The per-language preload makes the swap rare.
- Analytics load at idle, after the motion bundle. Speed Insights still reports this page's LCP and CLS from buffered entries.
