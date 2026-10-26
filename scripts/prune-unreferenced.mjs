// After `astro build`: drop images and films that no built page links to.
// Draft projects and films (the demo set) keep their files in src/ and public/ so /admin can still open them,
// but Astro emits every image a content entry references, and public/ is copied as is. Nothing unlinked ships.
import fs from 'node:fs';
import path from 'node:path';

const vercel = new URL('../.vercel/output/static/', import.meta.url);
const root = fs.existsSync(vercel) ? vercel : new URL('../dist/', import.meta.url);
const dir = root.pathname;
if (!fs.existsSync(dir)) process.exit(0);

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = walk(dir);
const TEXT = /\.(html|css|js|mjs|json|xml|txt|svg|webmanifest)$/;
const MEDIA = /\.(jpe?g|png|webp|avif|gif|mp4|webm|mov)$/i;
// Everything the site can request is named somewhere in its HTML, CSS, JS or sitemap
const corpus = files.filter((f) => TEXT.test(f) && !f.includes(`${path.sep}admin${path.sep}`)).map((f) => fs.readFileSync(f, 'utf8')).join('\n');

let removed = 0, bytes = 0;
for (const f of files) {
  const rel = '/' + path.relative(dir, f).split(path.sep).join('/');
  if (!MEDIA.test(f) || !(rel.startsWith('/assets/') || rel.startsWith('/media/'))) continue;
  if (corpus.includes(rel)) continue;
  bytes += fs.statSync(f).size;
  fs.rmSync(f);
  removed++;
}
console.log(`[prune] removed ${removed} unreferenced images/films (${(bytes / 1048576).toFixed(1)} MB)`);
