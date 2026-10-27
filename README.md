# Ellina Iateniuc — Event Photography & Film

A cinematic portfolio site built with **Astro**, **GSAP** and **Lenis**, with a no-code editor at `/admin` (**Sveltia CMS**) and a spam-protected contact form (**Vercel function + Resend + Cloudflare Turnstile**).

Every photo and video in the repository is a **placeholder**. Ellina replaces them from `/admin` without touching code.

---

## 1. Go live (one-time setup, ~30 minutes)

1. **GitHub** — create a private repository (e.g. `ellina-iateniuc`) and push this folder:
   ```bash
   git remote add origin git@github.com:OWNER/ellina-iateniuc.git
   git push -u origin main
   ```
2. **Vercel** — *Add New → Project → Import* the repository. Framework is detected as Astro. Deploy.
3. **Domain** — `https://ellinayatsenyuk.com` is attached to the Vercel project; DNS is pending. The Astro default, CMS URLs, robots, sitemap, canonical URLs and JSON-LD use this domain. If `SITE_URL` is configured, keep it set to this same URL.
4. **Contact form email** — create a free account at resend.com, verify the domain, then add env vars in Vercel → Settings → Environment Variables:

   | Variable | Example |
   |---|---|
   | `RESEND_API_KEY` | `re_…` |
   | `CONTACT_TO` | `hello@ellinaiateniuc.com` (placeholder; await Ian’s real inbox before launch) |
   | `CONTACT_FROM` | `Website <inquiries@ellinaiateniuc.com>` |
   | `PUBLIC_TURNSTILE_SITE_KEY` | optional — Cloudflare Turnstile site key |
   | `TURNSTILE_SECRET_KEY` | optional — Turnstile secret |

   Redeploy after adding them. Spam protection works without Turnstile (honeypot field + minimum fill time + rate limit); Turnstile adds an invisible human check on top.
5. **Editor access** — in `public/admin/config.yml` replace `OWNER/ellina-iateniuc` with the real repository. Give Ellina a GitHub account with write access to the repo. She signs in at `https://her-domain/admin` with **"Sign in with token"** (a GitHub fine-grained personal access token with *Contents: read & write* on that one repo). For one-click "Sign in with GitHub", deploy the free [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth) Cloudflare Worker and set `base_url` in the config.

---

## 2. Editing guide for Ellina (no code)

Open **your-domain.com/admin** and sign in. Every save publishes the site automatically in about a minute.

| I want to… | Where |
|---|---|
| Add a new event | **Projects → New Project** (one project = one event). Add a cover, then photos under *Photo story*. Pick a layout per photo (full bleed, wide, half, small left/right). Use *half* in pairs. Categories: Conferences, Seminars, Corporate, Portraits, Celebrations. |
| Reorder photos | Drag them in *Photo story*. |
| Hide a project without deleting it | Turn on **Hide from the site**. |
| Change which projects appear on the home page | **Pages & settings → Home page → Selected work**. |
| Change the opening video | **Home page → Opening video** — her event showreel (silent MP4, 15–30 s, under 15 MB) + **Opening image** (its first frame). |
| Add a film | **Films & video → New Film**. Paste a Vimeo/YouTube link for long films, or upload an MP4 for short ones. Lowest *Order* number = the big featured film. |
| Edit About, services, email, socials | **Pages & settings → Booking page**. Each service also becomes an "event type" choice in the inquiry form. |

**Photo tips:** upload JPEGs straight from Lightroom (long edge 3000–4000 px). The editor converts to WebP on upload and the site generates every size phones and desktops need. Always fill in the *Description* field — it is read aloud to blind visitors and used by Google.

**Video tips:** hero/preview loops: H.264 MP4, 1280–1920 px wide, no audio, CRF 26–28. Films longer than ~1 minute belong on Vimeo (better streaming, no repo bloat).

---

## 3. Developer notes

```bash
npm install
npm run dev          # http://localhost:4321  (drafts visible)
npm run build        # production build for Vercel
npm run build:static-preview   # static, relative-path copy in ./preview-dist (no server/CMS)
```

**Structure**
```
src/
  content.config.ts      content model (zod schemas) — the single source of truth
  content/projects/*.md  photo stories
  content/films/*.md     films
  content/pages/*.json|md  home, about, booking, site settings
  assets/uploads/        all photos (optimised at build into responsive WebP)
  components/Frame.astro the "aperture" image component used everywhere
  layouts/Base.astro     SEO, nav, cursor, page curtain, viewer dialogs
  scripts/app.ts         motion + interaction engine
  styles/global.css      design tokens and all styles
  pages/                 routes; api/contact.ts is the serverless form handler
public/
  admin/                 Sveltia CMS (config.yml = editor fields)
  media/films/           MP4 videos
```

**Design system** — "The Aperture": every image enters through a horizontal slit that opens to full frame (scroll reveals, page transitions, viewers, menu). Tokens in `:root` of `global.css`: cinema black, bone, ash, graphite, projector-blue accent; Bodoni Moda (display) + Hanken Grotesk (UI). Motion respects `prefers-reduced-motion`; the custom cursor only appears on precise pointers.

**Performance** — static HTML, responsive WebP `srcset` with lazy loading, `fetchpriority` on heroes, video `preload="metadata"`/`"none"` with posters, hover previews loaded only on demand, fonts self-hosted.

**SEO** — per-page titles/descriptions, canonical URLs, Open Graph/Twitter images generated from covers, JSON-LD (ProfessionalService, CreativeWork), sitemap, robots.txt.

**Private client galleries** — `src/pages/g/[gallery].astro` builds one unlisted page per manifest in `src/data/client-galleries/*.json` (`slug` sets the URL `/g/<slug>/`). Web-size frames live in `src/assets/galleries/<id>/`. The full-size originals and the ZIP live in the Vercel Blob store `ellina-client-galleries` (public, random-suffix URLs) and are never committed; upload with `npx vercel blob put <file> --access public --add-random-suffix --rw-token …` (the token is `BLOB_READ_WRITE_TOKEN` from `vercel env pull`). The pages carry `noindex, nofollow` (meta plus an `X-Robots-Tag` header from `scripts/headers.mjs`), are kept out of the sitemap and are linked from nowhere: send the URL to the client directly.

**Adding a category** — add it to `CATEGORIES` in `src/content.config.ts` and to the `category` options in `public/admin/config.yml`.

Placeholder photography: Unsplash (Unsplash License). Placeholder aftermovies were rendered from those stills. Event and client names are fictional placeholders. Replace all before launch.
