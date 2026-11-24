# Advaegis website — notes for Claude Code

The company website for ADVAEGIS LTD at https://www.advaegis.com. It is a static Astro site,
served by Cloudflare Workers Static Assets. It must stay simple, fast and cheap (free tier),
and it must stay publicly available: Apple Developer Program verification depends on it.

## Commands

- `npm run dev`: local dev server at http://localhost:4321
- `npm run build`: static build into `dist/`
- `npm run preview`: build, then serve `dist/` with Wrangler exactly as Cloudflare will
- `npm run deploy:check`: build and dry-run a Cloudflare deploy (uploads nothing)

**Never run `wrangler deploy` against production.** Production deploys happen only when
reviewed code is merged to `main` on GitHub (Cloudflare Workers Builds).

## Where things live

| To change | Edit |
| --- | --- |
| Company facts, email, nav, founder details | `src/site.config.ts` (single source of truth) |
| Consulting areas (also drives the home-page shield layers) | `src/data/services.ts` |
| A product, or add a new one | `src/content/products/<slug>.md` (schema in `src/content.config.ts`) |
| Colours, type scale, spacing, buttons | `src/styles/global.css` (design tokens at the top) |
| Shield geometry (logo, favicon, hero) | `src/lib/shield.ts` |
| Security and cache headers | `public/_headers` |
| Cloudflare Worker config and domains | `wrangler.jsonc` |

A new product needs only a Markdown file and its images under `public/images/products/<slug>/`.
The home page, `/products/`, `/products/<slug>/` and the sitemap pick it up automatically.
A new top-level page also needs adding to `pages` in `src/pages/sitemap.xml.ts` and, if it
belongs in the menu, to `nav` in `src/site.config.ts`.

## Rules

- Reuse existing components and tokens before writing new ones. No new dependencies
  without a clear reason; the site currently needs only `astro`, one font package and
  `wrangler`.
- No inline `<script>` or `style=""` attributes: the CSP in `public/_headers` blocks them.
  Put styles in the component's `<style>` block, using the CSS custom properties.
- No third-party requests (CDN fonts, analytics, embeds) without updating the CSP and the
  privacy notice (`src/pages/privacy.astro`).
- The footer's legal disclosures (company name, number, place of registration, registered
  office) are required by UK law on every page. Never remove them; keep them matching
  Companies House.
- Accessibility: semantic HTML, visible focus, alt text on meaningful images, colour contrast
  AA or better, respect `prefers-reduced-motion`.
- Copy: plain, specific, sentence case, active voice. No invented claims, client names,
  numbers or credentials. The founder's credentials are referenced on LinkedIn, not restated.
  Do not mention rates or IR35.

## Design direction

"Oxidised bronze": the aegis as an old shield weathered to verdigris.

- Palette: ink `#172a33`, paper `#eef2f0`, verdigris `#2e8478` (text-safe `#22685f`),
  bronze `#a8742f` (at most one small use per view), mist `#c5d3cf` for rules, slate `#4a5e66`.
- Type: Bricolage Grotesque (self-hosted via Fontsource) for headings; system UI for body.
- Layout: left-aligned, generous whitespace, hairline mist rules between sections.
  Structure is information: no decorative eyebrows, numbering or card grids.
- The one bold element is the layered shield on the home page. Keep everything else quiet.
- Motion: one load sequence (the shield drawing outwards). Nothing else animates on its own.

For new UI, use the frontend-design skill and keep within this system.

## Workflow

1. Branch from `main` (`feat/...`, `fix/...`).
2. Make the change; run `npm run build` and `npm run preview` and check the pages.
3. Push and open a pull request. Cloudflare builds a preview URL for the branch.
4. After review, merge to `main`. Cloudflare deploys to production.
