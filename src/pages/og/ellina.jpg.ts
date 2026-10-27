/**
 * Ellina's portrait at a stable URL for structured data (Person.image in lib/seo.ts):
 * hashed /assets/ names change whenever the photo is re-exported, this one does not.
 */
import type { APIRoute } from 'astro';
import type { ImageMetadata } from 'astro';
import sharp from 'sharp';
import { getAbout } from '../../lib/content';
import { DEFAULT_LANG } from '../../lib/i18n';

export const GET: APIRoute = async () => {
  const portrait = (await getAbout(DEFAULT_LANG)).data.portrait as ImageMetadata & { fsPath?: string };
  const jpg = await sharp(portrait.fsPath!).resize({ width: 1200, withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpg), { headers: { 'Content-Type': 'image/jpeg' } });
};
