import type { APIRoute } from 'astro';
import { site } from '../site.config';
import { getProducts, productHref } from '../lib/products';

/** Static pages to list. Add new top-level pages here. */
const pages = ['/', '/products/', '/consulting/', '/contact/', '/privacy/'];

export const GET: APIRoute = async () => {
  const products = await getProducts();
  const urls = [...pages, ...products.map(productHref)]
    .map((path) => `  <url><loc>${new URL(path, site.url).href}</loc></url>`)
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
