// node scripts/gallery-hq.mjs <gallery-id>
// Builds the viewer images for an unlisted client gallery from its untouched Blob originals:
// 2560px long edge, WebP q90 (visually lossless, ~0.5–1 MB) in public/gallery/<id>/NNN.webp.
// Run once per gallery (re-run skips files that exist). Originals stay in Blob for downloads.
import fs from 'node:fs';
import sharp from 'sharp';

const id = process.argv[2];
const manifest = JSON.parse(fs.readFileSync(new URL(`../src/data/client-galleries/${id}.json`, import.meta.url), 'utf8'));
const out = new URL(`../public/gallery/${id}/`, import.meta.url);
fs.mkdirSync(out, { recursive: true });
let i = 0;
const queue = manifest.photos.map((p, idx) => ({ p, n: String(idx + 1).padStart(3, '0') }));
async function worker() {
  while (queue.length) {
    const { p, n } = queue.shift();
    const dest = new URL(`${n}.webp`, out);
    if (fs.existsSync(dest)) { i++; continue; }
    const res = await fetch(p.url);
    if (!res.ok) throw new Error(`${p.name}: HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await sharp(buf).rotate().resize({ width: 2560, height: 2560, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 90, smartSubsample: true }).toFile(dest.pathname);
    i++; if (i % 10 === 0) console.log(`${i}/${manifest.photos.length}`);
  }
}
await Promise.all([worker(), worker(), worker(), worker()]);
console.log(`done ${i}/${manifest.photos.length}`);
