/**
 * Single source of truth for company facts and site-wide settings.
 * Change details here, never in components or pages.
 */
export const site = {
  name: 'Advaegis',
  url: 'https://www.advaegis.com',
  description:
    'Advaegis builds technology that helps people and small businesses stay on top of everyday life, and helps engineering teams keep their platforms dependable and put agentic AI to work.',
  // Shown in the footer: what the name means.
  nameNote: 'Advaegis is short for advanced aegis, the protective shield of Greek myth.',
  email: 'hello@advaegis.com', // Google Workspace alias of admin@

  // Statutory trading disclosures (Companies Act 2006 / Trading Disclosures Regulations 2008).
  // Must match the Companies House register exactly.
  company: {
    legalName: 'ADVAEGIS LTD',
    number: '17575269',
    jurisdiction: 'England and Wales',
    registeredOffice: '8A Grosvenor Square, Sale, M33 6QU',
    vatNumber: null as string | null, // set when VAT registered
  },

  founder: {
    name: 'Sathish', // first name only, by choice; add surname here later if wanted
    linkedin: 'https://www.linkedin.com/in/sathishkumarcs/',
  },

  nav: [
    { href: '/products/', label: 'Products' },
    { href: '/consulting/', label: 'Consulting' },
    { href: '/contact/', label: 'Contact' },
  ],
} as const;

export type Site = typeof site;
