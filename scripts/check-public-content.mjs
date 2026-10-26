// Run after npm run build. Inspect every localized public HTML page, including metadata.
import fs from 'node:fs';
import path from 'node:path';
const root = '.vercel/output/static';
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
const files = walk(root).filter((file) => file.endsWith('.html') && !file.includes('/admin/'));
const failures = [];
for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  // Ignore ordinary HTML placeholder attributes; reject editorial placeholder text.
  const content = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
  if (/TODO|Placeholder|Preț provizoriu|Цена уточняется|provisional/.test(html)) failures.push(`${file}: unfinished content`);
  for (const heading of content.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)) {
    if (!heading[2].replace(/<[^>]*>/g, '').replace(/&(?:nbsp|#160);/g, ' ').trim()) failures.push(`${file}: empty h${heading[1]}`);
  }
}
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log(`PASS: ${files.length} public HTML files; no unfinished text or empty headings.`);
