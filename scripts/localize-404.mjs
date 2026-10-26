// After `astro build`: serve /ro/404/ and /en/404/ for unknown paths under those prefixes on Vercel.
// The adapter only knows one 404 (/404.html, Russian) and adds a single catch-all route for it.
import fs from 'node:fs';

const file = new URL('../.vercel/output/config.json', import.meta.url);
if (!fs.existsSync(file)) process.exit(0); // static preview builds have no Vercel output
const config = JSON.parse(fs.readFileSync(file, 'utf8'));
const out = new URL('../.vercel/output/static/', import.meta.url);
const catchAll = config.routes.findIndex((r) => r.src === '^/.*$' && r.dest === '/404.html');
const localized = ['ro', 'en']
  .filter((l) => fs.existsSync(new URL(`${l}/404/index.html`, out)))
  .map((l) => ({ src: `^/${l}(?:/.*)?$`, dest: `/${l}/404/index.html`, status: 404 }));
if (catchAll < 0 || !localized.length) {
  console.warn('[localize-404] catch-all 404 route or localized pages not found; left config.json unchanged');
  process.exit(0);
}
config.routes = config.routes.filter((r) => !localized.some((x) => x.src === r.src));
config.routes.splice(config.routes.findIndex((r) => r.src === '^/.*$' && r.dest === '/404.html'), 0, ...localized);
fs.writeFileSync(file, JSON.stringify(config, null, '\t'));
console.log(`[localize-404] ${localized.map((x) => x.dest).join(', ')}`);
