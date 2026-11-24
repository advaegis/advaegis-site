// @ts-check
import { defineConfig } from 'astro/config';

// Fully static output: Cloudflare serves /dist as Workers Static Assets.
export default defineConfig({
  site: 'https://www.advaegis.com',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
    // Keep CSS in files so the Content-Security-Policy in public/_headers
    // can stay strict (no 'unsafe-inline').
    inlineStylesheets: 'never',
  },
});
