/**
 * Typesetting for content text: no line ends after a short word (Romanian „în”, „la”, „de”…, Russian «в», «и», «с»…),
 * numbers stay with what they count, straight quotes become the language's own („…” · «…» · “…”)
 * and a spaced hyphen becomes a dash. Idempotent, so running it twice changes nothing.
 * Used by lib/content.ts for frontmatter/JSON fields and for the rendered HTML of Markdown bodies.
 */
const NBSP = '\u00A0';
const SHORT = {
  ro: ['a', 'o', 'e', 'un', 'și', 'în', 'la', 'de', 'cu', 'pe', 'nu', 'să', 'din', 'pe', 'ca', 'iar', 'dar', 'sau'],
  ru: ['в', 'во', 'и', 'с', 'со', 'к', 'ко', 'у', 'о', 'об', 'а', 'на', 'по', 'за', 'из', 'от', 'до', 'не', 'ни', 'но', 'же', 'для', 'при', 'без'],
  en: ['a', 'an', 'I'],
};
const QUOTES = { ro: ['„', '”'], ru: ['«', '»'], en: ['“', '”'] };
const DASH = { ro: '–', ru: '—', en: '–' };
const cache = {};
const shortRe = (lang) =>
  (cache[lang] ??= new RegExp(`(^|[\\s(«„“${NBSP}])(${SHORT[lang].join('|')}) (?=\\S)`, 'giu'));

/** @param {'ro'|'ru'|'en'} lang @param {string} s @param {{ bind?: boolean }} [opts] bind: false for display-size text */
export function typeset(lang, s, { bind = true } = {}) {
  if (typeof s !== 'string' || !SHORT[lang]) return s;
  const [open, close] = QUOTES[lang];
  let out = s
    .replace(/"([^"\n]+)"/g, `${open}$1${close}`)
    .replace(/ - /g, `${bind ? NBSP : ' '}${DASH[lang]} `);
  // Huge display type at 320 px can't afford unbreakable word pairs
  if (!bind) return out;
  out = out.replace(/(\d) (?=\p{L})/gu, `$1${NBSP}`);
  // Twice, so runs of short words („și la”) are all bound
  out = out.replace(shortRe(lang), `$1$2${NBSP}`).replace(shortRe(lang), `$1$2${NBSP}`);
  return out;
}

/** Fields that hold running text; slugs, enums, URLs and image paths are never touched */
const PROSE = new Set(['subtitle', 'excerpt', 'caption', 'text', 'intro', 'statement', 'ctaText', 'seoDescription', 'responseTime', 'includes', 'quote', 'role', 'alt']);
/** Display-size fields: quotes and dashes only */
const DISPLAY = new Set(['title', 'statementTitle', 'runOfShowTitle', 'ctaTitle', 'label']);

/** Typesets prose fields of a content entry's data in place (entries are cached; this is idempotent) */
export function typesetData(lang, data) {
  if (Array.isArray(data)) { data.forEach((d) => typesetData(lang, d)); return data; }
  if (!data || typeof data !== 'object') return data;
  for (const [k, v] of Object.entries(data)) {
    if (typeof v === 'string' && (PROSE.has(k) || DISPLAY.has(k))) data[k] = typeset(lang, v, { bind: PROSE.has(k) });
    else if (v && typeof v === 'object' && !('src' in v && 'width' in v)) typesetData(lang, v);
  }
  return data;
}

/** Typesets the text between tags of rendered HTML (Markdown bodies), leaving tags and attributes alone */
export function typesetHtml(lang, html) {
  return typeof html === 'string' ? html.replace(/>([^<]+)</g, (_, text) => `>${typeset(lang, text)}<`) : html;
}
