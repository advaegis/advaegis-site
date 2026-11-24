# Advaegis website — notes for Claude Code

The company website for ADVAEGIS LTD at https://www.advaegis.com. It is a static Astro site,
served by Cloudflare Workers Static Assets. It must stay simple, fast and cheap (free tier),
and it must stay publicly available: Apple Developer Program verification depends on it.

## Commands

- `npm run dev`: local dev server at http://localhost:4321
- `npm run build`: static build into `dist/`
- `npm run preview`: build, then serve `dist/` with Wrangler exactly as Cloudflare will
- `npm run deploy:check`: build and dry-run a Cloudflare deploy (uploads nothing)
- `npm run typecheck`: `astro check` (types in `.astro` and `.ts` files)
- `npm test`: checks the built `dist/` (run after a build)
- `npm run verify`: typecheck, build and test. This is exactly what CI runs.

**Never deploy.** Production deploys only from GitHub Actions (`.github/workflows/ci.yml`)
when a reviewed pull request is merged to `main`. `.claude/settings.json` blocks
`wrangler deploy`, pushing to `main` and `gh pr merge`; do not work around it.

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
| Site tests (built-output checks) | `tests/site.test.mjs` |
| CI and production deploy | `.github/workflows/ci.yml` |
| Dependency update PRs | `.github/dependabot.yml` |
| What Claude Code may run | `.claude/settings.json` |

A new product needs only a Markdown file and its images under `public/images/products/<slug>/`.
The home page, `/products/`, `/products/<slug>/` and the sitemap pick it up automatically.
A new top-level page also needs adding to `pages` in `src/pages/sitemap.xml.ts` and, if it
belongs in the menu, to `nav` in `src/site.config.ts`.

## Rules

- Reuse existing components and tokens before writing new ones. No new dependencies
  without a clear reason; the site needs only `astro` and one font package, plus
  `wrangler`, `@astrojs/check` and `typescript` for development.
- **Ask before installing anything**, whether npm packages or system tools. Name the
  package, why it is needed and what it replaces. System tools (node, gh, etc.) are
  installed and updated by the owner with Homebrew; never use another installer.
  Node's version is pinned in `.nvmrc`, which CI follows.
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

## Tests

`tests/site.test.mjs` uses Node's built-in test runner (no test framework) against `dist/`.
It enforces the rules above: legal footer on every page, no inline scripts or styles,
no third-party requests, internal links resolve, images have alt text, and the sitemap
matches the built pages. When a change adds a rule worth enforcing, add a check there
rather than a new tool. Prove that a new check fails when the rule is broken.

## Workflow

The owner reviews and merges every change; Claude Code does everything up to the PR.

1. Branch from an up-to-date `main` (`feat/...`, `fix/...`, `chore/...`).
2. Make the change. For UI, check the pages with `npm run dev` or `npm run preview`.
3. Done means `npm run verify` passes locally, with no new warnings.
4. Commit in small, logical commits, push the branch and open a PR with `gh pr create`. Say
   what changed, why, and how it was checked. Note anything the owner must do (secrets,
   dashboard settings, installs).
5. Watch CI (`gh pr checks`), and fix failures on the branch. The job summary links the preview.
6. Never merge. After the owner merges, CI deploys `main` to production.

Dependabot opens grouped weekly PRs for npm packages and GitHub Actions. For those, read the
changelogs for breaking changes, run `npm run verify`, push fixes to the Dependabot branch
if needed, and summarise the risk on the PR.
