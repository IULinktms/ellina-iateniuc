/**
 * Build-time loading placeholders. The photo's dominant colour paints with the HTML, so a frame is
 * never an empty grey box; a 24px WebP with the blur baked in rides along in `data-lqip-img` and
 * app.ts sets it as the background well before the frame nears the viewport. Lazy images then
 * crossfade in over it. The tiny images stay out of the inline style on purpose: two dozen data-URI
 * backgrounds parsed with the page cost ~0.3 s of home LCP on throttled mobile; colours cost nothing.
 */
import sharp from 'sharp';
import type { ImageMetadata } from 'astro';

export interface Lqip { color: string; image: string; style: string; attrs: { 'data-lqip-img': string } }

const cache = new Map<string, Promise<Lqip | undefined>>();

async function make(fsPath: string): Promise<Lqip | undefined> {
  try {
    const input = sharp(fsPath).rotate();
    const [{ dominant }, tiny] = await Promise.all([
      input.clone().stats(),
      input.clone().resize(24, 24, { fit: 'inside' }).blur(0.8).webp({ quality: 50 }).toBuffer(),
    ]);
    const color = `#${[dominant.r, dominant.g, dominant.b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
    const image = `data:image/webp;base64,${tiny.toString('base64')}`;
    return { color, image, style: `--lqip-color:${color}`, attrs: { 'data-lqip-img': image } };
  } catch {
    return undefined; // a placeholder is a nicety: never fail the build over one
  }
}

export function lqip(src: ImageMetadata | undefined): Promise<Lqip | undefined> {
  const fsPath = (src as (ImageMetadata & { fsPath?: string }) | undefined)?.fsPath;
  if (!src || !fsPath) return Promise.resolve(undefined);
  if (!cache.has(fsPath)) cache.set(fsPath, make(fsPath));
  return cache.get(fsPath)!;
}

/** Joins a placeholder style with an element's own inline style. */
export const withLqip = (p: Lqip | undefined, style?: string) => [p?.style, style].filter(Boolean).join(';') || undefined;
