# Design/UX polish: results

Branch `IULinktms/ellina-design-polish-ux-audit-980h`, base `24312ab` (Phase 2). Source audit: `ellina-audit-design-ux-ejds/AUDIT/design-ux.md`.
Local only: nothing pushed, no PR, no deploy. Builds ran with `NODE_ENV=development` and Homebrew Node. The static output was served on `localhost:4455` only.

Commits:

- `2e21e56` Baseline screenshots (`AUDIT/polish-before/`, captured from the `24312ab` build before any edit)
- `0079c35` Code and asset changes
- the commit that adds this file, plus `AUDIT/polish-after/`

Phase 2 content is unchanged: Russian at `/`, Romanian at `/ro/`, English at `/en/`, the Casmara case, demo projects and films still `draft: true`, and the WhatsApp-first booking. No marketing copy was edited. The only content change is the hero alt text. It now describes the new frame, and it reuses the existing per-language alt for that same photo in the Casmara gallery.

## Photo provenance (hero)

| | Before | After |
|---|---|---|
| File | `src/assets/uploads/casmara-stage-team.jpg` | `src/assets/uploads/casmara-hero-certificates.jpg` |
| Source | Frame grab from `~/Downloads/Telegram Desktop/IMG_3651.MP4` (the 1.6 s stage clip, also the film). Commit `e145f2e` says so. | Camera original `~/Downloads/Telegram Desktop/IMG_3958.JPG` |
| Pixels | 1920×1080, video frame, soft. On a phone, cover-cropping scaled about 680 px of width up to the screen. | Original 3603×5405 (Panasonic DC-S5M2), exported at 3000×4500 |
| Processing | n/a | sharp: auto-rotate, resize to 3000 px wide, sRGB, mozjpeg q86. All EXIF and GPS removed (verified, no EXIF block in the output). 962 KB. |
| SHA-256 of source (first 20 hex) | `c57ba4121b4e8a7a2767` (MP4) | `dc08f70f94112e54fc50` |
| What it shows | Team on stage applauding, host with microphone | Certificate handover: two participants with Casmara certificates beside the brand presenter, logo on the screen behind |

How it was picked: I looked at all eleven `IMG_*.JPG` in Telegram Desktop as one contact sheet.

- `IMG_3212` is the studio portrait of Ellina. It is not a Casmara frame.
- Seven are photo-wall poses on a white backdrop. White would wash out the bone-coloured name.
- `IMG_3958` and `IMG_3961` are the two seminar-room moments. I chose `IMG_3958`. It has three faces at a readable scale, the logo screen, and darker surroundings under the type. It is the same presenter as in the old video grab.

The same frame also appears once in the Casmara gallery (`casmara-certificates.jpg`, the 2000 px copy). That makes two roles, not five.

Delivered sizes: WebP at 640/960/1280/1920/2560. `sizes` is `(max-aspect-ratio: 3000/4500) 67vh, 100vw`, so a 390×844 phone at DPR 3 asks for the 1920 file and a 1440 desktop at DPR 2 for the 2560 file. `object-position` is 50% 22% on desktop and 30% on tall screens.

Not changed and still the video grab: the films poster for “Casmara: команда на сцене”. That is correct, because it is that film. The site share image (`site.json` `shareImage`) is also unchanged, because 1200×630 OG cards do not show the softness. Swap it in the CMS if wanted.

## What changed

| Request | Change | Where |
|---|---|---|
| Sharp original hero | New poster from `IMG_3958.JPG`, see above. Wider srcset and correct `sizes`. | `index.astro`, `*/home.json`, new upload |
| Remove fake exposure/timecode/REC | Viewfinder HUD (corner brackets, focus point, ISO/ƒ/shutter/EV readout), hero timecode with the blinking dot, and the intro counter removed: markup, `viewfinder()` and `heroClock()` in `app.ts`, and their CSS | `index.astro`, `app.ts`, `global.css` |
| Eliminate nav blend difference | `.nav` no longer uses `mix-blend-mode: difference`. Light type always. A soft dark scrim at rest, and a 94% black bar once scrolled, so light sections (disciplines, about principles) never sit under the type. | `global.css` |
| Mobile menu: prominent WhatsApp/Telegram, fits 320, scrolls on short heights | New `.menu__book` row: WhatsApp as the solid pill, Telegram outlined, both full buttons (52 px) right under the page list. The other channels (email, Viber, phone, languages, socials) follow. The menu is top-aligned and keeps `overflow-y: auto`. Measured WhatsApp button top/bottom: 324/376 px at 320×568, 360/412 px at 390×844. At 320×568 the menu scrolls (553 of 496 px) to reach the socials. | `Base.astro`, `DirectContact.astro` (`skip` prop), `global.css` |
| Sticky booking: safe area, bottom reservation, hidden at contact/footer | The bar was already inset by `env(safe-area-inset-bottom)`. It now hides while any booking block or the footer is within 96 px of the screen (home CTA, delivery calculator, project “next is your event”, contact desk). While visible it sets `html.has-booking-bar`, which reserves its height plus the safe area as `body` padding-bottom and `scroll-padding-bottom`. The class is removed on navigation. Still absent on Contact and 404. | `app.ts`, `global.css` |
| Contact email fits a 390 phone, targets ≥44 px | Phone contact head and desk tightened. Channel buttons are 52 px. Email bottom is at 698 px on 390×844 RU (707 px RO/EN) and 695 px on 375×667. The desktop hero “Смотреть работы” (was 33 px) and “Как мы работаем” (was 29 px) now have a 44 px hit area at every width. Below 375 px the WhatsApp pill takes a full row, so its label is never clipped. | `global.css` |
| Captions visible without hover | Portfolio captions were already persistent. With one project they now show each photo’s own description, not the same title ten times. Gallery and film captions have no hover gate. | `portfolio.astro`, `global.css` |
| Consistent project facts | Category, place, year (then client) in that order on the home spread, the portfolio and the project page. The project page’s phone grid uses a narrow first column, so “Кишинёв, Молдова” and “Casmara Moldova” stay on one line down to 320 px. Before, at 320, the place wrapped. | `index.astro` (unchanged order), `portfolio.astro`, `work/[slug].astro`, `global.css` |
| Intentional one-project layout | `/portfolio/` with a single project opens with an editorial lead: facts, linked title, excerpt. Frames follow in two columns on desktop (`sizes` 50vw, up to 1600w) and one on phones, with per-photo captions. The one-row “Проекты” index is dropped. Several projects bring back the old index, filters and captions. | `portfolio.astro`, `global.css` |
| Intentional one-Reel layout | Home films strip with one film: one wide frame, no sideways shelf, no “every film” stop. The films page feature gets a link to its project photos (existing label “Фотографии с этого мероприятия”). The films page already hid the empty grid. | `index.astro`, `films.astro`, `global.css` |
| Suppress empty sections | The stats-only proof band (“5 рабочих дней / Полная галерея”) no longer renders until there is a real client or quote. Delivery time already lives in the calculator. Already suppressed and verified: the disciplines list with one category (the intro stays), the films grid with one film, empty testimonials and clients. | `StudioProof.astro` |

## Validation

All runs are against `.vercel/output/static` served on `http://localhost:4455`.

- Build: `npm run build` is clean, with 21 pages, the 404 localisation and headers. `astro check` is not installed in this repo, so I did not install it. esbuild compiled `app.ts`.
- Probe (my script, 320×568, 390×844, 1440×900; RU home, portfolio, films, about, contact, Casmara, 404, plus `/ro/` and `/en/contact/`):
  - horizontal overflow 0 everywhere
  - `.nav` `mix-blend-mode: normal`
  - no `[data-vf]` or `[data-timecode]` in the DOM
  - no visible link or button under 44 px tall after the hero-link fix (before: two on the desktop hero)
- Contact fold: see the table above.
- Project facts: one line per value at 320 and 390 in RU/RO/EN.
- Codex’s independent runs, as reported to me:
  - 24 routes and viewports with no JS errors or overflow
  - contact targets 52 px, email visible at y≈646
  - footer hide works, with no stale bar or padding on Contact after client-side navigation
  - transitions home → portfolio → work → menu → contact → Back clean
- `/tmp/pwcheck/check.mjs .vercel/output/static http://localhost:4455`: **clean, only `[link] /404/ -> 404`** (expected; there is no root `/404/` page, the RU 404 is `/404.html`). 20 pages × 2 widths, 21 internal links. I ran it twice on the final build and got the same output both times (`/tmp/pwcheck/ellina-health-claude-node.txt`, `…-node-2.txt`).
  - The first runs (`ellina-health-final.txt`, `ellina-health-rerun.txt`) reported `ERR_CONNECTION_RESET` / `ERR_SOCKET_NOT_CONNECTED` on 2–3 images on `/en/` and `/en/work/casmara…/`. The cause was the server, not the site. Python's `http.server` dropped connections under the checker's parallel image loads, while the same assets returned 200 with curl. A targeted reload of those two pages (3×) showed 0 broken images.
  - Port 4455 now runs a small Node static server, kept outside the repo (scratchpad `serve.mjs`). It serves directory indexes, redirects `/x` → `/x/` with 301, and serves `404.html` (or `/ro|en/404/`) with status 404 for missing paths. Without a trailing slash, `/404/` stays 404 as before.

Screenshots:

- `AUDIT/polish-before/`: 43 shots, RU all pages including 404 at 390/1440, plus menus and phone mid/bottom
- `AUDIT/polish-after/`: the same set after the changes
- `AUDIT/polish-after/spot/`: RO home, contact and Casmara, plus EN home, contact and films, at 390/1440

## Not done, needs the owner

- **Run-of-show still uses stock photos.** The home “Конференция: день по часам” section shows the demo stills (gala, summit keynote with Portuguese screens, workshop, office). This is the audit’s P0-1 class, and it was outside this brief. Either swap in Casmara frames in the CMS or empty `runOfShow` to hide the section, which the template already supports.
- The five demo MP4s are still in `public/media/films/` and therefore still deployed, though no page links them (their entries are draft).
- Desktop motion items from the audit were not part of this brief: sheet and strip pins, the project-page full-bleed pin, scroll-to-next, magnetic buttons, grain loop and Lenis duration.
- `proofNumbers()` in `app.ts` is now idle (it returns when the band is absent). It was left in place for when real stats return with clients.
- The branch is not pushed, because a push would trigger a Vercel preview.
