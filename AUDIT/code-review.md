# Code review — ellinayatsenyuk.com (Astro 7.4.2 · GSAP 3.15 · Lenis 1.3.27)

Read-only review of `/home/claude/ellina-live`. A copy was installed and built in the scratchpad: `astro check` → 0 errors / 4 hints (unused vars), `astro build` → 39 pages OK. Findings below are ordered P0 (every visitor hits it) → P3 (hygiene). Line numbers refer to the live tree.

**One thing that is right and should stay:** the `astro:before-swap` teardown (`ctx.revert()` + `cleanups` + `ScrollTrigger.getAll().kill()`) is complete. I traced every listener/ticker/observer/quickTo created in `astro:page-load`: nothing duplicates after client navigation. Module-level listeners are registered once, `magnetic()` guards the persisted `.nav__cta` with `data-magnetic`, `floatPreview` self-removes with `{ once: true }`. No cleanup bugs found there.

---

## P0 — visible to every visitor

### P0-1 · Back/forward navigation always lands at the top of the page
**Where:** `src/scripts/app.ts:96-99`
```ts
document.addEventListener('astro:after-swap', () => {
  lenis?.scrollTo(0, { immediate: true });
  window.scrollTo(0, 0);
});
```
**Why:** Astro's router calls `moveToLocation()` *before* it dispatches `astro:after-swap` (`node_modules/astro/dist/transitions/router.js:244-245`). For history traversal `moveToLocation` restores `scrollTo(historyState.scrollX, historyState.scrollY)`; this handler then overwrites it with 0. Result: Portfolio → open a project → Back → you are at the top of the portfolio, not at the photo you clicked. Same on every Back/Forward. Astro already scrolls new (non-traverse) navigations to the top, so the handler's only observable effect is to break restoration. (The author's intent was to resync Lenis's internal `animatedScroll/targetScroll`; Lenis already does this from the native `scroll` event when it is not mid-animation.)

**Fix:** sync Lenis to wherever Astro put the page, and never move the page yourself.
```ts
document.addEventListener('astro:after-swap', () => {
  // Astro has already scrolled (top for new pages, restored position for Back/Forward).
  // Only tell Lenis where the page is now so the next wheel event doesn't snap back.
  lenis?.scrollTo(window.scrollY, { immediate: true, force: true });
});
```

### P0-2 · First load: everything initialises on `window.load`, so the page blinks/jumps after it has already been read
**Where:** `src/scripts/app.ts:111` (and `:1014`) — `document.addEventListener('astro:page-load', …)`
**Why:** On the *initial* load Astro fires `astro:page-load` from `addEventListener("load", onPageLoad)` (`router.js:492`), i.e. after every eager image, the hero poster and the 200 KB JS bundle have finished. Until then the HTML has painted with its final, static styles. When the handler finally runs:
- `headings()` splits every `[data-split]` and `gsap.from(lines, { yPercent: 110 })` → headings that were readable disappear and slide up (`.lede`, `.cta h2`, spread titles); `[data-split="now"]` h1s dip 8 % and re-rise → a visible jump of the page title.
- `reveals()` → `.page-head__row` (portfolio intro + filter bar), `.section-head`, `.p-facts`, `.film-card`, `.session` groups in view blink to `opacity: 0` and fade back.
- `contactSheet()` → the full 5×3 grid, already visible if the user scrolled, snaps to the zoomed-in single frame and pins.
- `apertures()` → on `/portfolio/` and `/films/` the CSS keeps every frame closed (`.js .frame[data-aperture]:not(.is-open)` at `global.css:145`) until this runs; the CSS failsafe (`global.css:920`) only opens them after 3 s. On a slow connection the gallery is a grid of thin slits for 3 s, then opens by CSS; later GSAP's clip-path tween is silently overridden by the `forwards`-filled animation.
On client-side navigations this does not happen (`onPageLoad` runs in the `updateCallbackDone` microtask, before the new state is captured), so it is specifically a first-visit / hard-reload / shared-link problem, i.e. the first impression.

**Fix:** run the page init as soon as the module executes (module scripts run after parsing, before `load`), skip the first `astro:page-load`, and refresh ScrollTrigger again once images and fonts settle.
```ts
// app.ts — replace the two `document.addEventListener('astro:page-load', …)` registrations
function initPage() {
  /* body of the current astro:page-load handler at :111-151 */
  /* then the body of the second handler at :1014-1019 (deferHeroVideo, splitLabels, motion-ready) */
}
let skipFirstPageLoad = true;
initPage();                                          // first page: now, right after parse
window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
document.fonts?.ready.then(() => ScrollTrigger.refresh());
document.addEventListener('astro:page-load', () => {
  if (skipFirstPageLoad) { skipFirstPageLoad = false; return; } // Astro fires this on window.load
  initPage();
});
```
Belt and braces for the one frame between first paint and module execution, and for anything already in view: do not animate what the visitor can already see.
```ts
const inView = (el: Element) => { const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; };
// reveals(): add as first line of the forEach callback
if (firstPaintDone && inView(group)) return;
// headings(): for data-split="now" elements that are in view, split without the 8% dip
if (el.dataset.split === 'now' && firstPaintDone && inView(el)) { bindNbsp(el); SplitText.create(el, {...}); return; }
```
where `firstPaintDone` is `true` only in the first `initPage()` call. (`document.fonts.ready` also matters for `headings()`: on RU/EN first loads SplitText measures lines with the fallback face; see P2-6.)

### P0-3 · Skip link ("Salt la conținut") shows up on iPhone Safari while scrolling
**Where:** `src/styles/global.css:81-86`
```css
.skip-link { position: fixed; left: var(--gutter); top: 0.75rem; z-index: 200; padding: 0.6rem 1rem;
  background: var(--bone); color: var(--black); transform: translateY(-200%); transition: transform 0.3s var(--ease-out); }
.skip-link:focus { transform: none; }
```
**Why:** The link is hidden only by geometry. Its box is ≈45 px tall, so `translateY(-200%)` parks its bottom edge about 33 px above the viewport, fully painted, `z-index: 200`, above everything. Two iOS Safari behaviours make it visible:
1. **Overscroll bounce at the top.** On iOS the whole layout viewport (including `position: fixed` elements) rubber-bands; a pull of more than ~33 px at the top of the page drags the cream bar into view and it springs back — this reads as "it appears when I scroll".
2. **Toolbar expand/collapse.** With `viewport-fit=cover`, while Safari animates its UI between collapsed and expanded, `fixed; top:` elements are briefly positioned against a layout viewport that is offset from the visual one by up to the toolbar height, so an element parked 33 px above the edge gets drawn inside the screen for a few frames every time the toolbars toggle (every scroll-direction change).
No other fixed element sits just above the edge (`.intro` is `display:none`, `.cursor` is `display:none` on touch, `.vf__focus`/`.float-preview` are `opacity:0`/`display:none`), which is why only this one is reported. Nothing in `app.ts` focuses `.skip-link`, so it is not a focus bug.

**Fix:** make the hidden state non-painting, keep the slide for keyboard users, and move it further away.
```css
.skip-link {
  position: fixed; left: var(--gutter); top: max(0.75rem, env(safe-area-inset-top)); z-index: 200;
  padding: 0.6rem 1rem; background: var(--bone); color: var(--black);
  transform: translateY(-300%); opacity: 0; visibility: hidden; pointer-events: none;
  transition: transform 0.3s var(--ease-out), opacity 0.3s, visibility 0s 0.3s;
}
.skip-link:focus-visible { transform: none; opacity: 1; visibility: visible; pointer-events: auto; transition-delay: 0s; }
```
(`visibility: hidden` also removes it from iOS VoiceOver's rotor until focused via keyboard, which is fine for a skip link; use `:focus` instead of `:focus-visible` if you want it to show on any programmatic focus.)

---

## P1 — hit by most visitors on a given page/device

### P1-1 · Hover zoom on photo/film cards is dead, and the aperture zoom-out stutters (CSS transition fights GSAP)
**Where:** `app.ts:184-186` (`apertures()`), `global.css:414-415` (`.masonry__item .frame img { transition: transform 900ms }` / hover `scale(1.035)`), `global.css:908-909` (`.film-card .frame img, .strip__item .frame img` same), `global.css:520-521` (`.next .frame img`, unaffected — that Frame has `aperture={false}`).
**Why:** `apertures()` runs `.from(media, { scale: 1.18, duration: 1.8 })` on the `<img>`. GSAP writes `transform` inline on every tick and, when the tween ends with all values at default, leaves `style="transform: translate(0, 0)"` (`node_modules/gsap/CSSPlugin.js:1110`). Inline style beats the stylesheet, so `.masonry__item button:hover .frame img { transform: scale(1.035) }` and the film-card/strip equivalents never apply again. During the 1.8 s zoom-out the same `<img>` also has `transition: transform 900ms`, so every GSAP frame is re-interpolated by the CSS transition → the zoom-out lags/stutters on Portfolio, Films and the home film strip (mouse users).

**Fix:**
```ts
// apertures(): hand the img back to CSS once the entrance is done (parallax frames keep GSAP ownership)
gsap.timeline({ onComplete: () => {
  frame.classList.add('is-open');
  gsap.set(frame, { clearProps: 'clipPath' });
  if (!frame.hasAttribute('data-parallax')) gsap.set(media, { clearProps: 'transform' });
}})
```
```css
/* global.css — no CSS transition while GSAP owns the transform */
.frame[data-aperture]:not(.is-open) img { transition: none; }
```

### P1-2 · "Check this date" sends the visitor to a page that drops the date
**Where:** `src/components/DeliveryCalc.astro:37` + `app.ts:640` (`cta.href = …/contact/?date=YYYY-MM-DD`), `app.ts:646-661` (prefill reads `[data-date-input]`), `src/pages/[...lang]/contact.astro`.
**Why:** The contact page no longer has a form (only `DirectContact` + sessions). `[data-date-input]`/`[data-date-hint]` do not exist, so the `?date=` the visitor just chose is silently discarded and they land on a wall of messenger links with no mention of their date. The whole `contactForm()` (`app.ts:467-571`, ~100 lines) is dead on every page.

**Fix (minimal):** carry the date into the direct channels on the contact page.
```astro
<!-- contact.astro, in the frontmatter -->
const date = Astro.url.searchParams.get('date'); // static build: read in the client instead, see below
```
Because the site is static, do it client-side in `deliveryCalc()`:
```ts
// app.ts, replace the "Booking form: prefill…" block (:646-661)
const q = new URLSearchParams(location.search).get('date');
const d = q && parseDate(q);
if (d) document.querySelectorAll<HTMLAnchorElement>('.direct-channels a[href^="mailto:"], .direct-channels a[href*="wa.me"], .direct-channels a[href*="t.me"]').forEach((a) => {
  const url = new URL(a.href);
  const text = fill(tx().dateIntro, { d: fmtDay.format(d) });            // add to dict: "Hello, I'd like to book {d}."
  if (url.protocol === 'mailto:') url.searchParams.set('body', text); else url.searchParams.set('text', text);
  a.href = url.toString();
});
```
And delete `contactForm()` + its call at `app.ts:144`, the `data-contact`/`.field`/`.chips`/`.form-*` CSS (`global.css:561-592, 633, 852`), and the dead strings (see P3-4).

### P1-3 · Film player is not closed on navigation; its video keeps playing
**Where:** `app.ts:938` closes only the lightbox: `document.addEventListener('astro:before-swap', () => { if (lb.open) lb.close(); … })`. `pl` (`[data-player]`, `transition:persist`, `Base.astro:215`) is never closed.
**Why:** With a modal `<dialog>` open the only navigation left is history (Back/Forward, swipe-back on iOS). The persisted player survives the swap, still playing audio, on top of the new page; `startScroll()` is never called for the old page either.
**Fix:**
```ts
document.addEventListener('astro:before-swap', () => {
  if (lb.open) lb.close();
  if (pl.open) pl.close();   // 'close' handler empties the stage (stops video/iframe) and restarts scroll
  resetPhotoZoom();
});
```

### P1-4 · Footer and menu link "Vimeo" to `https://vimeo.com/` (placeholder)
**Where:** `src/layouts/Base.astro:139` and `:164` render `site.socials` filtered only by `label !== 'Telegram'`; `src/content/pages/*/site.json` has `{ "label": "Vimeo", "url": "https://vimeo.com/" }` and `{ "label": "Telegram", "url": "https://t.me/" }`. Verified in the build: `<a class="line-link" href="https://vimeo.com/" …>Vimeo</a>`.
**Why:** `DirectContact.astro:9-10` and `seo.ts:34` already treat a URL without a path as a placeholder; the footer/menu do not, so every page links to Vimeo's homepage.
**Fix:**
```ts
// Base.astro frontmatter
const realSocial = (x: { url: string }) => /^https?:\/\/[^/]+\/.+/.test(x.url);
const socials = site.socials.filter((x) => x.label !== 'Telegram' && realSocial(x));
// use `socials` at :139 and :164
```

### P1-5 · Auto-playing hero reel has no pause control
**Where:** `src/pages/[...lang]/index.astro:54` `<video data-hero-video muted loop …>`; `global.css:273` still styles a `.hero__sound` button and `Icon.astro` ships `sound-on/off`, but nothing renders them.
**Why:** WCAG 2.2.2 (A): moving content that starts automatically and lasts > 5 s needs a pause/stop control. `prefers-reduced-motion` and the first-scroll freeze help but are not a user control. Also, `heroClock()` (`app.ts:583`) runs a `requestAnimationFrame` loop writing the timecode 60×/s even after the reel is frozen/paused.
**Fix:**
```astro
<!-- index.astro, inside .hero__meta -->
<button class="hero__sound line-link" data-hero-pause aria-pressed="false">{s.home.pauseReel}</button>
```
```ts
// app.ts, in heroClock(): drive the clock from the video, not rAF
const onTime = () => { tc.textContent = fmt(v.currentTime); };
v.addEventListener('timeupdate', onTime);
const pause = document.querySelector<HTMLButtonElement>('[data-hero-pause]');
const toggle = () => { v.paused ? v.play().catch(() => {}) : v.pause(); pause!.setAttribute('aria-pressed', String(v.paused)); pause!.textContent = v.paused ? tx().playReel : tx().pauseReel; };
pause?.addEventListener('click', toggle);
cleanups.push(() => { v.removeEventListener('timeupdate', onTime); pause?.removeEventListener('click', toggle); });
```
(Add `pauseReel/playReel` to `client` strings in all three locales.)

### P1-6 · Lightbox/menu scroll lock does not hold on iOS
**Where:** `app.ts:37-38` `stopScroll()` → `lenis.stop()` → `html.lenis-stopped { overflow: hidden }` (`global.css:54`), fallback `documentElement.style.overflow = 'hidden'`.
**Why:** iOS Safari ignores `overflow: hidden` on `<html>` for touch scrolling; while the lightbox is open a swipe outside the image scrolls the page underneath, so the visitor closes the viewer somewhere else on the page (and the aperture/pin ScrollTriggers have moved on). Lenis `syncTouch` is off, so Lenis is not intercepting touch either.
**Fix:**
```ts
let lockY = 0;
const stopScroll = () => { lockY = window.scrollY; lenis?.stop(); document.body.style.cssText += `position:fixed;top:${-lockY}px;left:0;right:0;overflow:hidden;`; };
const startScroll = () => { document.body.style.cssText = ''; lenis?.start(); window.scrollTo(0, lockY); lenis?.scrollTo(lockY, { immediate: true, force: true }); };
```
(Or `overscroll-behavior: contain` on the dialogs plus `touch-action: none` on `.lightbox` outside the stage; the body-fixed pattern is the one that works everywhere.)

### P1-7 · Full-screen animated grain layer on phones
**Where:** `global.css:688-696` `.grain { position: fixed; inset: -50%; … animation: grain 0.9s steps(6) infinite }`.
**Why:** A composited layer 2× the viewport in each axis (≈4× the pixels) re-composited 6–7 times a second on every page, including phones; on an iPhone that is tens of MB of GPU texture plus constant compositor work while scrolling a page that already runs Lenis + scrubbed ScrollTriggers + `backdrop-filter`. It competes directly with the 60 fps scroll effects.
**Fix:**
```css
.grain { inset: 0; background-size: 220px 220px; }                /* tile instead of oversizing the layer */
@keyframes grain { 0%{background-position:0 0} 17%{background-position:-13px 9px} 33%{background-position:11px -15px} 50%{background-position:-7px 18px} 67%{background-position:18px 4px} 83%{background-position:-15px -9px} }
@media (hover: none), (max-width: 760px) { .grain { animation: none; } }  /* still grain on touch devices */
```

---

## P2 — real but narrower

### P2-1 · Project cover video autoplays with no reduced-motion or off-screen handling
**Where:** `src/pages/[...lang]/work/[slug].astro:58` `<video autoplay muted loop playsinline preload="metadata" …>`.
**Why:** Unlike the home reel (`deferHeroVideo`), this one ignores `prefers-reduced-motion`/Save-Data and keeps decoding while the visitor is far down the gallery. No current project has `coverVideo`, so it is latent, but the CMS field invites it.
**Fix:** mark it `data-hero-video data-src={d.coverVideo}` without `autoplay`, let `deferHeroVideo()` start it, and pause it when `[data-hero]` leaves the viewport:
```ts
// parallax(): hero ScrollTrigger already exists; add
ScrollTrigger.create({ trigger: hero, start: 'top bottom', end: 'bottom top',
  onLeave: () => hero.querySelector('video')?.pause(), onEnterBack: () => hero.querySelector('video')?.play().catch(() => {}) });
```

### P2-2 · Lightbox zoom and GSAP both write `transform` on the same `<img>`
**Where:** `app.ts:920` `lbImg.style.transform = …` vs `:358-362` `gsap.set/fromTo(lbImg, { x, opacity })`.
**Why:** GSAP caches the element's transform; a raw `style.transform` write is invisible to it. Today `resetPhotoZoom()` runs before each swipe so the states coincide, but any future change (e.g. keeping zoom across arrows) will snap. Also arrow keys call `lbShow(i ± 1)` with `dir = 0`, so keyboard navigation has no slide while swipe/click do.
**Fix:**
```ts
function paintPhotoZoom() { …; gsap.set(lbImg, { x: photoX, y: photoY, scale: photoZoom }); … }
lb.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') lbShow(lbIndex + 1, 1); if (e.key === 'ArrowLeft') lbShow(lbIndex - 1, -1); });
```

### P2-3 · Nav/footer wordmark is hard-coded, not from the CMS
**Where:** `Base.astro:105` `Ellina <span>Yatsenyuk</span>`, `:168` same; `seo.ts:97` `name: 'Ellina Yatsenyuk'`.
**Why:** `site.firstName/lastName/name` exist and are editable in `/admin` ("First name (large title line 1)…"); editing them changes the hero but not the header, footer or JSON-LD creator.
**Fix:** `{site.firstName} <span>{site.lastName}</span>` in both places; `creator: { '@type': 'Person', name: site.name }` (pass `site` into `projectLd`).

### P2-4 · Home category counts and portfolio filter counts use different rules
**Where:** `index.astro:26` counts `gallery.length + 1`; `portfolio.astro:18,27` counts only `gallery.filter(g => g.inPortfolio)`.
**Why:** Identical today (no `inPortfolio: false` in content), but the first photo an editor hides from the portfolio makes the home tile say "15 fotografii" and the filter say 14.
**Fix:** `p.data.gallery.filter((g) => g.inPortfolio).length + 1` in `index.astro:26`.

### P2-5 · Film grid rhythm breaks after filtering
**Where:** `global.css:450` `.film-grid > article:nth-of-type(3n + 1) { grid-column: 1 / -1; width: 72% … }`; `filters()` toggles `hidden` (display none) on `[data-cat]` articles.
**Why:** `:nth-of-type` counts hidden articles, so a filtered view can show two wide cards in a row or none.
**Fix:** drive the layout from a class set in `apply()`:
```ts
const shown = items.filter((it) => !it.hidden); shown.forEach((it, i) => it.classList.toggle('is-lead', i % 3 === 0));
```
```css
.film-grid > article.is-lead { grid-column: 1 / -1; width: 72%; justify-self: end; }
```

### P2-6 · SplitText lines are measured before web fonts arrive (RU/EN first loads)
**Where:** `app.ts:216` `SplitText.create(el, { type: 'lines', mask: 'lines' })`, fonts `font-display: swap` (`global.css:4-8`), only `homeShutter()` waits for `document.fonts.ready` (and only refreshes ScrollTrigger).
**Why:** With P0-2 fixed, headings split before the Cyrillic/Latin-ext subsets load; after the swap a line can re-wrap inside its `overflow: hidden` mask → clipped words. The size-adjusted fallback (`global.css:862`) narrows but does not remove this.
**Fix:** GSAP 3.13+ `autoSplit` re-splits on `fonts.loadingdone`; return the tween from `onSplit` so it is rebuilt:
```ts
SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line', autoSplit: true, aria: …,
  onSplit: (self) => gsap.from(self.lines, { yPercent: …, duration: …, ease: 'expo.out', stagger: 0.06, scrollTrigger: … }) });
```

### P2-7 · Masonry/film/strip buttons wrap headings and `<figcaption>`
**Where:** `portfolio.astro:47-59` (`<button>` contains `<figcaption>`), `index.astro:166-176` (`<button class="frame-btn">` contains `<div>`, `<h3>`), `films.astro:45-57` (`<button>` contains `<h2>`, `<p>`).
**Why:** `<button>` allows phrasing content only; `<figcaption>` must be a direct child of `<figure>`. Screen readers flatten the button's children into one long name ("Redați Showreel 2026 Showreel 2026 Reel, 0:20") and lose the heading structure (h2/h3 inside a button are not announced as headings by VoiceOver).
**Fix:** keep the `<button>` on the frame only and put caption/heading as siblings, using a stretched-link pattern if the whole card must be clickable:
```astro
<figure class="masonry__item" data-cat=…>
  <button data-lb-item … aria-label={s.a11y.open(ph.alt)}><Frame … /></button>
  <figcaption><span>{title}</span><span>{category}</span></figcaption>
</figure>
```

### P2-8 · `<dd>` before `<dt>` in the proof numbers
**Where:** `src/components/StudioProof.astro:21-22` `<div><dd>…</dd><dt>…</dt></div>`.
**Why:** Invalid `<dl>` group order; AT may pair values with the wrong terms. Fix: swap so `<dt>` (label) precedes `<dd>` (value) and reorder visually with CSS `order`/`flex-direction: column-reverse` if the number must stay on top.

### P2-9 · `advance-hint` is never associated with its button
**Where:** `work/[slug].astro:133-134` `<button data-next-arm aria-pressed="false">` + `<p id="advance-hint">`.
**Fix:** `aria-describedby="advance-hint"` on the button.

---

## P3 — hygiene: dead code, dead CSS, schema drift, deps

### P3-1 · Dead JavaScript (never reachable in the current markup)
- `contactForm()` `app.ts:467-571` and its call `:144` — no `[data-contact]` form exists.
- `marquee()` `app.ts:798-825` + call `:133` — no `[data-marquee]` anywhere (and `.marquee*` CSS `global.css:768-777, 982-983`).
- `intro()` `app.ts:155-158` adds `.is-done` that no CSS uses; the `.intro` markup (`index.astro:45-49`) is `display:none` (`global.css:240`). Delete markup, CSS `:228-240`, function.
- The booking prefill branch `app.ts:646-661` (no `[data-date-input]`), unless replaced per P1-2.
- `work/[slug].astro:49-51` `titleWords/half/titleLines` and `HTML_LANG` import unused (astro check hints).

### P3-2 · Dead / conflicting CSS (global.css is 1 228 lines; the last ~300 are override layers)
Dead (selector matches nothing):
`.statement*` 280-288 · `.hero__sound` 273 · `.hero__still` 841-842 (the still is `.hero__poster`; the freeze works via line 923) · `.hero__name .line + .line` 264/275 (zeroed at 973) · `.cursor__dot` 212/222 (+ markup `Base.astro:187`) · `.direct`, `.direct a` 559-560 · `.field*`, `.field-row`, `.chips*`, `.hp`, `.form-foot`, `.form-status`, `.form-done`, `.date-hint`, `[data-form-foot][hidden]…` 561-592, 633, 852 · `.p-hero__text h1 .line` 488 · `.page-head h1 .line { overflow:hidden }` 393 (reset at 799) · `html[lang='ru'] .display / .hero__name` 792-793 (overridden 966/972) · `:lang(ru) :is(.nav__mark,…) { font-family: var(--serif) }` 965 (`--serif === --sans`) · `.masonry__item figcaption { opacity: 0 }` 416 and its hover/touch reveals 417, 419, 665 (forced to 1 at 1063) · `.spread:nth-child(even) .spread__title { margin-right }` 311 and the `:has(.spread__frame--land)` block 306-309 (identical selectors re-declared 1048-1051) · `.notfound` centring 594 (reset 1151) · `.filter { border-radius: 999px }` 400 (→0 at 1033) · `.process li { background: linear-gradient }` 540 (→none at 678 and 1101) · `.p-facts { background: graphite }` 490 (→black 1084) · `--serif/--sans` duplicated 23-24 and 961-964 · two universal `prefers-reduced-motion` blocks 598-602 and 888-895 · duplicate declarations `.nav__links` 178-179, `.disciplines a` transition 356/363, `.lightbox__stage` 429/430, `.sheet__grid` 739/745.
Conflicts that bite: `portfolio.astro:79-91` scoped `.proj-row` styles (flex, `--t-xl`) are beaten by global `main .proj-row` (grid, `--ny-title`, 1068-1071) because Astro scopes with `:where()`; delete the scoped block. `films.astro:48` inline `style="position:absolute;…"` on the preview video plus `:105` `opacity: 1 !important` — move to `.feature-film video` rules.
Naming: `--serif` is Inter Tight everywhere; rename to `--display` to stop the next person "fixing" it.

### P3-3 · CMS schema vs content.config vs reality
- `booking.successMessage` (required `z.string()`) and `successSteps`, CMS "Message after sending / What happens after sending" (`config.yml:288-296`), and the hint "These also become the options in the inquiry form" (`:282`) — there is no form. Drop from schema, JSON and CMS (or mark optional) so the editor isn't editing nothing.
- `projects.featured` (`content.config.ts:155`) — unused (home uses `home.featuredProjects`); not in CMS either. Remove.
- `films.credits` (`content.config.ts:193`, CMS `:144-152`) — never rendered. Render under the film or remove the field.
- `films.location` — only used in JSON-LD. Fine, but the CMS hint should say so.
- `site.responseTime`, `site.delivery.portraitHours` — in schema + CMS, never rendered. Either show them (contact page, sessions) or remove.
- `kind` options `Reel` **and** `Reels` (`content.config.ts:138`, `config.yml:133`) — two spellings of one thing produce two filter buttons on /films/. Keep `Reel`.
- Projects `view_filters` (`config.yml:61-67`) lack `Brands`.
- `config.yml:326` `previewTime` is `i18n: true` inside an `i18n: duplicate` object; `socials` list is `duplicate` with `i18n: true` fields (`:330-335`) — contradictory, Sveltia takes the parent; set the children to `duplicate` for clarity.
- `public/admin/index.html:11` loads `https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js` unpinned — pin a version (`@sveltia/cms@0.x.y`).

### P3-4 · Dead i18n strings and stale env
- `i18n.ts` `contact.*` except `head`/`services`; `client.sending/errorTail/required/emailBad/hint`; `bookingUi.steps/back/continue/dateOptional/nextSteps/formError/dateBad/stepOf`; `studio.cancel`; `apiErrors` (`:267-277`) — all orphaned by the form removal and shipped to the browser in `#i18n` JSON on every page.
- Key parity across ro/ru/en is complete (155 keys each, verified). Plural rules: `ro()` matches CLDR (1 / 2-19 and x01-x19 / `de` otherwise); `ru()` uses `Intl.PluralRules` correctly, genitive forms after „в течение”/„с” are right.
- `splitPath` (`i18n.ts:24`) and `app.ts:114` hard-code `(ru|en)`; derive from `LOCALES` so adding a language is one edit.
- `.env.example` lists `RESEND_*`, `TURNSTILE_*`, `CONTACT_TO=hello@ellinaiateniuc.com` for an API route that no longer exists (and an old domain).
- `scripts/static-preview.mjs:14` `fs.renameSync('src/pages/api', …)` — the folder does not exist → `npm run build:static-preview` crashes with ENOENT.
- `scripts/check-public-content.mjs` is not wired into any npm script.

### P3-5 · Dependencies and assets
- `@fontsource-variable/inter-tight` (`package.json`) is not imported anywhere; fonts are self-hosted from `src/assets/fonts`. Move to `devDependencies` (it is only a regeneration source per `fonts/README.md`) or remove.
- `@astrojs/check` + `typescript` missing from `devDependencies` — `npx astro check` prompts to install every time.
- `src/assets/uploads/summit-audience-dark.jpg` is referenced by no content.
- `Icon.astro` `play`, `sound-on`, `sound-off` unused (keep `sound-*` if P1-5 is done).
- `data-hero-rise` attributes (`index.astro:74,75,80`) are referenced by nothing.
- OG cards (`src/pages/og/[lang]/[card].jpg.ts`) are set in Bodoni Moda / Playfair while the site is Inter Tight — the share image no longer matches the brand; swap `src/assets/og-fonts` for a static Inter Tight TTF.
- `astro.config.mjs:306` `prefetch: { prefetchAll: false, defaultStrategy: 'hover' }` — no link carries `data-astro-prefetch`, so the 2.5 KB prefetch module is loaded for nothing. For a 5-route site, `prefetchAll: true` is the better default.
- `trailingSlash: 'ignore'` + Vercel static → `/portfolio` and `/portfolio/` both 200 (canonical mitigates). `trailingSlash: 'always'` makes the adapter emit `trailingSlash: true` in the Vercel config.
- `/media/films/*.mp4` (30 MB) are served without `cache-control` (only `/assets` gets `immutable`, `.vercel/output/config.json`). Add `headers` for `^/media/(.*)` in a `vercel.json` (`public, max-age=604800`).

### P3-6 · Smaller observations
- `.btn:active { transform: scale(.97) }` is dead on magnetic buttons (inline GSAP transform); use `scale` (the separate CSS property) for the press instead.
- `heroClock()` rAF loop → see P1-5 (`timeupdate`).
- Hero CTA `href="#delivery"` is a native hash jump (`.lenis-smooth { scroll-behavior: auto !important }`) while "Back to top" is a Lenis glide — route in-page anchors through `lenis.scrollTo(target)` for consistency.
- `index.astro:99/109` `data-cursor` on both `.spread__frame` and the overlay `.spread__link`; the frame's never receives pointer events.
- `Base.astro:24` `og:locale` `ru_MD` is not a Facebook-recognised locale; `ru_RU` is.
- `contact.astro:24` `aria-labelledby` on a `<div>` without a role does nothing; use `<section>`.
