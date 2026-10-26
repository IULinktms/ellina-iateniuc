import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import { DEFAULT_LANG, type Lang } from './i18n';
import { typesetData, typesetHtml } from './typography.mjs';

/** Editorial drafts never become public claims or prices. */
export const hasRealContent = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 && !/^TODO|placeholder|preț provizoriu|цена уточняется|provisional/i.test(value.trim());

export type Project = CollectionEntry<'projects'>;
export type Film = CollectionEntry<'films'>;

const isProd = import.meta.env.PROD;
/** Drafts are visible in `npm run dev`, hidden on the live site. */
const visible = (e: { data: { draft: boolean } }) => !isProd || !e.data.draft;

/** Entry ids look like "ro/annual-partners-gala"; the URL slug is the part after the language. */
export const slugOf = (e: { id: string }) => e.id.split('/').slice(1).join('/') || e.id;
const inLang = (lang: Lang) => (e: { id: string }) => e.id.startsWith(`${lang}/`);
/** Non-breaking spaces and local quotes in prose fields, by the entry's own language (lib/typography.mjs) */
const typeset = <T extends { id: string; data: unknown; rendered?: { html: string } }>(e: T) => {
  const lang = e.id.split('/')[0];
  typesetData(lang, e.data);
  if (e.rendered) e.rendered.html = typesetHtml(lang, e.rendered.html);
  return e;
};

export async function getSite(lang: Lang) {
  const e = (await getEntry('site', `${lang}/site`)) ?? (await getEntry('site', `${DEFAULT_LANG}/site`));
  if (!e) throw new Error('Missing src/content/pages/<lang>/site.json');
  return typeset(e).data;
}
export async function getHome(lang: Lang) {
  const e = (await getEntry('home', `${lang}/home`)) ?? (await getEntry('home', `${DEFAULT_LANG}/home`));
  if (!e) throw new Error('Missing src/content/pages/<lang>/home.json');
  return typeset(e).data;
}
export async function getBooking(lang: Lang) {
  const e = (await getEntry('booking', `${lang}/booking`)) ?? (await getEntry('booking', `${DEFAULT_LANG}/booking`));
  if (!e) throw new Error('Missing src/content/pages/<lang>/booking.json');
  return typeset(e).data;
}
export async function getAbout(lang: Lang) {
  const e = (await getEntry('about', `${lang}/about`)) ?? (await getEntry('about', `${DEFAULT_LANG}/about`));
  if (!e) throw new Error('Missing src/content/pages/<lang>/about.md');
  return typeset(e);
}

type Sortable = { id: string; data: { order: number; year: number; draft: boolean } };
const order = (a: Sortable, b: Sortable) => a.data.order - b.data.order || b.data.year - a.data.year;
/** Entries in a language; anything not yet translated falls back to the Romanian version. */
function pick<T extends Sortable>(all: T[], lang: Lang) {
  const mine = all.filter(inLang(lang));
  const have = new Set(mine.map(slugOf));
  const fallback = lang === DEFAULT_LANG ? [] : all.filter(inLang(DEFAULT_LANG)).filter((e) => !have.has(slugOf(e)));
  return [...mine, ...fallback].map(typeset).sort(order);
}
export const getProjects = async (lang: Lang) => pick(await getCollection('projects', visible), lang).map((project) => ({
  ...project, data: { ...project.data,
    client: hasRealContent(project.data.client) ? project.data.client : undefined,
    credits: project.data.credits.filter((credit) => hasRealContent(credit.name) && hasRealContent(credit.role)),
  },
}));
export const getFilms = async (lang: Lang) => pick(await getCollection('films', visible), lang);

/** Large WebP used by the full-screen viewer (kept under ~350 KB). */
export async function fullSize(src: ImageMetadata) {
  const img = await getImage({ src, width: Math.min(import.meta.env.PUBLIC_PREVIEW_LITE === '1' ? 1400 : 1800, src.width), format: 'webp', quality: 70 });
  return img.src;
}

/** Absolute share image for Open Graph (1200x630 crop happens via width only). */
export async function shareImage(src: ImageMetadata) {
  const img = await getImage({ src, width: 1200, format: 'jpg', quality: 80 });
  return img.src;
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const orientation = (src: ImageMetadata) =>
  src.width / src.height > 1.15 ? 'landscape' : src.width / src.height < 0.87 ? 'portrait' : 'square';
