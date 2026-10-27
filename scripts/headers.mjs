// After `astro build`: security + cache headers for Vercel (Build Output API routes, before the filesystem handler).
import fs from 'node:fs';

const file = new URL('../.vercel/output/config.json', import.meta.url);
if (!fs.existsSync(file)) process.exit(0); // static preview builds have no Vercel output
const config = JSON.parse(fs.readFileSync(file, 'utf8'));

const security = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-frame-options': 'DENY',
  'permissions-policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'strict-transport-security': 'max-age=63072000; includeSubDomains',
};
const ours = [
  // Legacy Russian URLs now resolve at the root, before any filesystem lookup.
  { src: '^/ru/?$', headers: { Location: '/' }, status: 308 },
  { src: '^/ru/(.*)$', headers: { Location: '/$1' }, status: 308 },
  { src: '^/(?!admin/).*$', headers: security, continue: true },
  { src: '^/admin/.*$', headers: { ...security, 'referrer-policy': 'no-referrer' }, continue: true },
  // Unlisted client galleries: out of search even if a link leaks, and the path never leaves as a referrer
  { src: '^/g/.*$', headers: { 'x-robots-tag': 'noindex, nofollow', 'referrer-policy': 'no-referrer' }, continue: true },
  { src: '^/media/(.*)$', headers: { 'cache-control': 'public, max-age=604800' }, continue: true },
];
// Idempotent: drop routes from an earlier run, then put ours first
config.routes = [...ours, ...config.routes.filter((r) => !ours.some((o) => o.src === r.src))];
fs.writeFileSync(file, JSON.stringify(config, null, '\t'));
console.log('[headers] legacy Russian redirects + security + gallery noindex + media cache headers added');
