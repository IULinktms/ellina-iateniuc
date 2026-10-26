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
  { src: '^/(?!admin/).*$', headers: security, continue: true },
  { src: '^/admin/.*$', headers: { ...security, 'referrer-policy': 'no-referrer' }, continue: true },
  { src: '^/media/(.*)$', headers: { 'cache-control': 'public, max-age=604800' }, continue: true },
];
// Idempotent: drop routes from an earlier run, then put ours first
config.routes = [...ours, ...config.routes.filter((r) => !ours.some((o) => o.src === r.src && r.continue))];
fs.writeFileSync(file, JSON.stringify(config, null, '\t'));
console.log('[headers] security + media cache headers added');
