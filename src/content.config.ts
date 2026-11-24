import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

/**
 * Products: one Markdown file per product in src/content/products/.
 * Adding a product = adding a file. Pages and the home page pick it up.
 */
const products = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/products' }),
  schema: z.object({
    name: z.string(),
    status: z.enum(['coming-soon', 'beta', 'live']),
    /** One sentence, shown on the home page and product list. */
    summary: z.string(),
    /** Product's own website, if it has one. */
    website: z.url().optional(),
    /** Where the product runs. Order here is the order shown. */
    platforms: z.array(z.enum(['web', 'ios', 'android'])).default([]),
    /** Square icon under /public. */
    icon: z.string(),
    screenshots: z
      .array(z.object({ src: z.string(), alt: z.string() }))
      .default([]),
    /** Store links, filled in at launch. */
    stores: z
      .array(z.object({ label: z.string(), href: z.url() }))
      .default([]),
    /** Lower numbers appear first. */
    order: z.number().default(100),
  }),
});

export const collections = { products };
