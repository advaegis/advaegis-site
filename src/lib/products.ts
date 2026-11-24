import { getCollection, type CollectionEntry } from 'astro:content';

export type Product = CollectionEntry<'products'>;

export async function getProducts(): Promise<Product[]> {
  const all = await getCollection('products');
  return all.sort((a, b) => a.data.order - b.data.order);
}

const statusLead: Record<Product['data']['status'], string> = {
  'coming-soon': 'Coming soon',
  beta: 'In beta',
  live: 'Available',
};

const platformName = { web: 'the web', ios: 'iPhone', android: 'Android' } as const;

/** Plain-English list: "a", "a and b", "a, b and c". */
const listOf = (items: string[]) =>
  items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;

/** e.g. "Coming soon to the web, iPhone and Android" or "Available on iPhone". */
export function availability(p: Product): string {
  const { status, platforms } = p.data;
  if (platforms.length === 0) return statusLead[status];
  const preposition = status === 'coming-soon' ? 'to' : 'on';
  return `${statusLead[status]} ${preposition} ${listOf(platforms.map((x) => platformName[x]))}`;
}

export const productHref = (p: Product) => `/products/${p.id}/`;
