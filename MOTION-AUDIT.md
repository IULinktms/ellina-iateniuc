# Round 4 motion audit

Baseline: `site-v3` at `8be0e18`; merged wording update `5a78601` and final socials update `d304bfb` during the audit. No design/layout changes or production deployment.

## Inventory and root causes

| Effect | Finding / treatment |
| --- | --- |
| Intro | Retired overlay stays disabled; first paint remains readable. |
| Apertures | Incoming viewport was opened again after ClientRouter's page aperture; initialize before snapshot, skip that second reveal. Wait for image decode; cancel deferred openings on teardown. |
| Parallax / hover | CSS transform transitions competed with GSAP's per-frame transforms. Disable CSS transitions while closed/parallax-owned, then clear the aperture's inline transform so the existing 1.035 CSS hover zoom works. The CSS compiler lowers independent scale to transform, so that approach was not used. |
| SplitText / group reveals | Above-fold text could paint then be hidden by late `from()` setup. Keep already-visible text visible; initialize below-fold entrances when the module runs, not after window load. SplitText waits for loaded fonts so fallback line breaks are not retained. |
| Film strip | Fixed-position pin transitions generated large layout-shift entries (~0.63 each). A controlled transform-pin comparison removed those entries, with the same scroll distance and appearance. Explicit spacing, anticipation and refresh invalidation retained. |
| Floating preview | Preserve site-v3 pointer-position-before-open fix; dispose page listeners/tweens; disable for reduced motion. |
| Contact sheet | Preserve opacity dimming and preload at `top bottom+=150%`. Remove the remaining static saturation filter on scaled images: controlled desktop comparison reduced worst frames from 83 ms to 33 ms. |
| Marquee | Cache measured width with ResizeObserver instead of reading geometry every animation frame; remove observer/ticker on navigation. No active marquee markup in this build, so this code path was not recorded. |
| Project story | Full-size brightness filter replaced with a black opacity overlay (separate from the image/LQIP fade); aperture no longer competes with scroll zoom. |
| Home shutter / video freeze | Remove instantaneous black/white opacity sets; use a continuous shutter pulse. Pause on the last decoded video frame instead of abruptly replacing it with the poster. |
| Proof numbers | Existing observer/count tween cleanup retained. |
| Viewfinder / magnetism | All initial animations belong to page context; explicitly kill pointer tweens and remove persisted nav listeners before swap. |
| Page aperture | Existing timings/keyframes preserved. Incoming viewport preparation now precedes its snapshot. |
| LQIP | Aperture owns image entry; no opacity crossfade inside the same clipped frame. Detached decode callbacks ignored. |
| Flip filters | Finish/cancel previous Flip before taking new geometry; reveal entering photos once; kill outstanding tweens on navigation. |
| Lightbox | Decode next photo before fading current photo out; request token cancels stale rapid clicks; close/navigation kills timeline and pending swaps. |
| Film player | Persisted dialog animation is killed and the player closed during page teardown. |
| Menu | Kill and reset list entrance tweens before rapid toggles. |
| Back/forward | Remove unconditional scroll-to-zero. Reapply saved history scroll after pin spacers exist (project bottom was clamped by 207px). ClientRouter swaps HTML attributes: restore `js`, `has-cursor`, and `lenis` before measuring. Without this, the home timeline switched to no-JS layout: document height 10,482 → 12,475px on Back. Fixed: 10,482px both ways and exact scroll restoration. |
| Skip link | Safari touch focus no longer exposes it: hidden except `:focus-visible`; incoming client navigation clears retained skip-link focus. |
| Font swap | Bold Latin fallback uses Arial Bold with measured width adjustment; About title measure uses the equivalent em value rather than fallback-dependent ch. Partner’s measured Latin/Cyrillic preloads integrated from `8dfcb65`. |
| CSS keyframes | `rec` and desktop grain are intentional decorative loops, reduced-motion guarded; phone grain is static. Calculator entrance, page aperture and fallback keyframes inventoried; no large-layer filter animation remains. |

## Verification method

CDP screencasts sample changing frames at approximately 50 ms; simultaneous DOM samples record opacity, clip, transform, image readiness and geometry. Mouse-wheel traversal covers every generated route at 1440 and 390, RO/RU/EN; each route also navigates to About and back. Separate interaction recordings exercise rapid filters, lightbox changes and mobile menu toggles, with scroll-restoration assertions.

Artifacts: `screenshots/motion/{before,after}/<width>/<route>/` (JPEG sequences, `scroll.json`, `navigation.json`), plus `interactions/`. The harness is `/tmp/pwcheck/motion.mjs`; interaction harness `/tmp/pwcheck/interactions.mjs`.

Frame timing from a screencast is diagnostic, not an uninstrumented 60 fps guarantee. Trace results and limitations are recorded below.

## Independent review reconciliation

Read `/tmp/ellina-audit/code-review.md`. The requested motion findings are covered: P0-1 history restore, P0-2 module-time initialization and visible-content protection, P0-3 non-painting skip link, P1-1 aperture transform cleanup/CSS ownership, P1-3 persisted player teardown, and P2-6 `autoSplit` after fonts with completed reveals kept visible. Additional motion fixes: touch body scroll locking with synchronous unlock before swap, no idle timecode rAF, static phone grain, and GSAP ownership of lightbox pan/zoom.

The skip link deliberately uses `opacity:0` rather than `visibility:hidden`: the latter removes it from sequential keyboard focus. Chromium Tab and WebKit keyboard-focus modality checks confirm it appears only with `:focus-visible`.


## Final verification

- Build: `NODE_ENV=development npm run build` succeeds (39 generated pages). Astro check: zero errors/warnings, four existing hints.
- Direct load / scrolling / Back: 39 routes × two widths = 78 cases, all three languages, no JS errors or horizontal overflow. Separate ClientRouter forward-navigation matrix: 78 cases, no reported issues.
- Rapid filters, lightbox and menu: six language/width combinations; decoded images remain visible, history scroll restores exactly. Persisted player closes on Back in all six combinations.
- WebKit touch menu / skip-link / reduced-motion checks: six combinations, all three languages. Scroll position preserved while locked and after closing; skip link hidden after navigation and visible in keyboard-focus modality. This is browser emulation, not a physical iPhone test.
- Requested `check.mjs` health check: 38 pages × two widths plus 39 internal links; only the deliberately missing `/404/` URL is flagged as HTTP 404. `sheet.mjs`: 15/15 images preloaded, opacity dim values correct, no errors.
- Targeted regressions: completed aperture clears inline transform and restores CSS hover; slow-module arrival does not collapse an already-visible contact sheet into its initial pin state; font resplitting keeps revealed lines visible.
- DOM visibility comparison: 156 before/after scroll sequences, zero sampled visible → hidden → visible candidates. Pixel comparison flagged 65 luminance reversals in 252 sequences (41 after); reviewed after candidates reflect initial browser canvas/image paints, scrolling across light/dark sections, intentional page-aperture/cover morphs and lightbox/filter transitions. This sampling does not prove the absence of every possible transient frame.
- Unrecorded-scroll timing traces cover five RO templates at both widths before/after. Final phone runs have no frames over 20 ms. Desktop retains six frames over 20 ms across the five templates, maximum 33.4 ms; p95 is approximately 16.7–16.8 ms. Exact >16.7 ms counts are retained in JSON (timer rounding produces many 16.8 ms samples). The strict zero-missed-frame target is not fully achieved.
- Desktop RO home layout-shift sum fell from approximately 1.248 to 0.008 after transform pinning. History tests preserve document height and exact scroll on home and project pages.

## Evidence

- Interactive before/after viewer: `screenshots/motion/index.html`.
- Route frames: `screenshots/motion/{before,after}/{1440,390}/`; interaction frames: `{before,after}/interactions/`; forward navigation: `after/forward/`; hover/viewfinder: `{before,after}/hover/`.
- Reports: `after/report.json`, `after/forward.json`, `after/player.json`, `after/touch.json`, `after/history-pins.json`, `after/review-regressions.json`.
- Timings and raw traces: `performance.json`, `{before,after}/traces/`; controlled filter comparison: `home-budget.json`.
- Diff results: `dom-diff.json`, `pixel-diff.json`, `candidates/`. Reproduction scripts archived in `screenshots/motion/tools/` (local paths/ports may need updating).

Artifacts are local and gitignored. Source commits contain the fixes and this audit. `site-v3` wording commit `5a78601` is included; no production deployment or main push.

Preview (Vercel status Ready, target preview): https://ellina-iateniuc-7az35k9z9-iul-ink.vercel.app — source `9cc59ec`.
