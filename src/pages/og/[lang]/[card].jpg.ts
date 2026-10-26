/**
 * Branded 1200×630 share cards, generated at build time: one per project per language,
 * plus a "site" card per language for pages without a photo of their own.
 * The title is set in the display face (Bodoni Moda; Playfair Display for Cyrillic) as outlines.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import type { ImageMetadata } from 'astro';
import sharp from 'sharp';
import path from 'node:path';
import { OutlineFont } from '../../../lib/og-font';
import { getProjects, getSite, slugOf } from '../../../lib/content';
import { LOCALES, t } from '../../../lib/i18n';

const W = 1200;
const H = 630;
const PAD = 72;
// Read from the project root at build time (the bundled endpoint no longer sits next to src/)
const fontFile = (name: string) => path.resolve('src/assets/og-fonts', `${name}.ttf`);
let fonts: { latin: OutlineFont; cyrillic: OutlineFont } | null = null;
const getFonts = () => (fonts ??= { latin: new OutlineFont(fontFile('BodoniModa')), cyrillic: new OutlineFont(fontFile('PlayfairDisplay')) });

type Card = { title: string; kicker: string; meta: string; image: ImageMetadata };

export const getStaticPaths = (async () => {
  const out = [];
  for (const lang of LOCALES) {
    const s = t(lang);
    const site = await getSite(lang);
    out.push({ params: { lang, card: 'site' }, props: { title: site.name, kicker: site.location, meta: site.role, image: site.shareImage } satisfies Card });
    for (const p of await getProjects(lang)) {
      const d = p.data;
      out.push({
        params: { lang, card: slugOf(p) },
        props: { title: d.title, kicker: site.name, meta: [s.categories[d.category], d.location, d.year].filter(Boolean).join('  ·  '), image: d.cover } satisfies Card,
      });
    }
  }
  return out;
}) satisfies GetStaticPaths;

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

export const GET: APIRoute = async ({ props, params }) => {
  const { title, kicker, meta, image } = props as Card;
  const font = /[Ѐ-ӿ]/.test(title + kicker + meta) || params.lang === 'ru' ? getFonts().cyrillic : getFonts().latin;
  const track = -0.02;

  // Largest size (96 → 60) at which the title fits in three lines
  let size = 96;
  let lines = font.wrap(title, size, W - PAD * 2, track);
  while ((lines.length > 3 || lines.some((l) => font.measure(l, track) * size > W - PAD * 2)) && size > 60) {
    size -= 4;
    lines = font.wrap(title, size, W - PAD * 2, track);
  }
  const lead = size * 0.98;
  const metaY = H - PAD + 8;
  const lastBaseline = metaY - 54;
  const firstBaseline = lastBaseline - lead * (lines.length - 1);
  const slitY = Math.round(firstBaseline - size * 0.95 - 26);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="0.35"/><stop offset="0.45" stop-color="#000" stop-opacity="0.15"/><stop offset="1" stop-color="#000" stop-opacity="0.88"/>
    </linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    ${font.path(kicker, PAD, PAD + 18, 26, 0.02, '#ece7df')}
    <rect x="${PAD}" y="${slitY}" width="${W - PAD * 2}" height="1.5" fill="#ece7df" opacity="0.55"/>
    ${lines.map((l, i) => font.path(l, PAD, Math.round(firstBaseline + i * lead), size, track)).join('')}
    ${font.path(meta, PAD, metaY, 26, 0.01, '#b9b3aa')}
    <circle cx="${W - PAD - 6}" cy="${PAD + 9}" r="6" fill="#c6342a"/>
    <title>${esc(title)}</title>
  </svg>`;

  const src = (image as ImageMetadata & { fsPath?: string }).fsPath;
  const base = src
    ? sharp(src).resize(W, H, { fit: 'cover', position: 'attention' }).modulate({ brightness: 0.8, saturation: 0.9 })
    : sharp({ create: { width: W, height: H, channels: 3, background: '#000' } });
  const jpg = await base.composite([{ input: Buffer.from(svg) }]).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpg), { headers: { 'Content-Type': 'image/jpeg' } });
};
