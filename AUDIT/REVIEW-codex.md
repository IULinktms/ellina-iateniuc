# Codex review — Ellina design / UX polish

Base: `24312ab`. Reviewed locally in the existing Orca branch. No push, merge, or deployment.

## Findings resolved by Claude

1. The new two-column portfolio still advertised three-column image widths to the browser. Updated conditional `sizes` and image candidates match the larger frames.
2. At 320px the home WhatsApp pill clipped its label. Narrow-screen actions now wrap with a full-width primary button.

## Independent verification

- Inspected before and after RU screenshots for home, portfolio, films, about, contact, Casmara project, and 404 at 390 and 1440, including full-page views.
- Browser checks at 320, 390, 1440: six main RU pages plus RO/EN contact (24 combinations); no JavaScript errors or horizontal overflow.
- Header uses normal blending; fake hero readout/timecode elements absent; portfolio captions visible without hover.
- WhatsApp and Telegram menu actions measure 52px high. At 320×568 the menu is scrollable with no horizontal overflow.
- Contact actions measure 52px on phones and 84px desktop. RU email at 390×844 occupies y646–698, fully visible.
- Booking bar appears after the opening and hides at the footer and while the menu is open. Contact has no bar.
- With normal motion, followed home → portfolio → project → menu → contact → browser Back. No errors; menu closes; Contact has no stale booking padding; Back restores project.
- Project facts have no overflow at 390px; category/place/year/client stay in a consistent order.
- `git diff --check` passed.

The screenshot capture scripts scroll through animated sections before full-page capture; pinned sections in full-page images represent a scroll state. Live interaction checks were used for booking visibility and navigation.

Additional final checks: RO/EN home and contact screenshots inspected at 390 and desktop home at 1440. At 320px the corrected hero button has clientWidth = scrollWidth = 286px and its full label is visible. When the mobile bar is visible, computed body bottom padding is 76px (plus safe-area on devices that expose it).

Final required health check passed against the unchanged build served by a Node static server on port 4455: `pages: 20 x 2 widths, internal links: 21`; only `[link] /404/ -> 404`. Two earlier Python SimpleHTTPServer runs hit image socket resets; the same asset URLs returned 200 directly. Switching only the local preview server eliminated those failures. No remaining blocking findings in the requested scope.
