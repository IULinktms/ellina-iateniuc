// Builds a fully static, relative-path copy of the site (no server, no CMS) into ./preview-dist.
// Used for sharing a hosted preview before the real deployment exists.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = path.join(root, 'preview-dist');
const api = path.join(root, 'src/pages/api');
const parked = path.join(root, '.api-parked');

// Build in place with the server route parked, if there is one (a static build can't contain it)
const hasApi = fs.existsSync(api);
if (hasApi) fs.renameSync(api, parked);
try {
  execSync('npx astro build', {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, STATIC_PREVIEW: '1', PUBLIC_PREVIEW_LITE: '1' },
  });
} finally {
  if (hasApi) fs.renameSync(parked, api);
}
fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(path.join(root, 'dist'), out, { recursive: true });
fs.rmSync(path.join(out, 'admin'), { recursive: true, force: true });
fs.rmSync(path.join(root, 'dist'), { recursive: true, force: true });

// Rewrite root-relative URLs to relative ones so the preview works under any path.
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = walk(out);
for (const file of files) {
  const rel = path.relative(path.dirname(file), out) || '.';
  const prefix = rel === '.' ? './' : rel.split(path.sep).join('/') + '/';
  if (file.endsWith('.html')) {
    let s = fs.readFileSync(file, 'utf8');
    s = s.replace(/href="\/(assets|media)\//g, `href="${prefix}$1/`);
    // Relative links break inside persisted elements after navigation, so let nav/menu swap normally
    s = s.replace(/ data-astro-transition-persist="(nav|menu)"/g, '');
    // Page links: /portfolio/ → ../portfolio/index.html ; / → ./index.html
    s = s.replace(/(href)="\/([a-z0-9\-\/]*?)\/?((?:\?[^"#]*)?(?:#[^"]*)?)"/gi, (m, attr, p, tail) => {
      if (p.startsWith('assets') || p.startsWith('media') || /\.\w+$/.test(p)) return `${attr}="${prefix}${p}${tail}"`;
      return `${attr}="${prefix}${p ? p + '/' : ''}index.html${tail}"`;
    });
    s = s.replace(/(src|data-src|data-full|data-poster|poster|content)="\/(assets|media)\//g, `$1="${prefix}$2/`);
    s = s.replace(/srcset="([^"]+)"/g, (m, v) => `srcset="${v.replace(/(^|,\s*)\/(assets|media)\//g, `$1${prefix}$2/`)}"`);
    s = s.replace(/(href|src)="\/favicon\.svg"/g, `$1="${prefix}favicon.svg"`);
    s = s.replace(/import\("\/assets\//g, `import("${prefix}assets/`);
    fs.writeFileSync(file, s);
  } else if (file.endsWith('.css')) {
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(/url\(\/assets\//g, 'url(./'));
  } else if (file.endsWith('.js')) {
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(/(["'`])\/assets\//g, '$1./'));
  }
}
console.log(`Static preview written to ${out} (${files.length} files)`);
