import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import { DEFAULT_LANG, type Lang } from './i18n';

export type Project = CollectionEntry<'projects'>;
export type Film = CollectionEntry<'films'>;

const isProd = import.meta.env.PROD;
/** Drafts are visible in `npm run dev`, hidden on the live site. */
const visible = (e: { data: { draft: boolean } }) => !isProd || !e.data.draft;

/** Entry ids look like "ro/annual-partners-gala"; the URL slug is the part after the language. */
export const slugOf = (e: { id: string }) => e.id.split('/').slice(1).join('/') || e.id;
const inLang = (lang: Lang) => (e: { id: string }) => e.id.startsWith(`${lang}/`);

export async function getSite(lang: Lang) {
  const e = (await getEntry('site', `${lang}/site`)) ?? (await getEntry('site', `${DEFAULT_LANG}/site`));
  if (!e) throw new Error('Missing src/content/pages/<lang>/site.json');
  return e.data;
}
export async function getHome(lang: Lang) {
  const e = (await getEntry('home', `${lang}/home`)) ?? (await getEntry('home', `${DEFAULT_LANG}/home`));
  if (!e) throw new Error('Missing src/content/pages/<lang>/home.json');
  return e.data;
}
export async function getBooking(lang: Lang) {
  const e = (await getEntry('booking', `${lang}/booking`)) ?? (await getEntry('booking', `${DEFAULT_LANG}/booking`));
  if (!e) throw new Error('Missing src/content/pages/<lang>/booking.json');
  return e.data;
}
export async function getAbout(lang: Lang) {
  const e = (await getEntry('about', `${lang}/about`)) ?? (await getEntry('about', `${DEFAULT_LANG}/about`));
  if (!e) throw new Error('Missing src/content/pages/<lang>/about.md');
  return e;
}

type Sortable = { id: string; data: { order: number; year: number; draft: boolean } };
const order = (a: Sortable, b: Sortable) => a.data.order - b.data.order || b.data.year - a.data.year;
/** Entries in a language; anything not yet translated falls back to the Romanian version. */
function pick<T extends Sortable>(all: T[], lang: Lang) {
  const mine = all.filter(inLang(lang));
  const have = new Set(mine.map(slugOf));
  const fallback = lang === DEFAULT_LANG ? [] : all.filter(inLang(DEFAULT_LANG)).filter((e) => !have.has(slugOf(e)));
  return [...mine, ...fallback].sort(order);
}
export const getProjects = async (lang: Lang) => pick(await getCollection('projects', visible), lang);
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
