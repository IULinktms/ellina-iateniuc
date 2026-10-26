import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Content model. Everything here is editable from /admin (Sveltia CMS).
 * Image fields point at files in src/assets/uploads so Astro can generate
 * responsive WebP versions at build time.
 */

export const CATEGORIES = ['Conferences', 'Seminars', 'Corporate', 'Portraits', 'Celebrations', 'Brands'] as const;
export const FILM_KINDS = ['Aftermovie', 'Highlights', 'Reel', 'Behind the scenes', 'Reels'] as const;

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      category: z.enum(CATEGORIES),
      year: z.number().int(),
      location: z.string().optional(),
      client: z.string().optional(),
      excerpt: z.string(),
      cover: image(),
      coverAlt: z.string(),
      coverVideo: z.string().optional(),
      order: z.number().default(100),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
      gallery: z
        .array(
          z.object({
            image: image(),
            alt: z.string(),
            caption: z.string().optional(),
            layout: z.enum(['full', 'wide', 'half', 'inset-left', 'inset-right']).default('wide'),
            inPortfolio: z.boolean().default(true),
          }),
        )
        .default([]),
      credits: z.array(z.object({ role: z.string(), name: z.string() })).default([]),
      seoDescription: z.string().optional(),
    }),
});

const films = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/films' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      kind: z.enum(FILM_KINDS),
      aspectRatio: z.enum(['landscape', 'portrait']).default('landscape'),
      year: z.number().int(),
      duration: z.string().optional(),
      location: z.string().optional(),
      excerpt: z.string(),
      poster: image(),
      posterAlt: z.string(),
      videoFile: z.string().optional(),
      videoUrl: z.string().optional(),
      previewFile: z.string().optional(),
      project: z.string().optional(),
      order: z.number().default(100),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
      credits: z.array(z.object({ role: z.string(), name: z.string() })).default([]),
    }),
});

const site = defineCollection({
  loader: glob({ pattern: '*/site.json', base: './src/content/pages' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      role: z.string(),
      location: z.string(),
      email: z.string(),
      phone: z.string().optional(),
      // Workstream 4: optional real destinations; empty values never become broken links.
      telegram: z.string().default(''),
      whatsapp: z.string().default(''),
      viber: z.string().default(''),
      responseTime: z.string().optional(),
      seoTitle: z.string(),
      seoDescription: z.string(),
      shareImage: image(),
      socials: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
      delivery: z
        .object({
          previewTime: z.string().default('21:00'),
          galleryDays: z.number().int().default(5),
          filmDays: z.number().int().default(10),
          portraitHours: z.number().int().default(24),
        })
        .default({ previewTime: '21:00', galleryDays: 5, filmDays: 10, portraitHours: 24 }),
    }),
});

const home = defineCollection({
  loader: glob({ pattern: '*/home.json', base: './src/content/pages' }),
  schema: ({ image }) =>
    z.object({
      // Workstream 3: editable social proof. Empty defaults preserve existing entries.
      clients: z.array(z.object({ name: z.string().default(''), logo: image().optional() })).default([]),
      testimonials: z.array(z.object({ quote: z.string().default(''), name: z.string().default(''), role: z.string().default(''), company: z.string().default('') })).default([]),
      stats: z.array(z.object({ value: z.number().nonnegative().nullish(), label: z.string().default(''), suffix: z.string().default('') })).default([]),
      heroVideo: z.string(),
      heroPoster: image(),
      heroPosterAlt: z.string(),
      statementTitle: z.string().default('Quiet in the room. Fast after it.'),
      statement: z.string(),
      runOfShowTitle: z.string().default('A conference day, as I cover it'),
      runOfShow: z
        .array(z.object({ time: z.string(), title: z.string(), text: z.string(), image: image(), alt: z.string() }))
        .default([]),
      featuredProjects: z.array(z.string()).default([]),
      disciplinesIntro: z.string().default(''),
      disciplines: z
        .array(z.object({ label: z.string(), category: z.string(), image: image().optional(), alt: z.string().default('') }))
        .default([]),
      ctaTitle: z.string(),
      ctaText: z.string(),
    }),
});

const about = defineCollection({
  loader: glob({ pattern: '*/about.md', base: './src/content/pages' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      intro: z.string(),
      portrait: image(),
      portraitAlt: z.string(),
      secondImage: image().optional(),
      secondImageAlt: z.string().optional(),
      principles: z.array(z.object({ title: z.string(), text: z.string() })).default([]),
      process: z.array(z.object({ title: z.string(), text: z.string() })).default([]),
      seoDescription: z.string().optional(),
    }),
});

const booking = defineCollection({
  loader: glob({ pattern: '*/booking.json', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    intro: z.string(),
    sessions: z
      .array(z.object({ name: z.string(), duration: z.string(), includes: z.string(), price: z.string().optional() }))
      .default([]),
    successMessage: z.string(),
    successSteps: z.array(z.object({ title: z.string(), text: z.string() })).default([]),
  }),
});

export const collections = { projects, films, site, home, about, booking };
