// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

// Static preview builds (no server) set STATIC_PREVIEW=1 — see scripts/static-preview.mjs
const isStaticPreview = process.env.STATIC_PREVIEW === '1';

export default defineConfig({
  // Canonical domain confirmed by Ian; SITE_URL may override it for an explicit environment
  site: process.env.SITE_URL || 'https://ellinayatsenyuk.com',
  output: 'static',
  adapter: isStaticPreview ? undefined : vercel({ imageService: false }),
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/admin') && !/\/404\/?$/.test(page),
      // hreflang alternates: Romanian at /, Russian at /ru/, English at /en/
      i18n: { defaultLocale: 'ro', locales: { ro: 'ro', ru: 'ru', en: 'en' } },
    }),
  ],
  trailingSlash: 'ignore',
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  image: {
    responsiveStyles: false,
  },
  build: { inlineStylesheets: 'auto', assets: 'assets' },
});
