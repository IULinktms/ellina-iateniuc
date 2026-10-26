/**
 * Build-time loading placeholders: a 16px WebP of the photo, blurred inside an SVG and inlined as
 * the frame's background, over the photo's dominant colour. It paints with the HTML, so a frame is
 * never an empty grey box while the real image downloads (the image then crossfades in, see .frame).
 * The blur lives in the SVG, so the browser rasterises it once: no CSS filter cost while scrolling.
 */
import sharp from 'sharp';
import type { ImageMetadata } from 'astro';

export interface Lqip { color: string; image: string; style: string }

const cache = new Map<string, Promise<Lqip | undefined>>();

async function make(fsPath: string, w: number, h: number): Promise<Lqip | undefined> {
  try {
    const input = sharp(fsPath).rotate();
    const [{ dominant }, tiny] = await Promise.all([
      input.clone().stats(),
      input.clone().resize(16, 16, { fit: 'inside' }).webp({ quality: 45, smartSubsample: true }).toBuffer({ resolveWithObject: true }),
    ]);
    const color = `#${[dominant.r, dominant.g, dominant.b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
    // Keep the SVG in the photo's own proportions; `cover` crops it like object-fit on the <img>
    const vw = 40, vh = Math.max(1, Math.round((40 * h) / w));
    const svg =
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${vw} ${vh}' preserveAspectRatio='xMidYMid slice'>` +
      `<filter id='b' color-interpolation-filters='sRGB'><feGaussianBlur stdDeviation='2'/>` +
      `<feComponentTransfer><feFuncA type='discrete' tableValues='1 1'/></feComponentTransfer></filter>` +
      `<image filter='url(%23b)' x='0' y='0' width='100%' height='100%' preserveAspectRatio='none' ` +
      `href='data:image/webp;base64,${tiny.data.toString('base64')}'/></svg>`;
    const image = `url("data:image/svg+xml;charset=utf-8,${svg.replace(/"/g, "'").replace(/</g, '%3C').replace(/>/g, '%3E')}")`;
    return { color, image, style: `--lqip:${image};--lqip-color:${color}` };
  } catch {
    return undefined; // a placeholder is a nicety: never fail the build over one
  }
}

export function lqip(src: ImageMetadata | undefined): Promise<Lqip | undefined> {
  const fsPath = (src as (ImageMetadata & { fsPath?: string }) | undefined)?.fsPath;
  if (!src || !fsPath) return Promise.resolve(undefined);
  if (!cache.has(fsPath)) cache.set(fsPath, make(fsPath, src.width, src.height));
  return cache.get(fsPath)!;
}

/** Joins a placeholder style with an element's own inline style. */
export const withLqip = (p: Lqip | undefined, style?: string) => [p?.style, style].filter(Boolean).join(';') || undefined;
