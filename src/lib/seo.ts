/**
 * Structured data (schema.org JSON-LD). Base.astro always emits the studio and the breadcrumb trail;
 * pages add their own nodes (project gallery, films) through its jsonLd prop.
 */
import type { CollectionEntry } from 'astro:content';
import { HTML_LANG, type Lang } from './i18n';

type Site = CollectionEntry<'site'>['data'];
type Node = Record<string, unknown>;

/** Stable ids so nodes can point at each other across pages */
export const studioId = (origin: URL | string) => new URL('/#studio', origin).toString();

export function serviceLd(site: Site, lang: Lang, origin: URL, home: string, image: string): Node {
  return {
    '@type': 'ProfessionalService',
    '@id': studioId(origin),
    name: site.name,
    description: site.seoDescription,
    url: home,
    inLanguage: HTML_LANG[lang],
    image,
    email: site.email,
    ...(site.phone ? { telephone: site.phone.replace(/\s/g, '') } : {}),
    address: { '@type': 'PostalAddress', addressLocality: site.location.split(',')[0].trim(), addressCountry: 'MD' },
    areaServed: [
      { '@type': 'Country', name: 'Moldova' },
      { '@type': 'Country', name: 'Romania' },
    ],
    // TODO before launch: replace with the real price band (see LAUNCH-CHECKLIST.md)
    priceRange: '€€',
    knowsLanguage: ['ro', 'ru', 'en'],
    founder: { '@type': 'Person', name: site.name, jobTitle: site.role },
    sameAs: site.socials.map((x) => x.url).filter((u) => /^https?:\/\/[^/]+\/.+/.test(u)),
  };
}

export function breadcrumbLd(items: Array<{ name: string; url: string }>): Node {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}

/** "2:45" or "1:02:10" → ISO 8601 "PT2M45S" */
export function isoDuration(d?: string) {
  if (!d) return undefined;
  const parts = d.split(':').map(Number);
  if (parts.some(Number.isNaN)) return undefined;
  const [h, m, s] = parts.length === 3 ? parts : [0, ...parts.slice(-2)];
  return `PT${h ? `${h}H` : ''}${m ? `${m}M` : ''}${s || (!h && !m) ? `${s}S` : ''}`;
}

export function videoLd(film: CollectionEntry<'films'>, lang: Lang, origin: URL, poster: string): Node {
  const d = film.data;
  const file = d.videoFile ? new URL(d.videoFile, origin).toString() : undefined;
  return {
    '@type': 'VideoObject',
    name: d.title,
    description: d.excerpt,
    thumbnailUrl: new URL(poster, origin).toString(),
    uploadDate: String(d.year),
    inLanguage: HTML_LANG[lang],
    ...(isoDuration(d.duration) ? { duration: isoDuration(d.duration) } : {}),
    ...(file ? { contentUrl: file } : {}),
    ...(d.videoUrl ? { embedUrl: d.videoUrl } : {}),
    ...(d.location ? { contentLocation: { '@type': 'Place', name: d.location } } : {}),
    creator: { '@id': studioId(origin) },
  };
}

export function projectLd(
  project: CollectionEntry<'projects'>,
  lang: Lang,
  url: string,
  origin: URL,
  images: Array<{ src: string; alt: string; caption?: string }>,
): Node[] {
  const d = project.data;
  return [
    {
      '@type': 'ImageGallery',
      '@id': `${url}#gallery`,
      name: d.title,
      description: d.seoDescription ?? d.excerpt,
      url,
      inLanguage: HTML_LANG[lang],
      dateCreated: String(d.year),
      genre: d.category,
      ...(d.location ? { contentLocation: { '@type': 'Place', name: d.location } } : {}),
      creator: { '@id': studioId(origin) },
      image: images.map((im) => ({
        '@type': 'ImageObject',
        contentUrl: new URL(im.src, origin).toString(),
        description: im.alt,
        ...(im.caption ? { caption: im.caption } : {}),
        creator: { '@type': 'Person', name: 'Ellina Iateniuc' },
      })),
    },
  ];
}
