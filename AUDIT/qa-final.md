# Ellina Yatsenyuk — fresh-eyes QA

Date: 2026-10-27. Live: https://ellinayatsenyuk.com. Base: `5624ba8` (site-v3). Branch: `IULinktms/ellina-fresh-eyes-qa-fixes-nnqf`.

Four confirmed defects were fixed in small commits. Claude implemented the changes; Codex independently reviewed the diffs and tested the built output in this Orca worktree. No push, merge, or deployment was performed. The live site therefore still has the baseline defects until these commits are deployed through a separate authorized task.

## Coverage and results

“Every page” means home, portfolio, Casmara project, films, about, contact, and an actual nonexistent URL that returns the localized 404, in RU `/`, RO `/ro/`, and EN `/en/`: 21 route/language cases. The project path is `/work/casmara-international-seminar-2026/` under each locale.

| Test | Coverage | Baseline failure / result | Fix and final result |
|---|---|---|---|
| Browser matrix | Each of 21 cases × Chromium 390/768/1440 and WebKit iPhone 15 (393 CSS px) × normal/reduced motion; 168 cases per target | Live and local baseline: 0 page/console errors, 0 broken images, 0 horizontal document overflow; correct 200/404 statuses | Full final matrix rerun; see final verification below |
| Text clipping and layout | Full-page RU/RO/EN phone/desktop screenshots; text-range geometry on all 18 content pages at 390/768/1440; final tablet and WebKit screenshots | Home footer surname extends to x1578.7 in a 1440px viewport in all three languages. `overflow-x: hidden` concealed this from a simple document-overflow check | `7f4e892`: removed obsolete home-only `13vw` font size so the existing shared fitting rule applies |
| Accessibility / axe | All 21 route/language cases on live and local; complete axe scan after scroll/lazy loading, reduced motion for stable state | One rule, `color-contrast`, on each of 18 content pages: two inactive footer language links; 3.08:1. Three 404 pages have no footer and no violations | `b3b33ab`: footer-only inactive opacity 0.55 → 0.8, approximately 5.14:1; active language and hover stay at 1 |
| Language and metadata | Rendered body, title, description, OG fields, image descriptions, language targets, visible screenshot text | RU contact email button read “Email” | `5a778dc`: Russian contact and booking UI email labels → “Эл. почта”. No marketing-copy rewrite |
| Content authenticity | Rendered text/images and published content selection | One real Casmara project and its real short film; Ellina portrait. No visible TODO, lorem, template testimonials, fabricated counters, or unrelated stock-project images | Pass. Draft/template content exists in source but is not published; build prunes 68 unreferenced images/films |
| Mobile menu | RU/RO/EN × Chromium/WebKit × both motion settings | Open, Escape, focus return, 30 consecutive Tab presses per case: pass | Repeated on final build |
| Language switch | Same-route links on all pages; persisted header after home → portfolio client navigation | Pass; 404 switchers intentionally go to each language's home | No fix needed |
| Client navigation/history | Home at 850px → portfolio at 950px → Back → Forward, both engines/all languages/motion settings; extended home/portfolio/project stack | Initial unscrolled-destination check passed, but two nonzero positions exposed intermittent restoration of 950px on home instead of 850px. Reproduced on LIVE (4/12 cases) and local (3/12), normal motion only | `4e27ab9`: snapshot the destination scroll at `astro:before-preparation`, before an outgoing scrollend can overwrite history. Final regression verification below |
| Lightbox | All languages/engines/motion settings | Image decodes, ArrowRight changes frame, swipe handler advances, Escape closes: pass | Repeated on final build |
| Film/Reel player | Published Casmara film, all languages/engines/motion settings | Actual 1920×1080 media decodes and time advances; Escape closes and removes video: pass | Repeated on final build |
| Filters | Portfolio and films | Not applicable: one project/category and one film; filter controls are intentionally absent | No fabricated content added to exercise an unavailable UI |
| Delivery calculator → WhatsApp | Chosen date 2027-05-17, all languages/engines/motion settings | Pass; decoded prefill includes the selected day, month and year in page language | Repeated on final build; no message sent |
| Contact channels | All WhatsApp prefills; Telegram, Viber, telephone, email, Instagram, Pinterest | `wa.me/37368648820` returns 302 to WhatsApp; `t.me/+37368648820`, Instagram and Pinterest endpoints return 200. Exact `tel:+37368648820`, `mailto:ellinayatsenyuk@gmail.com`, and Viber number verified | Pass; no calls, email, or chat messages sent |
| Live redirects | www home/portfolio/project/contact and locale/missing paths; legacy `/ru/`, `/ru/portfolio/`, `/ru/work/…/` | www → apex 308 preserving path; legacy RU → root equivalent 308; RU/RO/EN unknown paths return localized 404 | Pass; local static preview is not evidence of edge routing |
| Motion | First load and fast scroll, home/portfolio/project at 390/1440; screenshots at target 50ms intervals on live and final local | No observed blink/re-hide, jump to 0,0, or permanently slit image. Fast scrolling can show the intentional aperture reveal in progress | Separate live per-photo pause check: 48 frames, none stuck; residual clip at 1.1s at most 0.022%, effectively open |
| Lighthouse | Mobile + desktop on `/`, `/portfolio/`, `/work/casmara-international-seminar-2026/`, `/contact/`, `/ro/`, `/en/`, live and final local | Live performance 99–100, accessibility 96–97 due to footer contrast, best practices/SEO 100; CLS 0 | Full numbers below |
| Build and required checker | `NODE_ENV=development npm ci`, production build, `node /tmp/pwcheck/check.mjs .vercel/output/static http://localhost:4477`, `git diff --check` | Install: 0 vulnerabilities. Build passes | Final result below |

## Interpretation and limits

- The official event title “Casmara International Seminar 2026,” brand/protocol names, social-platform names, “Reels,” and the Latin brand wordmark are proper names, not untranslated generic UI. Romanian/English text and image descriptions contained no stray Cyrillic UI copy. Portfolio images deliberately have empty `alt` inside already-labelled buttons; the localized description is in the button's accessible name/caption and becomes the lightbox image alt.
- The lightbox swipe check dispatches the site's touch handler; this is browser automation, not a physical-device gesture test. WebKit uses Playwright's iPhone 15 profile, not hardware Safari. Native Viber/phone/email app handoffs and recipient ownership cannot be proven without opening installed apps or contacting the owner; URI correctness was verified.
- An HTTP 200 from Instagram/Pinterest proves endpoint availability, not an authenticated account session. No credentials were entered.
- Motion sampling targets 50ms; actual timestamps are retained because screenshot/render/network overhead can delay a sample. Images appearing after their first network load are not counted as a blink. The designed shutter masks are not classified as defects when they open normally after stopping.
- Automated axe/Lighthouse results are not a claim of complete WCAG certification. Visual, keyboard, and interaction checks supplement them.
- The original local interaction harness checked video removal in the same tick as Escape and falsely reported six Chromium failures. Native `close` is queued; adding a 300ms wait resolved all live cases and the final rerun. This was a test timing error, not an application fix.
- The preview server was restarted after rebuilding replaced its static directory; a brief connection-refused verification attempt was discarded and rerun. Live availability was unaffected.

## Evidence and reproduction

Committed compact machine-readable results and selected before/after images are in [qa-evidence](qa-evidence/). Reproducible harnesses and commands are in [qa-scripts/README.md](qa-scripts/README.md). Full screenshots, 50ms frame sequences and raw Lighthouse reports remain locally under ignored `screenshots/qa-final/` to avoid adding thousands of generated image files to the repository.

## Lighthouse numbers

Lighthouse 13.5.0, Chromium via Playwright 1.64.1, axe-core 4.14.0. Scores are **Performance / Accessibility / Best practices / SEO**. Mobile uses Lighthouse defaults; desktop uses 1440×900, 40ms RTT, 10Mbps, CPU multiplier 1. Local and live use different delivery stacks (the local server does not compress assets), so their performance scores are not a controlled before/after comparison. All 24 reported runs have CLS **0**.

| Route | Live mobile | Final local mobile | Live desktop | Final local desktop |
|---|---|---|---|---|
| `/` | 100 / 97 / 100 / 100 | 96 / 100 / 100 / 100 | 100 / 97 / 100 / 100 | 100 / 100 / 100 / 100 |
| `/portfolio/` | 100 / 96 / 100 / 100 | 98 / 100 / 100 / 100 | 100 / 96 / 100 / 100 | 100 / 100 / 100 / 100 |
| `/work/casmara-international-seminar-2026/` | 100 / 97 / 100 / 100 | 96 / 100 / 100 / 100 | 100 / 97 / 100 / 100 | 100 / 100 / 100 / 100 |
| `/contact/` | 100 / 96 / 100 / 100 | 98 / 100 / 100 / 100 | 100 / 96 / 100 / 100 | 100 / 100 / 100 / 100 |
| `/ro/` | 99 / 97 / 100 / 100 | 97 / 100 / 100 / 100 | 100 / 97 / 100 / 100 | 100 / 100 / 100 / 100 |
| `/en/` | 99 / 97 / 100 / 100 | 97 / 100 / 100 / 100 | 100 / 97 / 100 / 100 | 100 / 100 / 100 / 100 |

## Axe numbers

| Target | Pages scanned | Pages with violations | Rule instances | Affected nodes |
|---|---:|---:|---:|---:|
| Live baseline | 21 | 18 | 18 | 36 |
| Local baseline | 21 | 18 | 18 | 36 |
| Final local | 21 | 0 | 0 | 0 |

Final local has **0 violations on all 21 pages**. Axe incomplete/manual-review items remain tool advisories rather than automatic failures; their counts are retained per page in the evidence.

## Final verification at `4e27ab9`

| Check | Result |
|---|---|
| Final build | Pass: 21 generated pages; localized 404/security/legacy redirect post-processing successful |
| Full browser matrix | 168/168 completed; 0 errors, 0 broken images, 0 horizontal overflow; all expected statuses/languages |
| Interaction suite | 252/252 checks pass across 12 engine/language/motion cases |
| Distinct Back/Forward positions | 12/12 cases pass: home 850px and portfolio 950px restored correctly; menu toggle close and actual language-switch clicks also pass |
| Extended history stack | 18/18 cases, 72/72 traversal checks pass: home 850px → portfolio 950px → project 1300px → Back twice → Forward twice; Chromium phone/desktop and WebKit iPhone, all languages/motion settings |
| Reverse keyboard / lightbox | 6/6 engine/language cases pass: 25 Shift+Tab steps remain in menu; ArrowLeft reverses ArrowRight; close button closes and returns focus |
| Text-range clipping | 0 failures in 54 content-page/width combinations after footer fix; all nine home language/width checks fit |
| Motion | 660 live + 660 final-local frames, six sequences per target; timestamps/cadence retained in `motion-summary.json`. Direct load and scrolling use RU as the representative shared motion implementation; all locales were separately scrolled in the full matrix |
| Required command | `node /tmp/pwcheck/check.mjs .vercel/output/static http://localhost:4477` → `pages: 20 x 2 widths, internal links: 18` / `NO ISSUES` |
| Diff hygiene | `git diff --check` passes |

The required checker enumerates 20 `index.html` pages; the RU fallback is `404.html`. The comprehensive matrix adds actual nonexistent paths in all three languages, so its route/language count is 21.

## What remains

| Item | Reason / disposition |
|---|---|
| Live site still shows the four baseline defects | Deployment was explicitly prohibited. Fixes are committed only on this branch |
| Physical iPhone/native contact-app handoffs | Browser emulation and URI verification completed; no real messages/calls or authenticated app handoffs performed |
| Multi-category filters | No such controls are rendered with the current single project and film; not a defect |
| Local mobile performance 96–98 vs live 99–100 | Different delivery stack and lab run; no application performance defect established. No speculative optimization/redesign made |

No confirmed application defect remains open in the tested scope. The four implementation commits are `b3b33ab`, `5a778dc`, `7f4e892`, and `4e27ab9`.
