# Round 4 motion audit

Baseline: `site-v3` at `8be0e18`; merged wording update `5a78601` during the audit. No design/layout changes or production deployment.

## Inventory and root causes

| Effect | Finding / treatment |
| --- | --- |
| Intro | Retired overlay stays disabled; first paint remains readable. |
| Apertures | Incoming viewport was opened again after ClientRouter's page aperture; initialize before snapshot, skip that second reveal. Wait for image decode; cancel deferred openings on teardown. |
| Parallax / hover | CSS transform transitions competed with GSAP's per-frame transforms. Give hover the independent `scale` property, preserving its 1.035 zoom. |
| SplitText / group reveals | Above-fold text could paint then be hidden by late `from()` setup. Keep already-visible text visible; initialize below-fold entrances when the module runs, not after window load. SplitText waits for loaded fonts so fallback line breaks are not retained. |
| Film strip | Pin uses explicit spacing, anticipation and refresh invalidation. |
| Floating preview | Preserve site-v3 pointer-position-before-open fix; dispose page listeners/tweens; disable for reduced motion. |
| Contact sheet | Preserve opacity dimming and preload at `top bottom+=150%`. No filter reintroduced. |
| Marquee | Cache measured width with ResizeObserver instead of reading geometry every animation frame; remove observer/ticker on navigation. |
| Project story | Full-size brightness filter replaced with equivalent opacity dim over the dark frame; aperture no longer competes with scroll zoom. |
| Home shutter / video freeze | Remove instantaneous black/white opacity sets; use a continuous shutter pulse. Pause on the last decoded video frame instead of abruptly replacing it with the poster. |
| Proof numbers | Existing observer/count tween cleanup retained. |
| Viewfinder / magnetism | All initial animations belong to page context; explicitly kill pointer tweens and remove persisted nav listeners before swap. |
| Page aperture | Existing timings/keyframes preserved. Incoming viewport preparation now precedes its snapshot. |
| LQIP | Aperture owns image entry; no opacity crossfade inside the same clipped frame. Detached decode callbacks ignored. |
| Flip filters | Finish/cancel previous Flip before taking new geometry; reveal entering photos once; kill outstanding tweens on navigation. |
| Lightbox | Decode next photo before fading current photo out; request token cancels stale rapid clicks; close/navigation kills timeline and pending swaps. |
| Menu | Kill and reset list entrance tweens before rapid toggles. |
| Back/forward | Remove unconditional scroll-to-zero. Reapply saved history scroll after pin spacers exist (project bottom was clamped by 207px). ClientRouter swaps HTML attributes: restore `js`, `has-cursor`, and `lenis` before measuring. Without this, the home timeline switched to no-JS layout: document height 10,482 → 12,475px on Back. Fixed: 10,482px both ways and exact scroll restoration. |
| Skip link | Safari touch focus no longer exposes it: hidden except `:focus-visible`; incoming client navigation clears retained skip-link focus. |
| Font swap | Bold Latin fallback uses Arial Bold with measured width adjustment; About title measure uses the equivalent em value rather than fallback-dependent ch. Partner’s measured Latin/Cyrillic preloads integrated from `8dfcb65`. |
| CSS keyframes | `rec` and grain are intentional decorative loops, reduced-motion guarded. Calculator entrance, page aperture and fallback keyframes inventoried; no large-layer filter animation remains. |

## Verification method

CDP screencasts sample changing frames at approximately 50 ms; simultaneous DOM samples record opacity, clip, transform, image readiness and geometry. Mouse-wheel traversal covers every generated route at 1440 and 390, RO/RU/EN; each route also navigates to About and back. Separate interaction recordings exercise rapid filters, lightbox changes and mobile menu toggles, with scroll-restoration assertions.

Artifacts: `screenshots/motion/{before,after}/<width>/<route>/` (JPEG sequences, `scroll.json`, `navigation.json`), plus `interactions/`. The harness is `/tmp/pwcheck/motion.mjs`; interaction harness `/tmp/pwcheck/interactions.mjs`.

Frame timing from a screencast is diagnostic, not an uninstrumented 60 fps guarantee. Trace and final test results will be added after verification.
