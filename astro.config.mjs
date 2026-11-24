// @ts-check
import { defineConfig } from 'astro/config';

// Fully static output: Cloudflare serves /dist as Workers Static Assets.
export default defineConfig({
  site: 'https://www.advaegis.com',
  trailingSlash: 'ignore',
  // Astro 7 defaults to 'jsx', which drops a line break between text and a following
  // inline element ("see\n<a>" renders as "see<a>"). Keep HTML whitespace rules.
  compressHTML: true,
  build: {
    format: 'directory',
    // Keep CSS in files so the Content-Security-Policy in public/_headers
    // can stay strict (no 'unsafe-inline').
    inlineStylesheets: 'never',
  },
});
