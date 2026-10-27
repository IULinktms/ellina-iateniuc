// Health check for the built Ellina site served from .vercel/output/static
import { chromium } from 'playwright';
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.argv[2];
const BASE = process.argv[3] || 'http://127.0.0.1:4399';
const pages = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) { if (!/^(admin|_astro|assets|og|media|_image)$/.test(f)) walk(p); }
    else if (f === 'index.html') pages.push('/' + relative(ROOT, d).replace(/\\/g, '/') + (relative(ROOT, d) ? '/' : ''));
  }
})(ROOT);

const widths = [375, 1440];
const issues = [];
const linkSet = new Set();
const browser = await chromium.launch();
for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 500 ? 812 : 900 }, reducedMotion: 'no-preference' });
  for (const path of pages) {
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
    page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
    page.on('response', (r) => { if (r.status() >= 400 && r.url().startsWith(BASE)) errs.push(`HTTP ${r.status()} ${r.url().replace(BASE, '')}`); });
    try {
      await page.goto(BASE + path, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(1200);
      // scroll through so lazy images and scroll effects run
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += innerHeight * 0.8) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } scrollTo(0, 0); });
      await page.waitForTimeout(600);
      const r = await page.evaluate(() => {
        const out = {};
        out.overflow = document.documentElement.scrollWidth - innerWidth;
        out.broken = [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.getAttribute('src')).map((i) => i.currentSrc || i.src).slice(0, 5);
        const txt = document.body.innerText;
        out.placeholders = (txt.match(/TODO|Placeholder|lorem|undefined|NaN|\[object|provizoriu|уточняется/gi) || []).slice(0, 5);
        out.links = [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter((h) => h.startsWith('/') && !h.startsWith('//'));
        out.h1 = document.querySelectorAll('h1').length;
        out.title = document.title;
        out.lang = document.documentElement.lang;
        return out;
      });
      r.links.forEach((l) => linkSet.add(l.split('#')[0].split('?')[0]));
      const p = [];
      if (r.overflow > 1) p.push(`overflow ${r.overflow}px`);
      if (r.broken.length) p.push('broken img ' + r.broken.join(', '));
      if (r.placeholders.length) p.push('text: ' + r.placeholders.join(','));
      if (r.h1 !== 1) p.push(`h1 count ${r.h1}`);
      errs.forEach((e) => p.push(e.slice(0, 160)));
      if (p.length) issues.push(`[${w}] ${path} :: ${[...new Set(p)].join(' | ')}`);
    } catch (e) { issues.push(`[${w}] ${path} :: LOAD FAIL ${e.message.slice(0, 120)}`); }
    await page.close();
  }
  await ctx.close();
}
// internal links
const ctx = await browser.newContext();
const req = ctx.request;
for (const l of linkSet) {
  if (!l) continue;
  const res = await req.get(BASE + l).catch(() => null);
  if (!res || res.status() >= 400) issues.push(`[link] ${l} -> ${res ? res.status() : 'fail'}`);
}
await browser.close();
console.log(`pages: ${pages.length} x ${widths.length} widths, internal links: ${linkSet.size}`);
console.log(issues.length ? issues.join('\n') : 'NO ISSUES');
