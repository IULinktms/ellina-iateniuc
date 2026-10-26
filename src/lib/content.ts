import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

export type Project = CollectionEntry<'projects'>;
export type Film = CollectionEntry<'films'>;

const isProd = import.meta.env.PROD;
/** Drafts are visible in `npm run dev`, hidden on the live site. */
const visible = (e: { data: { draft: boolean } }) => !isProd || !e.data.draft;

export async function getSite() {
  const e = await getEntry('site', 'site');
  if (!e) throw new Error('Missing src/content/pages/site.json');
  return e.data;
}
export async function getHome() {
  const e = await getEntry('home', 'home');
  if (!e) throw new Error('Missing src/content/pages/home.json');
  return e.data;
}
export async function getBooking() {
  const e = await getEntry('booking', 'booking');
  if (!e) throw new Error('Missing src/content/pages/booking.json');
  return e.data;
}
export async function getAbout() {
  const e = await getEntry('about', 'about');
  if (!e) throw new Error('Missing src/content/pages/about.md');
  return e;
}

export async function getProjects() {
  return (await getCollection('projects', visible)).sort(
    (a, b) => a.data.order - b.data.order || b.data.year - a.data.year,
  );
}
export async function getFilms() {
  return (await getCollection('films', visible)).sort(
    (a, b) => a.data.order - b.data.order || b.data.year - a.data.year,
  );
}

/** Large WebP used by the full-screen viewer. */
export async function fullSize(src: ImageMetadata) {
  const img = await getImage({ src, width: Math.min(import.meta.env.PUBLIC_PREVIEW_LITE === '1' ? 1800 : 2400, src.width), format: 'webp', quality: 82 });
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
