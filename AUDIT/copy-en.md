# English copy audit: Ellina Yatsenyuk site

Source: `/home/claude/ellina-live` (read-only). Paths below are relative to that root. The machine-readable fix list is `/tmp/claude-0/-home-claude/b8dd7c0a-821e-5b89-a936-3dbe4d432cb3/scratchpad/audit/copy-en.json` (36 entries, absolute paths, each `old` verified unique in its file). Nothing in the source was edited.

## Part 1: Copy

**Spelling decision: British English (en-GB).** All user-facing English already uses British forms (organisers, programme, panellist, coloured, Colourful), and the site's date locale is `en-GB`. No American spellings were found in user-facing English. The inconsistencies that did exist are ampersands vs "and" and straight vs curly apostrophes, both fixed below.

### Copy fixes (applied in copy-en.json)

| file:line | current | proposed | why |
|---|---|---|---|
| src/content/pages/en/site.json:5 | "Event photographer & brand content creator" | "Event photographer and brand content creator" | Ampersand in a job title; this string also feeds JSON-LD `jobTitle`. |
| src/content/pages/en/site.json:10 | seoTitle "Ellina Yatsenyuk — Events & brand content in Chișinău" (53 chars) | "Ellina Yatsenyuk — Event photographer in Chișinău" (49) | Leads with the service people search for. "Brand content" is vague. |
| src/content/pages/en/site.json:11 | seoDescription, 160 chars, "…companies and small businesses in Chișinău, Moldova" | "Event photography and aftermovies, brand photo shoots, Instagram Reels and monthly social content for businesses in Chișinău, Moldova." (about 135) | 160 is over the ~155-character cut-off in search snippets. |
| src/content/pages/en/about.md:10 | "Speakers and guests forget I'm there." | "…forget I’m there." | Straight apostrophe. The rest of the site uses curly. |
| src/content/pages/en/about.md:23 | "the full gallery and films within a week" | "the full gallery within five working days and films within ten" | Contradicts the same page's "five working days" and the config (`galleryDays: 5`, `filmDays: 10`). "A week" promises more than the films timing. **Confirm the 10-day film turnaround with her.** |
| src/content/pages/en/about.md:24 | seoDescription, identical to site.json | "About Ellina Yatsenyuk: event photographer and videographer in Chișinău, covering conferences, seminars and brand content." (122) | Duplicate meta description on the home and about pages. |
| src/content/pages/en/booking.json:2 | title "Let’s plan your shoot" (contact `<title>`) | "Book an event or brand shoot in Chișinău" | No keywords or location in the title. The visible H1 comes from a separate string, so the heading does not change. |
| src/content/pages/en/booking.json:48 | "Monthly SMM package" | "Monthly social media package" | "SMM" is agency jargon. Small-business clients may not know it. |
| src/content/pages/en/booking.json:54 | "I've received your request…" | "I’ve received your request…" | Straight apostrophe. |
| src/content/pages/en/booking.json:36 | "Instagram content / Reels" | "Instagram Reels and content" | Slash reads as a list. |
| src/content/pages/en/booking.json:42 | "Brand / business photo shoot" | "Brand and business photo shoot" | Same. |
| src/content/pages/en/booking.json:24 | "Speaker & business portraits" | "Speaker and business portraits" | Ampersand consistency. |
| src/content/pages/en/booking.json:30 | "Aftermovie & reels" | "Aftermovie and reels" | Ampersand consistency. |
| src/content/pages/en/home.json:51 | statementTitle "Events and brands. Thoughtfully captured." | "Events and brands, shot quietly." | "Thoughtfully captured" is a stock phrase. "Quietly" echoes the statement ("I work quietly"). |
| src/content/pages/en/home.json:20 | "Seminars & workshops" | "Seminars and workshops" | Ampersand consistency with body copy. |
| src/content/pages/en/home.json:38 | "Galas & celebrations" | "Galas and celebrations" | Same. |
| src/content/pages/en/home.json:44 | "Brands & social media" | "Brands and social media" | Same. Matches the i18n category label below. |
| src/lib/i18n.ts:55 | home lede "Event photography & aftermovies. Brand photography, Instagram Reels & social media content." | "Event photography and aftermovies. Brand photography, Instagram Reels and social media content." | Ampersand fragments read like tags. Full sentences elsewhere use "and". |
| src/lib/i18n.ts:73 | films.seoTitle "Films & video" | "Films and video" | Ampersand consistency. |
| src/lib/i18n.ts:84 | categories.Brands "Brands & social media" | "Brands and social media" | Matches home.json label. |
| src/lib/i18n.ts:63 | about.title "About" (contact `<title>`) | "About event and brand photography" | A bare "About" has no keyword. Rendered title becomes "About event and brand photography — Ellina Yatsenyuk" (52 chars). |
| src/lib/i18n.ts:71 | contact submit "Check availability" | "Send my request" | Weak and misleading. The button sends an enquiry. "Check" implies an instant answer, while the site promises a reply within one working day. |
| src/lib/i18n.ts:88 | client hint "Previews {d} at {t}. Full gallery by {g}." | "Previews on {d} at {t}. Full gallery by {g}." | Missing preposition. Currently renders "Previews 3 Nov at 21:00". |
| src/lib/i18n.ts:180 | studio.trust "Good work. Good company." | "Clients and partners." | Slogan-like heading above the client logos. It claims quality and names no one. |
| src/lib/i18n.ts:180 | advanceHint "Enable, then scroll through this image to continue. Escape cancels." | "Turn on, then keep scrolling to move on. Press Escape to cancel." | "This image" is ambiguous. The sentence is also hard to parse. |
| src/lib/i18n.ts:81 | notFound "This page doesn't exist" | "This page doesn’t exist" | Straight apostrophe. |
| src/content/projects/en/design-sprint-workshop.md:8 | excerpt "Documentation of a three-day product workshop…" | "Photographs from a three-day product workshop, used for internal communication and recruiting." | "Documentation of" reads clinical. Moot if the project is hidden (see Part 2). |
| src/content/projects/en/future-of-work-summit.md:8 | "for the organisers' social channels" | "organisers’ social channels" | Apostrophe. Moot if hidden. |
| src/content/projects/en/future-of-work-summit.md:45 | "for the following year's marketing" | "year’s marketing" | Apostrophe. Moot if hidden. |
| src/content/projects/en/leadership-seminar.md:41 | "their next season's programme and the speaker's own website" | curly apostrophes | Apostrophe. Moot if replaced by Casmara. |
| src/content/films/en/launch-night-reel.md:7 | "A vertical-friendly reel delivered the morning after the launch." | "A short reel, delivered the morning after the launch." | The file has no `aspectRatio`, so it defaults to landscape. "Vertical-friendly" is wrong. |
| src/content/films/en/{future-of-work-aftermovie,launch-night-reel,leadership-seminar-highlights,partners-gala-recap}.md:17 and showreel-2026.md:16 | credit role "Camera & edit" | "Camera and edit" | Consistency. |

### Flagged, not changed (needs a decision)

1. **CTA set is inconsistent.** Nav says "Book a shoot". Hero and calculator say "Check your date" / "Check this date". Home, about and contact headings say "Plan your shoot". The form now says "Send my request". Suggest one primary CTA, "Check your date", with "Plan your shoot" kept only as a heading. Not changed.
2. **"The studio, in numbers"** (i18n studio.numbers). This is a one-person business, so "studio" may over-claim. Consider "In numbers". Not changed.
3. **Film kind enum has both `Reel` and `Reels`** (src/content.config.ts FILM_KINDS). The English films use only `Reel`, so the `Reels` value is unused. Content-model cleanup, not a copy issue.
4. **Process claims need her confirmation.** About process says "previews the same evening", "full gallery within five working days", and "films within ten" (now fixed). The home run-of-show timings (07:30 to 21:00) are generic. Keep only if they reflect real practice.
5. **Headings that work and were left alone:** "Invisible on the day", "Out of frame", "Hundreds of frames. Only the ones worth sending."

### SEO length check (after fixes)

| Field | Before | After |
|---|---|---|
| Home title (site.seoTitle) | 53 | 49 |
| Home description | 160 | about 135 |
| About title (rendered) | "About — Ellina Yatsenyuk" (generic) | "About event and brand photography — Ellina Yatsenyuk" (52) |
| About description | duplicate of home | 122, unique |
| Contact title (rendered) | "Let’s plan your shoot — …" (no keywords) | "Book an event or brand shoot in Chișinău — Ellina Yatsenyuk" (59) |
| Films, portfolio descriptions | 90 | unchanged, within range |

---

## Part 2: Demo and placeholder content

**Casmara International Seminar 2026 is not in the repository.** Nothing matches "Casmara" in the source. Any replacement needs her photos, the event details, the location, and the client's approval. Suggested mapping: Casmara is a 2026 seminar, so it replaces **Leadership Seminar** (the only 2026 seminar in English, category Seminars). Its highlights film is replaced only if she has a cut.

### Projects (`src/content/projects/en/`)

Projects are shown only when their slug appears in `featuredProjects` (home.json), so if you hide one, remove it from that list as well. The four featured ones are future-of-work-summit, leadership-seminar, annual-partners-gala and faces-of-the-forum.

| file | what it claims | recommendation |
|---|---|---|
| future-of-work-summit.md | Subtitle "Two days, 1,200 guests, 40 speakers"; location "Palatul Republicii"; body "60 previews each evening at 21:00"; client "Event placeholder"; Organiser "Placeholder agency"; caption "Day two: the investors' panel." | **Hide** until she confirms the event and numbers. The headline figures look invented. Also remove from featuredProjects. |
| leadership-seminar.md | "A one-day seminar for 120 managers"; client "Training company placeholder"; body says the client used the gallery for the next season's programme and the speaker's website; credit "Highlights film" | **Replace with Casmara International Seminar 2026** (category Seminars, year 2026). Remove the body claim unless it is true for Casmara. |
| annual-partners-gala.md | "An evening for 300 guests"; client "Corporate client placeholder"; agency "Placeholder agency"; "I arrive two hours early" | **Hide** unless it is real and she confirms the 300 figure. |
| design-sprint-workshop.md | "Three days of workshops for a product team"; client "Tech company placeholder" | **Hide.** The client and purpose are not verifiable. |
| faces-of-the-forum.md | Client "Conference placeholder"; the event named "Forum" is unidentified; portraits are named portrait-andrei/elena/irina/maria/victor.jpg, and their alt text reads like stock ("Businesswoman in a grey blazer…") | **Hide.** If these are stock portraits shown as real speakers, they misrepresent the work. Verify each person and their consent. |
| inside-the-office.md | "A library of 150 images the company still uses"; client "Company placeholder" | **Hide** unless it is a real client who will confirm the 150 figure. |
| launch-night.md | Client "Brand placeholder"; "Twenty photos were delivered during the event" | **Hide** unless real. |

Client and credit names containing "placeholder" are filtered out at render time by `hasRealContent` (src/lib/content.ts:9). That is a guard, not a fix. Clear these fields in the CMS.

### Films (`src/content/films/en/`)

Duration check: each MP4 in `public/media/films/` runs about 5:15 to 5:23, but the front matter claims 0:13 to 0:20. The clips are uniformly encoded ("Lavf60.16.100") with no metadata. That fits exported placeholders or stock footage.

| file | what it claims | recommendation |
|---|---|---|
| showreel-2026.md | Duration "0:20" (file is 323 s); location "Various"; **the home hero video** and featured. A sampled frame (~2:30) shows what looks like a generic stock-style office meeting, not an event. | **Replace with her real showreel.** Confirm footage ownership first. This is the highest-priority item. |
| future-of-work-aftermovie.md | Duration "0:16" (file 318 s); "used to sell the next edition"; a sampled frame shows a real-looking conference audience | **Hide** until she confirms the event and the claim. |
| leadership-seminar-highlights.md | Duration "0:13" (file 315 s); "cut for the training company's social channels"; featured | **Replace with a Casmara highlights cut** if she has one. Otherwise hide. |
| partners-gala-recap.md | Duration "0:16" (file 318 s); featured | **Hide** unless real, and fix the duration. |
| launch-night-reel.md | Duration "0:13" (file 315 s); described as vertical, but no `aspectRatio` set, so landscape | **Hide** unless real. |

### Video links and social URLs

| location | what it claims | recommendation |
|---|---|---|
| src/content/pages/en/site.json socials: Vimeo `https://vimeo.com/` | A generic Vimeo root, not her profile | **Replace** with her Vimeo URL, or remove. |
| site.json socials: Telegram `https://t.me/` | A generic root | **Remove** from socials. A direct Telegram link already exists in `telegram`. |
| site.json `telegram`: `https://t.me/+37368648820` | A phone-based invite link | **Verify** it is hers. |
| site.json Instagram and Pinterest | Real accounts (per DECISIONS.md) | **Keep.** |
| films: `videoUrl` | Not set on any English film | None. |

### Clients, testimonials, statistics (src/content/pages/en/home.json)

| location | what it claims | recommendation |
|---|---|---|
| clients: "TODO · Company 01" to "TODO · Company 04" | Placeholder clients. Hidden by `hasRealContent` while the name starts with "TODO" | **Delete** or replace with approved logos and permission. |
| testimonials: two entries, quote "TODO — Add an approved client recommendation…", name, role and company all TODO | Placeholder testimonials, hidden at render | **Delete** or replace with quotes she has approval to publish. Do not invent. |
| stats: "Events covered" 0, "Years of experience" 0, "Photographs delivered" 0 | Zero values, hidden at render | **Fill only with verified numbers, or delete.** |
| stats: "Gallery delivery" 5, "working days" | Matches site.json `galleryDays: 5` | **Keep, after she confirms.** |
| runOfShow (7 moments, 07:30 to 21:00) | Generic conference running order; its images come from demo folders (summit-*, gala-hall.jpg) | **Verify** that it reflects her real practice. Keep the text if it does. |

### Images

Images in `src/assets/uploads/` (about 60 files) have stripped EXIF, so authorship cannot be confirmed from the files. The portraits and the demo project images are the highest risk (see Faces of the Forum and the Projects list above). **Confirm that every image in a shown project is hers before launch.**

---

## Notes for the owner

- All 36 copy fixes are in `/tmp/claude-0/-home-claude/b8dd7c0a-821e-5b89-a936-3dbe4d432cb3/scratchpad/audit/copy-en.json`. Apply them with an exact string replace. Each `old` appears once in its file.
- Some fixes apply to projects that the Part 2 list recommends hiding. They are harmless but moot in that case.
- The Ro and Ru dictionaries and CMS files were not audited, as requested.
