// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

// Static preview builds (no server) set STATIC_PREVIEW=1 — see scripts/static-preview.mjs
const isStaticPreview = process.env.STATIC_PREVIEW === '1';
const buildDate = new Date().toISOString();

export default defineConfig({
  // Canonical domain confirmed by Ian; SITE_URL may override it for an explicit environment
  site: process.env.SITE_URL || 'https://ellinayatsenyuk.com',
  output: 'static',
  adapter: isStaticPreview ? undefined : vercel({ imageService: false }),
  integrations: [
    sitemap({
      // Client galleries under /g/ are unlisted: never in the sitemap
      filter: (page) => !page.includes('/admin') && !/\/404\/?$/.test(page) && !new URL(page).pathname.startsWith('/g/'),
      // hreflang alternates: Russian at /, Romanian at /ro/, English at /en/
      i18n: { defaultLocale: 'ru', locales: { ru: 'ru', ro: 'ro', en: 'en' } },
      // x-default (Russian at /) next to the language alternates, and the build date as lastmod
      serialize(item) {
        // The integration shares one links array between the language versions of a page: copy, never push
        const links = (item.links ?? []).filter((l) => l.lang !== 'x-default');
        const ru = links.find((l) => l.lang === 'ru');
        if (ru) item.links = [...links, { lang: 'x-default', url: ru.url }];
        item.lastmod = buildDate;
        return item;
      },
    }),
  ],
  // One URL per page: /portfolio redirects (308) to /portfolio/
  trailingSlash: 'always',
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  image: {
    responsiveStyles: false,
  },
  build: { inlineStylesheets: 'auto', assets: 'assets' },
});
