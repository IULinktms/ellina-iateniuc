# Aperture — baseline audit

Audit date: 2026-10-26. Baseline commit: `4ee22a8`. Task branch: `IULinktms/site-v3-audit-and-upgrade-pmwp`.

## Scope and method

Verified `src/lib/i18n.ts` and `src/pages/[...lang]/` before proceeding. Read AGENT-PROMPT.md and the current architecture. Installed with `NODE_ENV=development npm install`; the shell resolves Node 22.22.3, below Astro 7.4.2's requirement. Used the already-installed `/opt/homebrew/bin/node` (26.12.1) for Astro; no system upgrade or service restart.

Dev baseline: http://127.0.0.1:4321, explicitly development mode. Chromium screenshots and DOM inspection cover home, portfolio, films, about, contact and all seven project stories in Romanian, Russian and English, plus missing-page paths, at 375×812, 1024×768 and 1440×900. Additional reduced-motion layout probes cover 320, 768 and 1920. Local evidence is under gitignored `screenshots/<lang>/<width>/`, with top and full-page captures, `walk.json`, `extra.json`, `interactions.json`, `followup.json` and `lighthouse/`. Full-page captures follow a complete scroll to trigger lazy assets/reveals; fixed headers can appear at the capture scroll position. No email was sent; success/error requests were intercepted locally.

`npm run preview` fails because @astrojs/vercel does not support preview. Lighthouse therefore measured the unchanged `.vercel/output/static` build through a local static HTTP server on 4322 (fresh headless Chromium, incognito, Lighthouse mobile simulated throttling). This is a local baseline, not production/CDN performance or an end-to-end API test. The simple baseline server has no compression/cache headers, which contributes to its scores.

## Ranked findings

| Priority | Before / evidence | Recommended after | Why |
| --- | --- | --- | --- |
| P1 | Contact heading clips at 375 in RO (`evenimentul`) and RU (`Забронировать`); project hero words clip (RO gala/leadership, RU gala/leadership). The type minimum is 4.4rem and masked lines hide overflow. | Responsive, language-safe display scale and wrapping; preserve whole words where possible. | Booking and project names must be readable. A document-width check alone misses masked text. |
| P1 | Persisted navigation retains language links from the first page. Home → portfolio via ClientRouter leaves RU href `/ru/`, not `/ru/portfolio/`. | Refresh both persisted language switchers on every page load. | Switching language currently loses the visitor's project/page. |
| P1 | Mobile menu lacks a focus trap and does not make background content inert. Tab can reach content hidden behind the overlay; opening focus is sensitive to timing. | Modal semantics, contained focus, reliable first focus and Escape return. | Keyboard navigation must remain usable. |
| P1 | Mobile Lighthouse performance 68–78; LCP 4.4–5.7s. Home video starts immediately; poster has no responsive image or high-priority preload. `runOfShow()` makes all desktop pictures eager even on phones. | Responsive priority poster, video after LCP/intent with slow-network guard, defer below-fold work. | The five-second first impression currently includes loading. |
| P1 | Generated image variants exceed 1 MB: seminar-brick-hall 1,072,630 bytes; office-floor 1,027,146. Full-size viewer requests 2400px at quality 82. | Bound generated widths/quality; verify actual served variants stay near/below 350 KB. | Image-heavy pages multiply mobile transfer costs. |
| P1 launch | Existing photos are placeholders; clients fictional; phone `+373 00 000 000`; socials point to service roots. | Owner-provided photos, approved client references, verified direct links and inbox configuration. | Public claims and contact destinations cannot be treated as real. |
| P2 | 320px DOM probe: RU home/about scrollWidth 353; RU portfolio 380. At 768 RU about 777. | Content-level wrapping and grid min-width corrections, with settled-font rechecks. | Meets the 320px minimum without merely hiding text. |
| P2 | Intercepted 503 `{}` produces “The message could not be sent.” followed by RO/RU text. | Localize generic and network failures as well as API errors. | Error recovery must stay in the chosen language. |
| P2 | Reduced-motion success still animates 20px over 1s; disciplines preview still opens/moves under reduce. | Guard every motion path, including callback-created animations. | Existing early returns do not cover all interactions. |
| P2 | `/ru/404` and `/en/404` render Romanian content/navigation. | Path-aware localized 404 with noindex and correct home/portfolio links. | Error recovery should preserve language. |
| P2 | Long mobile home sequence; desktop run-of-show has seven 72svh steps plus contact-sheet and film pins. Strong identity, but high scroll cost before selected projects. | Connect hero to contact sheet; tighten narrative and keep booking available. | Motion should lead toward work and booking. |
| P2 | Project galleries have good varied layouts but little orientation; next-event navigation is a plain photo link. | Active frame strip/progress, gallery pacing, clearly signaled next-story progression with escape/click options. | Visitors need to understand where they are and keep exploring. |
| P2 | Lightbox lacks app-level pinch zoom, adjacent preload, loading/error feedback and meaningful frame metadata. | Gesture-aware viewer with visible loading/error states, preload and caption/frame line. | Large images currently change without communicating load state. |
| P2 | No testimonials/logos/numbers content model; booking is one long form; messenger links are generic. | CMS-editable, explicitly marked placeholder proof; stepped form; verified channel fields. | Corporate trust and local contact habits are under-served. |
| P2 | SplitText adds `aria-label` to generic `.line` spans (Lighthouse `aria-prohibited-attr` on project); animated opacity can obscure contrast checks. Form placeholders use #5d5953 on black (~3:1, below normal-text AA). | Accessible heading split strategy; stronger placeholders, measured text-over-photo contrast. | A high automated score does not prove all animated/interactive states pass. |
| P2 | On mobile without JS, nav links and language links are hidden while the menu button has no behavior. Home itself remains readable. | Useful no-JS navigation and language controls. | Progressive enhancement must retain a complete browsing path. |
| P2 | npm audit reports seven high findings in the adapter dependency tree (path-to-regexp and zod advisory chains). | Review compatible dependency updates, then rebuild; do not blindly run `audit fix --force`. | Tooling/runtime exposure needs a separate compatibility assessment. |
| P3 | OG images are width-only JPEGs, not branded 1200×630 cards; projects use CreativeWork only; films lack VideoObject; service lacks areaServed and priceRange. | Localized build-time OG cards, gallery/video/breadcrumb/service metadata. | Better sharing and more precise search context. |
| P3 | Four font families with all imported subsets/styles; no explicit language-specific preload or adjusted fallback. | Load/preload only applicable subsets and match fallback metrics. | Reduces render dependency and project CLS (0.055). |
| P3 | Animation lifecycle uses context/cleanup, but hover callbacks and some SplitText/event work warrant a repeated-navigation audit. Grain animates over a large fixed area. | Scoped listeners/timelines, deferred heavy effects and calmer grain. | Avoid regressions as new motion is added. |

## Page and language observations

- **Home:** The black/bone typography, viewfinder and contact-sheet motif are distinctive and worth preserving. First-screen proposition and CTA are localized. The desktop story is very long; the mobile contact sheet is legible but could connect more clearly to the opening image. No genuine social proof yet.
- **Portfolio:** 48 photographs / seven projects. Category filters work in all three languages, with `aria-pressed` updates and correctly filtered lightbox counts. The RU title is especially vulnerable at small widths. Mobile project-index rows leave long names and metadata competing horizontally.
- **Films:** Five films, working player open/Escape/focus return. Featured caption uses two columns even on narrow screens; long copy becomes cramped. No loading/failure message or user-visible preview control.
- **About:** Clear principles/process, but large type competes with portrait at intermediate widths; RU final CTA overflows at 320. Existing portrait identity needs owner confirmation.
- **Contact:** Localized required-field errors focus the name field; calculator date survives query-prefill. Heading clipping is the most visible problem. Validation messages are not linked by `aria-describedby`/`aria-invalid`; generic request errors leak English. Reduced-motion success animation is still active.
- **Projects:** All seven stories share a strong cinematic skeleton, but long titles are clipped rather than scaled or reflowed. Gallery rhythm collapses to a sensible single column on phones. Add navigation and booking cues without obscuring photographs.
- **404/admin:** Missing pages use Romanian regardless of path. CMS YAML parses; admin is an external CMS shell, not a translated portfolio page. No CMS login/write/publish was attempted.

## Baseline Lighthouse

One run per route; scores vary. Targets: performance ≥90, accessibility ≥95, best practices ≥95, SEO 100; LCP <2.5s, CLS <0.05.

| Route | Performance before | Accessibility | Best practices | SEO | LCP | CLS | TBT | After |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `/` | 68 | 100 | 100 | 100 | 5.7s | 0.002 | 0ms | Pending implementation |
| `/ru/` | 71 | 100 | 100 | 100 | 5.0s | 0 | 0ms | Pending implementation |
| `/portfolio/` | 78 | 100 | 100 | 100 | 4.4s | 0 | 0ms | Pending implementation |
| `/work/leadership-seminar/` | 71 | 96 | 100 | 100 | 5.4s | 0.055 | 0ms | Pending implementation |

Axe WCAG 2/2.1 A/AA checks on six page types × three languages in reduced motion found no violations. This does **not** clear the normal-motion SplitText issue, focus containment, placeholders or visual clipping. No measured frame-rate claim: scroll sequences were captured and inspected, not profiled on physical phone hardware.

## Baseline verification

- Install succeeded. No dependency manifest/lockfile change.
- `npx astro check` under Node 26: **0 errors, 0 warnings, 2 hints**. The repository lacks check/TypeScript dependencies; temporary tools were installed outside the repository and symlinked into ignored node_modules.
- `npm run build`: passed, 37 HTML pages (36 localized public pages + root 404).
- CMS YAML: parsed successfully.
- Native lightbox arrow navigation, Escape, and focus return; film Escape and focus return: passed in RO/RU/EN.
- Date prefill and localized empty-form validation: passed; mocked success/failure exposed the defects above. Real Resend/Turnstile delivery intentionally not exercised.
- No production deployment, main push or system-service changes during audit.

## Implementation direction

User expanded authorization during the audit: commit this baseline, then implement workstreams 2–8 in order, one commit per workstream, verify, and deploy a preview only. The following commits will append measured after results rather than overwrite this baseline. Preserve existing routes, spam protection, trilingual content and CMS editing.

### Compression control

A second baseline used the same static build with gzip for text and immutable asset caching on port 4323. This server is retained for the final comparison. Results: `/` 81 / LCP 4.0s; `/ru/` 98 / 2.0s; `/portfolio/` 89 / 3.4s; leadership story 84 / 3.8s. Accessibility/best-practices/SEO remain 100/100/100 except project accessibility 96. Raw reports: `screenshots/lighthouse-compressed-before/`. The difference confirms that local transfer setup materially affects these results; final comparisons must use this same compressed setup.

Targeted built-HTML grep found no “Book your”, “Check availability”, “See the work”, “Selected work” or “Next event” on Romanian/Russian home/contact pages. Existing content intentionally includes borrowed film vocabulary and brand names; the confirmed English error leak is in client JS, not initial HTML. Output contains 38 HTML files including `/admin/index.html` (37 portfolio/404 pages).

Ian supplied the verified Instagram URL during this audit: https://www.instagram.com/ellinayatsenyuk/. Apply to all three site settings with workstream 2; preserve label `Instagram`.

## After workstreams 2–4 — 2026-10-26

Ian subsequently split the scope: Codex completes 2–4 and the named fixes; Claude Code owns 5–8. This branch intentionally does not claim the performance or full accessibility/polish targets are complete.

Delivered: cinematic project motion, frame navigation and zoomable viewer; opt-in next-story scroll advance; connected hero/contact-sheet exposure; editable proof, testimonials and counters; mobile booking CTA; localized progressive booking with retry and next-steps state; CMS messenger settings. Instagram is the verified account in all locales. Russian surname, persisted language paths and long heading fit are corrected.

### Lighthouse after (same compressed static server, mobile incognito)

| Page | Before P / LCP | After P | After LCP | After CLS | After A / BP / SEO |
|---|---|---:|---|---|---|
| `/` | 81 / 4.0s | 79 | 4.4 s | 0.002 | 100 / 100 / 100 |
| `/ru/` | 98 / 2.0s | 84 | 3.7 s | 0.002 | 100 / 100 / 100 |
| `/portfolio/` | 89 / 3.4s | 98 | 2.3 s | 0 | 100 / 100 / 100 |
| `/work/leadership-seminar/` | 84 / 3.8s | 83 | 4.0 s | 0.01 | 100 / 100 / 100 |

Raw reports: `screenshots/lighthouse-after-ws4/`. These are local lab measurements, not production field data. Home/project LCP still needs Claude's workstream 5. The separate branch has not been merged into this preview.

### Verification and visual review

- Astro check: 0 errors, 0 warnings, 2 pre-existing hints. Production build succeeds; CMS YAML parses.
- All 36 localized public pages plus three missing paths captured at 375 and 1440: 78 combinations, no page errors, broken images or document overflow. Reviewed top/full screenshot boards in `screenshots/after/boards/`. Root-language 404 remains Claude's workstream 7.
- All 36 pages checked at 320, 375, 768, 1024, 1440 and 1920 after fonts settle. A 9px Russian about-process overflow at 768 was corrected with scoped intrinsic-width/wrapping rules. Existing full-page capture artifacts from fixed/pinned layers were checked separately in viewport interaction tests.
- Project checks: frame navigation, active state, viewer keyboard/zoom/reset, Escape, next-story opt-in/cancel and locale links after client navigation pass. Home freeze/proof pause tests pass in all locales at 375/1440; pin ordering checked in a normal-motion viewport.
- Booking checks in RO/RU/EN at 375/1440 pass: calculator date prefill, past-date rejection, required-field focus, invalid email, mocked failure/retry/success, three next steps, unchanged anti-spam payload, reduced-motion success, and mobile CTA visibility around hero/menu/footer. No real contact messages were sent.
- Targeted built-visible-text check excludes metadata/client dictionaries and checks for English CTA/error phrases on Romanian/Russian routes. Instagram destinations verified on all three localized contact surfaces. No old Russian surname remains in repository source; historical screenshots/report artifacts are excluded from the source check.
- Remaining launch inputs: approved photographs, clients/testimonials/counts, real messenger/phone details, verified email delivery and domains. See LAUNCH-CHECKLIST.md. Global keyboard/menu/no-JS and motion/contrast findings remain assigned to Claude 5–8.

## Round 2 — content, positioning and flow (2026-10-26)

Baseline is the merged `site-v3` supplied for round 2. Measured in Chromium after fonts and normal-motion pins settle, 1440×900 and 375×812. Baseline captures and section heights are in `screenshots/<lang>/<width>/before-home.png` and `screenshots/before-height.json`.

Ian expanded the offer during this pass: events stay first, with brand photography, Instagram Reels and monthly social media content as a second core offer. “Salons” is one example of small-business clients, not a niche; no beauty category or fabricated brand work was added.

### Page-height budget

| Locale | Desktop before | Desktop after | Screens after | Phone before | Phone after | Screens after |
|---|---:|---:|---:|---:|---:|---:|
| RO | 20,876 | 10,700 | 11.89 | 13,113 | 11,107 | 13.68 |
| RU | 21,167 | 10,761 | 11.96 | 13,392 | 11,270 | 13.88 |
| EN | 20,455 | 10,601 | 11.78 | 12,894 | 10,942 | 13.48 |

Final values are measured after scrolling the entire page and loading its images, including refreshed pin spacing. Desktop target ≤10,800px; phone target ≤12,992px. All four selected projects and all seven run-of-show moments remain. Work now precedes explanatory sections; the decorative intermediate marquee is removed. The run-of-show uses compact 30svh minimum steps (content can grow), and selected spreads retain their alternating composition within shorter image frames. Claude supplied both pin reductions (`8b62247`, `dd6ac86`), integrated as `dd7f236`, `7380bd8`.

### Content and conversion checks

- `node scripts/check-public-content.mjs`: all 39 public HTML files pass the requested placeholder-phrase and empty-heading scans. `/admin` is excluded from public copy checks.
- Fixture builds confirmed: an entirely unfinished proof set emits no section; independently approved names, quotes and positive values appear; unfinished attribution and zero/empty values stay hidden. Fixture data was restored after testing.
- Current content shows only the existing five-working-day delivery promise. There are no public demo logos/testimonials/zero counters. CMS hints explain automatic publication when filled.
- All eight services use localized on-request prices. New service chips derive from CMS services, so the Instagram/Reels, brand/business shoot and monthly SMM options stay synchronized.
- The Brands portfolio filter and home tile are absent until actual published work exists. A future tile can use the matching project cover without a fabricated stock brand image.
- Interaction testing uncovered a pre-existing collision: the film player bound to the calculator’s `data-film` configuration attribute and opened an empty player from its CTA. Fixed in `012e9d1` by separating calculator configuration (`data-film-days`) from film triggers. Date prefill, all eight services, new service selection and booking-step progression pass in RO/RU/EN at both viewport sizes; no real message was sent.

### Round 2 Lighthouse (compressed local static build)

Single mobile incognito runs with the same gzip/static-server method as round 1. Historical round-1 values are comparison context, not a fresh round-2 baseline. These runs precede Claude’s round-2 image-loading/player integration.

| Route | Round 1 after P / LCP | Round 2 P | LCP | A / BP / SEO |
|---|---|---:|---|---|
| `/` | 79 / 4.4s | 85 | 4.1s | 100 / 100 / 100 |
| `/ru/` | 84 / 3.7s | 86 | 3.5s | 100 / 100 / 100 |
| `/portfolio/` | 98 / 2.3s | 97 | 2.4s | 100 / 100 / 100 |
| `/work/leadership-seminar/` | 83 / 4.0s | 84 | 3.8s | 100 / 100 / 100 |

Performance/LCP targets remain unmet on home/project; these are local lab results, not field or CDN measurements. Raw reports: `screenshots/lighthouse-r2/`.

### Round 2 verification and visual review

- Astro check: 0 errors, 0 warnings, four existing hints. Build and CMS YAML validation pass.
- Captured all 36 localized public pages plus three localized error routes at 375 and 1440 (78 combinations); top/full captures under `screenshots/<lang>/<width>/`. No browser exceptions, broken images or document overflow at these sizes. Reviewed screenshot boards and individual home/delivery/spread/booking views.
- 216 reduced-motion route/width probes (320, 375, 768, 1024, 1440, 1920) found one narrow Russian portfolio index overflow. Fixed with scoped stacked rows and wrapping in `45e77bc`; targeted 320 retest is clean.
- Six locale/size interaction paths pass: calculator date to booking, no spurious film dialog, eight service cards and nine chips including Other, new service selection, step navigation, absent Brands filter/tile, proof filtering, skip link, mobile menu focus containment/Escape.
- No-JS home/contact pass in all three languages. Forms remain readable and editable. No live email was sent.
- Axe across six page types × three languages × two sizes found only inactive desktop run-of-show contrast. Increased inactive opacity and removed dimming entirely for reduced motion in `1ffb788`; the final integrated 36-page/viewport Axe retest reports no violations.
- Targeted visible-text grep found no English booking/CTA phrases on RO/RU pages. Neutral Brands naming is used throughout.

### Integrated preview verification

- Claude's blurred loading images (`493f2f7`) and portrait video support (`c455831`) are integrated as `5f7c068` and `dbf8b81`. Resolved the CSS-tail conflict by keeping both loading rules and home spacing.
- Temporary local fixtures at 375 and 1440 verified 9:16 grid cards and player dimensions, the portrait shelf/filter empty state, and portrait cards in the home strip and project page. Media requests were blocked for deterministic layout checks; this is geometry/interaction validation, not a claim about real portrait footage. Fixture content was removed and the normal site rebuilt before deployment.
- Refreshed all 78 page captures after the loading-image integration, then refreshed home/films after portrait support and home again after the final spacing adjustment. No page exceptions, broken images or overflow at 375/1440. Rechecked all six booking/keyboard paths and all three no-JS home/contact paths after integration.
- Final Astro check: **0 errors, 0 warnings, four existing hints**. Final build, public HTML scan and CMS YAML parsing pass.
- Separate requested domain commit `07dca7d`: `chore: real domain ellinayatsenyuk.com`. Generated canonical/alternate links, JSON-LD, robots and sitemap URLs use `https://ellinayatsenyuk.com`. Email remains `hello@ellinaiateniuc.com` as explicitly requested; it is a launch blocker in the checklist. DNS is pending; no DNS or production deployment changes were made.

Final integrated local Lighthouse (same compressed static method; single runs):

| Route | Performance | LCP | A / BP / SEO |
|---|---:|---|---|
| `/` | 80 | 4.3s | 100 / 100 / 100 |
| `/ru/` | 89 | 3.2s | 100 / 100 / 100 |
| `/portfolio/` | 98 | 2.0s | 100 / 100 / 100 |
| `/work/leadership-seminar/` | 87 | 3.5s | 100 / 100 / 100 |

Raw final reports: `screenshots/lighthouse-r2-final/`. Home/project performance and LCP remain below the original targets; visual/content completion does not imply those targets are met. These results preceded only the final eight-pixel desktop section-spacing trim.

Preview: https://ellina-iateniuc-6s4aky8wg-iul-ink.vercel.app — Vercel deployment `dpl_7biiuEXS33SJCriyvFaHQNiVAqe9`, **Ready**, target **preview**. Live protected-preview reads of home and Russian contact confirmed real-domain metadata, no unfinished phrases, and localized on-request pricing. Source at deployment: `3ad235f` (later commits only document verification). No production deployment or main push.


---

# Round 1 — Claude Code WS5–8 results and Lighthouse before/after

# Aperture — baseline audit

Audit date: 2026-10-26. Baseline commit: `4ee22a8`. Task branch: `IULinktms/site-v3-audit-and-upgrade-pmwp`.

## Scope and method

Verified `src/lib/i18n.ts` and `src/pages/[...lang]/` before proceeding. Read AGENT-PROMPT.md and the current architecture. Installed with `NODE_ENV=development npm install`; the shell resolves Node 22.22.3, below Astro 7.4.2's requirement. Used the already-installed `/opt/homebrew/bin/node` (26.12.1) for Astro; no system upgrade or service restart.

Dev baseline: http://127.0.0.1:4321, explicitly development mode. Chromium screenshots and DOM inspection cover home, portfolio, films, about, contact and all seven project stories in Romanian, Russian and English, plus missing-page paths, at 375×812, 1024×768 and 1440×900. Additional reduced-motion layout probes cover 320, 768 and 1920. Local evidence is under gitignored `screenshots/<lang>/<width>/`, with top and full-page captures, `walk.json`, `extra.json`, `interactions.json`, `followup.json` and `lighthouse/`. Full-page captures follow a complete scroll to trigger lazy assets/reveals; fixed headers can appear at the capture scroll position. No email was sent; success/error requests were intercepted locally.

`npm run preview` fails because @astrojs/vercel does not support preview. Lighthouse therefore measured the unchanged `.vercel/output/static` build through a local static HTTP server on 4322 (fresh headless Chromium, incognito, Lighthouse mobile simulated throttling). This is a local baseline, not production/CDN performance or an end-to-end API test. The simple baseline server has no compression/cache headers, which contributes to its scores.

## Ranked findings

| Priority | Before / evidence | Recommended after | Why |
| --- | --- | --- | --- |
| P1 | Contact heading clips at 375 in RO (`evenimentul`) and RU (`Забронировать`); project hero words clip (RO gala/leadership, RU gala/leadership). The type minimum is 4.4rem and masked lines hide overflow. | Responsive, language-safe display scale and wrapping; preserve whole words where possible. | Booking and project names must be readable. A document-width check alone misses masked text. |
| P1 | Persisted navigation retains language links from the first page. Home → portfolio via ClientRouter leaves RU href `/ru/`, not `/ru/portfolio/`. | Refresh both persisted language switchers on every page load. | Switching language currently loses the visitor's project/page. |
| P1 | Mobile menu lacks a focus trap and does not make background content inert. Tab can reach content hidden behind the overlay; opening focus is sensitive to timing. | Modal semantics, contained focus, reliable first focus and Escape return. | Keyboard navigation must remain usable. |
| P1 | Mobile Lighthouse performance 68–78; LCP 4.4–5.7s. Home video starts immediately; poster has no responsive image or high-priority preload. `runOfShow()` makes all desktop pictures eager even on phones. | Responsive priority poster, video after LCP/intent with slow-network guard, defer below-fold work. | The five-second first impression currently includes loading. |
| P1 | Generated image variants exceed 1 MB: seminar-brick-hall 1,072,630 bytes; office-floor 1,027,146. Full-size viewer requests 2400px at quality 82. | Bound generated widths/quality; verify actual served variants stay near/below 350 KB. | Image-heavy pages multiply mobile transfer costs. |
| P1 launch | Existing photos are placeholders; clients fictional; phone `+373 00 000 000`; socials point to service roots. | Owner-provided photos, approved client references, verified direct links and inbox configuration. | Public claims and contact destinations cannot be treated as real. |
| P2 | 320px DOM probe: RU home/about scrollWidth 353; RU portfolio 380. At 768 RU about 777. | Content-level wrapping and grid min-width corrections, with settled-font rechecks. | Meets the 320px minimum without merely hiding text. |
| P2 | Intercepted 503 `{}` produces “The message could not be sent.” followed by RO/RU text. | Localize generic and network failures as well as API errors. | Error recovery must stay in the chosen language. |
| P2 | Reduced-motion success still animates 20px over 1s; disciplines preview still opens/moves under reduce. | Guard every motion path, including callback-created animations. | Existing early returns do not cover all interactions. |
| P2 | `/ru/404` and `/en/404` render Romanian content/navigation. | Path-aware localized 404 with noindex and correct home/portfolio links. | Error recovery should preserve language. |
| P2 | Long mobile home sequence; desktop run-of-show has seven 72svh steps plus contact-sheet and film pins. Strong identity, but high scroll cost before selected projects. | Connect hero to contact sheet; tighten narrative and keep booking available. | Motion should lead toward work and booking. |
| P2 | Project galleries have good varied layouts but little orientation; next-event navigation is a plain photo link. | Active frame strip/progress, gallery pacing, clearly signaled next-story progression with escape/click options. | Visitors need to understand where they are and keep exploring. |
| P2 | Lightbox lacks app-level pinch zoom, adjacent preload, loading/error feedback and meaningful frame metadata. | Gesture-aware viewer with visible loading/error states, preload and caption/frame line. | Large images currently change without communicating load state. |
| P2 | No testimonials/logos/numbers content model; booking is one long form; messenger links are generic. | CMS-editable, explicitly marked placeholder proof; stepped form; verified channel fields. | Corporate trust and local contact habits are under-served. |
| P2 | SplitText adds `aria-label` to generic `.line` spans (Lighthouse `aria-prohibited-attr` on project); animated opacity can obscure contrast checks. Form placeholders use #5d5953 on black (~3:1, below normal-text AA). | Accessible heading split strategy; stronger placeholders, measured text-over-photo contrast. | A high automated score does not prove all animated/interactive states pass. |
| P2 | On mobile without JS, nav links and language links are hidden while the menu button has no behavior. Home itself remains readable. | Useful no-JS navigation and language controls. | Progressive enhancement must retain a complete browsing path. |
| P2 | npm audit reports seven high findings in the adapter dependency tree (path-to-regexp and zod advisory chains). | Review compatible dependency updates, then rebuild; do not blindly run `audit fix --force`. | Tooling/runtime exposure needs a separate compatibility assessment. |
| P3 | OG images are width-only JPEGs, not branded 1200×630 cards; projects use CreativeWork only; films lack VideoObject; service lacks areaServed and priceRange. | Localized build-time OG cards, gallery/video/breadcrumb/service metadata. | Better sharing and more precise search context. |
| P3 | Four font families with all imported subsets/styles; no explicit language-specific preload or adjusted fallback. | Load/preload only applicable subsets and match fallback metrics. | Reduces render dependency and project CLS (0.055). |
| P3 | Animation lifecycle uses context/cleanup, but hover callbacks and some SplitText/event work warrant a repeated-navigation audit. Grain animates over a large fixed area. | Scoped listeners/timelines, deferred heavy effects and calmer grain. | Avoid regressions as new motion is added. |

## Page and language observations

- **Home:** The black/bone typography, viewfinder and contact-sheet motif are distinctive and worth preserving. First-screen proposition and CTA are localized. The desktop story is very long; the mobile contact sheet is legible but could connect more clearly to the opening image. No genuine social proof yet.
- **Portfolio:** 48 photographs / seven projects. Category filters work in all three languages, with `aria-pressed` updates and correctly filtered lightbox counts. The RU title is especially vulnerable at small widths. Mobile project-index rows leave long names and metadata competing horizontally.
- **Films:** Five films, working player open/Escape/focus return. Featured caption uses two columns even on narrow screens; long copy becomes cramped. No loading/failure message or user-visible preview control.
- **About:** Clear principles/process, but large type competes with portrait at intermediate widths; RU final CTA overflows at 320. Existing portrait identity needs owner confirmation.
- **Contact:** Localized required-field errors focus the name field; calculator date survives query-prefill. Heading clipping is the most visible problem. Validation messages are not linked by `aria-describedby`/`aria-invalid`; generic request errors leak English. Reduced-motion success animation is still active.
- **Projects:** All seven stories share a strong cinematic skeleton, but long titles are clipped rather than scaled or reflowed. Gallery rhythm collapses to a sensible single column on phones. Add navigation and booking cues without obscuring photographs.
- **404/admin:** Missing pages use Romanian regardless of path. CMS YAML parses; admin is an external CMS shell, not a translated portfolio page. No CMS login/write/publish was attempted.

## Baseline Lighthouse

One run per route; scores vary. Targets: performance ≥90, accessibility ≥95, best practices ≥95, SEO 100; LCP <2.5s, CLS <0.05.

| Route | Performance before | Accessibility | Best practices | SEO | LCP | CLS | TBT | After |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `/` | 68 | 100 | 100 | 100 | 5.7s | 0.002 | 0ms | Pending implementation |
| `/ru/` | 71 | 100 | 100 | 100 | 5.0s | 0 | 0ms | Pending implementation |
| `/portfolio/` | 78 | 100 | 100 | 100 | 4.4s | 0 | 0ms | Pending implementation |
| `/work/leadership-seminar/` | 71 | 96 | 100 | 100 | 5.4s | 0.055 | 0ms | Pending implementation |

Axe WCAG 2/2.1 A/AA checks on six page types × three languages in reduced motion found no violations. This does **not** clear the normal-motion SplitText issue, focus containment, placeholders or visual clipping. No measured frame-rate claim: scroll sequences were captured and inspected, not profiled on physical phone hardware.

## Baseline verification

- Install succeeded. No dependency manifest/lockfile change.
- `npx astro check` under Node 26: **0 errors, 0 warnings, 2 hints**. The repository lacks check/TypeScript dependencies; temporary tools were installed outside the repository and symlinked into ignored node_modules.
- `npm run build`: passed, 37 HTML pages (36 localized public pages + root 404).
- CMS YAML: parsed successfully.
- Native lightbox arrow navigation, Escape, and focus return; film Escape and focus return: passed in RO/RU/EN.
- Date prefill and localized empty-form validation: passed; mocked success/failure exposed the defects above. Real Resend/Turnstile delivery intentionally not exercised.
- No production deployment, main push or system-service changes during audit.

## Implementation direction

User expanded authorization during the audit: commit this baseline, then implement workstreams 2–8 in order, one commit per workstream, verify, and deploy a preview only. The following commits will append measured after results rather than overwrite this baseline. Preserve existing routes, spam protection, trilingual content and CMS editing.

### Compression control

A second baseline used the same static build with gzip for text and immutable asset caching on port 4323. This server is retained for the final comparison. Results: `/` 81 / LCP 4.0s; `/ru/` 98 / 2.0s; `/portfolio/` 89 / 3.4s; leadership story 84 / 3.8s. Accessibility/best-practices/SEO remain 100/100/100 except project accessibility 96. Raw reports: `screenshots/lighthouse-compressed-before/`. The difference confirms that local transfer setup materially affects these results; final comparisons must use this same compressed setup.

Targeted built-HTML grep found no “Book your”, “Check availability”, “See the work”, “Selected work” or “Next event” on Romanian/Russian home/contact pages. Existing content intentionally includes borrowed film vocabulary and brand names; the confirmed English error leak is in client JS, not initial HTML. Output contains 38 HTML files including `/admin/index.html` (37 portfolio/404 pages).

Ian supplied the verified Instagram URL during this audit: https://www.instagram.com/ellinayatsenyuk/. Apply to all three site settings with workstream 2; preserve label `Instagram`.

## After workstreams 2–4 — 2026-10-26

Ian subsequently split the scope: Codex completes 2–4 and the named fixes; Claude Code owns 5–8. This branch intentionally does not claim the performance or full accessibility/polish targets are complete.

Delivered: cinematic project motion, frame navigation and zoomable viewer; opt-in next-story scroll advance; connected hero/contact-sheet exposure; editable proof, testimonials and counters; mobile booking CTA; localized progressive booking with retry and next-steps state; CMS messenger settings. Instagram is the verified account in all locales. Russian surname, persisted language paths and long heading fit are corrected.

### Lighthouse after (same compressed static server, mobile incognito)

| Page | Before P / LCP | After P | After LCP | After CLS | After A / BP / SEO |
|---|---|---:|---|---|---|
| `/` | 81 / 4.0s | 79 | 4.4 s | 0.002 | 100 / 100 / 100 |
| `/ru/` | 98 / 2.0s | 84 | 3.7 s | 0.002 | 100 / 100 / 100 |
| `/portfolio/` | 89 / 3.4s | 98 | 2.3 s | 0 | 100 / 100 / 100 |
| `/work/leadership-seminar/` | 84 / 3.8s | 83 | 4.0 s | 0.01 | 100 / 100 / 100 |

Raw reports: `screenshots/lighthouse-after-ws4/`. These are local lab measurements, not production field data. Home/project LCP still needs Claude's workstream 5. The separate branch has not been merged into this preview.

### Verification and visual review

- Astro check: 0 errors, 0 warnings, 2 pre-existing hints. Production build succeeds; CMS YAML parses.
- All 36 localized public pages plus three missing paths captured at 375 and 1440: 78 combinations, no page errors, broken images or document overflow. Reviewed top/full screenshot boards in `screenshots/after/boards/`. Root-language 404 remains Claude's workstream 7.
- All 36 pages checked at 320, 375, 768, 1024, 1440 and 1920 after fonts settle. A 9px Russian about-process overflow at 768 was corrected with scoped intrinsic-width/wrapping rules. Existing full-page capture artifacts from fixed/pinned layers were checked separately in viewport interaction tests.
- Project checks: frame navigation, active state, viewer keyboard/zoom/reset, Escape, next-story opt-in/cancel and locale links after client navigation pass. Home freeze/proof pause tests pass in all locales at 375/1440; pin ordering checked in a normal-motion viewport.
- Booking checks in RO/RU/EN at 375/1440 pass: calculator date prefill, past-date rejection, required-field focus, invalid email, mocked failure/retry/success, three next steps, unchanged anti-spam payload, reduced-motion success, and mobile CTA visibility around hero/menu/footer. No real contact messages were sent.
- Targeted built-visible-text check excludes metadata/client dictionaries and checks for English CTA/error phrases on Romanian/Russian routes. Instagram destinations verified on all three localized contact surfaces. No old Russian surname remains in repository source; historical screenshots/report artifacts are excluded from the source check.
- Remaining launch inputs: approved photographs, clients/testimonials/counts, real messenger/phone details, verified email delivery and domains. See LAUNCH-CHECKLIST.md. Global keyboard/menu/no-JS and motion/contrast findings remain assigned to Claude 5–8.

---

# Workstreams 5–8: performance, accessibility, SEO, polish (Claude Code)

Branch `IULinktms/site-v3-perf-a11y-seo-polish-7cdz`, built on `4ee22a8` in parallel with the Codex branch (workstreams 2–4). Commits: `e056ae5` WS5, `16e9989` WS6, `7fae657` WS7, `35fd528` + final fix WS8.

## Lighthouse before / after (this branch only)

Method: `npm run build` → `.vercel/output/static` served locally by a small Node server that mimics Vercel (gzip for text, immutable cache on `/assets/`, the 404 routes from `config.json`). Lighthouse 13, mobile, simulated throttling, headless Chromium in incognito. **Three runs per route, median shown**; the runs were identical within ±1 point. "Before" is the unchanged `4ee22a8` build, measured the same way and on the same day.

| Route | Perf before → after | A11y | Best pr. | SEO | LCP | CLS | Image bytes | Largest image |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 84 → **88** | 100 → 100 | 100 | 100 | 3.7 → 3.2 s | 0.002 → 0.002 | 935 → 389 KB | 132 → 62 KB |
| `/ru/` | 84 → **85** | 100 → 100 | 100 | 100 | 3.7 → 3.6 s | 0.002 → 0.002 | 935 → 389 KB | 132 → 62 KB |
| `/portfolio/` | 91 → **93** | 100 → 100 | 100 | 100 | 3.0 → 2.8 s | 0.003 → 0.003 | 536 → 439 KB | 98 → 81 KB |
| `/work/leadership-seminar/` | 84 → **87** | 96 → **100** | 100 | 100 | 3.9 → 3.5 s | 0 → 0 | 470 → 393 KB | 98 → 83 KB |

Targets met: Accessibility ≥ 95 (now 100 everywhere), Best Practices, SEO 100, CLS < 0.05, no image over 350 KB at the sizes actually requested. **Not yet met: Performance ≥ 90 and LCP < 2.5 s on `/`, `/ru/` and the project page.**

Why, measured: Chrome never picks the full-bleed hero photo as LCP (checked with a `PerformanceObserver`, home and project). LCP is the hero text: the home lede, and the project `h1`. On this branch both are hidden or re-created by JavaScript (intro opacity, SplitText masks), so LCP waits for CSS, fonts and the 70 KB (gzip) motion bundle. Codex's WS3 already changes exactly that. The first-screen copy stays painted, there is no intro text fade, and headings reveal with zero delay. **Final numbers need a run on the merged branch.** Lantern also counts every request that starts before the first paint, and on a fast local server that includes the lazy gallery images. These numbers are therefore conservative compared with a CDN.

Things tried and dropped, with numbers: inlining all CSS (`inlineStylesheets: 'always'`) made the HTML 4× bigger and LCP 0.3–0.5 s worse. Preloading the latin/Cyrillic font files pushed home FCP from 1.6 to 2.7 s, because the fonts competed with the poster and the script. Size-adjusted fallbacks keep CLS low without preloads.

## What changed

**WS5 Performance**
- Home hero: a responsive WebP still (480/800/1280, preloaded, `fetchpriority=high`, `data-hero-still`) paints first. The reel loads after `load` + idle, never on Save-Data, 2G or reduced motion, and fades in only once it actually plays. It also skips playing if the WS3 shutter froze the hero.
- Images: `Frame` widths are capped at 1600 (q75). The `src` fallback is no longer the 2400 px original. Viewer full size is 1800 q70. Home run-of-show/strip/float fallbacks are capped. Every WebP that a page actually requests is now under 350 KB.
- Run-of-show stills switch to eager only when the desktop stack is displayed and the section is near. Phones no longer download seven hidden images.
- Fonts: fallbacks are Georgia/Arial, size-adjusted to Bodoni (103%) and Hanken (100%), measured in Chromium. The closed menu is `display:none`, so RO/EN pages no longer download the Cyrillic Manrope file for the "Русский" label.

**WS6 Accessibility & motion**
- Mobile menu is now a real modal: focus is trapped (menu + its toggle), `main`/`footer`/logo are `inert` while it is open, and Escape returns focus. Without JS, a plain "Menu" link opens the menu in place (`:target`).
- Reduced motion: CSS animations, transitions and view transitions are off; the disciplines float preview is hidden. Codex covers the JS paths it owns (success state, headings).
- SplitText `aria-label` on non-heading spans/paragraphs is removed and the line text stays readable (this was the 96 on /work/). Portfolio photo and featured-film buttons now contain their visible text in their accessible name (WCAG 2.5.3).
- Placeholder contrast fixed (#5d5953 ≈ 3:1 → ash ≈ 5.6:1). The focus ring is 2 px. Decorative layers have `pointer-events: none`.
- axe (WCAG 2.0/2.1 A+AA), 7 page types × 3 languages × normal and reduced motion: 0 violations. The one remaining item, the home films-strip button name, is fixed on the Codex branch.

**WS7 SEO & sharing**
- One JSON-LD `@graph` per page:
  - always: `ProfessionalService` (areaServed Moldova + Romania, `sameAs` limited to real profile URLs, `priceRange` placeholder) and `BreadcrumbList`;
  - project pages: `ImageGallery` (cover + gallery) and `VideoObject`;
  - `/films/`: one `VideoObject` per film.
- Share cards: 1200×630 at build time, `/og/<lang>/<slug>.jpg` for each project and language, plus `/og/<lang>/site.jpg` for pages without their own photo.
  - Each card is the cover photo with the title set in Bodoni Moda (Playfair Display for Cyrillic).
  - Titles are drawn as outlines by a ~200-line TTF reader (`src/lib/og-font.ts`), so the cards don't depend on fonts installed on the build machine. The OFL font files are in `src/assets/og-fonts/`.
- Localized 404:
  - `/ru/404/` and `/en/404/` share one `NotFound` component, and their links stay in the visitor's language.
  - `scripts/localize-404.mjs` runs after `astro build` and inserts Vercel routes, so unknown `/ru/*` and `/en/*` paths return those pages with status 404.
  - 404 pages are excluded from the sitemap.
- Titles and descriptions are unique per page per language. They come from content where it exists (projects, about, booking) and from the dictionary otherwise (portfolio, films).

**WS8 Polish**
- Typesetting (`src/lib/typography.mjs`):
  - No-break spaces after short RO/RU words and between a number and its unit.
  - Straight quotes become „…” / «…» / “…”; a spaced hyphen becomes a dash.
  - Applied to prose fields and to rendered Markdown. Display-size fields get quotes and dashes only, because bound word pairs overflowed at 320 px.
- Page change: `main` closes to a slit and opens on the next page in ≈0.58 s; it is skipped under reduced motion. Cover morphs are unaffected.
- `text-wrap: balance/pretty`, `hanging-punctuation`, optical sizing.
- Micro-interactions: the underline leaves faster than it enters; film cards zoom on hover; icon buttons, filters and the menu toggle scale when pressed.
- No-FOUC failsafe: frames hidden for the aperture reveal open by CSS after 3 s if the motion engine never starts.

## Verification (this branch)
- `npx astro check`: 0 errors, 0 warnings. `npm run build`: 40 HTML pages (36 localized + root 404 + /ru/404 + /en/404 + admin).
- Leftover English on RO/RU built pages: none in visible text or attributes. The only hits were HTML comments, the Romanian loanword "open space" and the placeholder client name "Event placeholder".
- Screenshots at 375 and 1440 for every page type × 3 languages: `screenshots/<lang>/<width>/` (gitignored).
- Width sweep 320–1920: the only overflows are the pre-existing RU heading/grid cases (RU home/about/portfolio at 320, RU portfolio at 375, RU about at 768), which Codex fixed on their branch.
- Keyboard: menu Tab cycle stays in menu + toggle, Escape returns focus, background inert; no-JS menu link works.

## Decisions and launch notes (WS5–8)
- 1600 px cap on in-page images: 2× retina full-bleed on 1440 screens is slightly softer, which is the trade-off for 0.3–0.6 MB less per large photo. The viewer still serves 1800 px.
- `priceRange: '€€'` in the structured data is a placeholder. Replace it with the real band before launch, or remove it (`src/lib/seo.ts`).
- The `og:url`, canonical and JSON-LD URLs use `site` from `astro.config.mjs` (`https://ellinaiateniuc.com`). Share cards resolve only once the real domain is set.
- Vercel must run the package.json `build` script (default for the Astro preset) for the localized 404 routes to apply.
