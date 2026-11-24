# advaegis.com

The company website for ADVAEGIS LTD: a static [Astro](https://astro.build) site, hosted free on
Cloudflare Workers Static Assets and deployed by GitHub Actions when a pull request is merged
to `main`.

```
src/
  site.config.ts          company facts, email, nav (single source of truth)
  data/services.ts        consulting areas (also drive the home-page shield)
  content/products/*.md   one file per product
  content.config.ts       product schema
  lib/                    shared helpers (shield geometry, product queries)
  components/             Header, Footer, Mark, LayeredShield, ProductFeature, ServiceList, ContactBlock
  layouts/Base.astro      <head>, meta tags, header and footer
  pages/                  /, /products/, /products/[slug]/, /consulting/, /contact/, /privacy/, 404, sitemap.xml
  styles/global.css       design tokens and base styles
public/                   images, favicons, _headers, robots.txt
tests/site.test.mjs       checks on the built site (Node's built-in test runner)
.github/                  CI/deploy workflow and Dependabot
.claude/settings.json     what Claude Code may and may not run in this repo
wrangler.jsonc            Cloudflare Worker config (static assets only)
CLAUDE.md                 conventions for Claude Code
```

## 1. Set up on your Mac

You need Node.js 26 (the version in `.nvmrc`), git, the GitHub CLI and Claude Code. Install
and update them with Homebrew: `brew install node gh`.

```bash
gh repo clone advaegis/advaegis-site ~/Projects/advaegis-site
cd ~/Projects/advaegis-site
npm ci
npm run verify           # typecheck, build and test, as CI does
npm run dev              # http://localhost:4321
npm run preview          # serves dist/ with Wrangler as Cloudflare will, at http://localhost:8787
```

## 2. Protect `main`

The repository is public, so GitHub's rulesets are free. In **Settings → Rules → Rulesets →
New branch ruleset**, target `main` and turn on:

- Require a pull request before merging
- Require status checks to pass: `verify`
- Block force pushes, and restrict deletions

## 3. Deploys: GitHub Actions to Cloudflare

`.github/workflows/ci.yml` runs on every pull request: typecheck, build, test, a deploy dry
run, and a preview version (its URL is in the run's summary). On a merge to `main` it runs
the same checks and then `wrangler deploy`. Cloudflare Workers Builds is **not** used.
Leave it disconnected, or every merge deploys twice.

One-time setup:

1. In Cloudflare, go to **My Profile → API Tokens → Create Token**, and use the "Edit Cloudflare Workers"
   template. Scope it to the Advaegis account and the `advaegis.com` zone only.
2. Add it and the account ID as repository secrets:
   ```bash
   gh secret set CLOUDFLARE_API_TOKEN      # paste the token when prompted
   gh secret set CLOUDFLARE_ACCOUNT_ID     # Workers & Pages → Account details
   ```
3. Merge a pull request. The first deploy creates the `advaegis-site` Worker and attaches
   **www.advaegis.com** (from `routes` in `wrangler.jsonc`). Cloudflare issues the certificate.
   Preview uploads start working after this first deploy.

## 4. Redirect advaegis.com to www.advaegis.com

`www` is the main address, so the bare domain redirects to it.

1. **DNS → Records**: if `advaegis.com` (the apex, shown as `@`) has no A, AAAA or CNAME
   record, add `A @ 192.0.2.1` with the proxy **on** (orange cloud). This placeholder address
   is never contacted: Cloudflare answers the redirect at the edge.
   If an apex record already exists, check what it is for before changing it.
2. **Rules → Redirect Rules → Create rule** (or use the "Redirect from root to WWW" template):
   - When: Hostname equals `advaegis.com`
   - Then: Dynamic redirect to `concat("https://www.advaegis.com", http.request.uri.path)`,
     status 301, preserve query string on.
3. **Leave the Google Workspace records alone** (MX, the SPF/DKIM/DMARC TXT records, and any
   Google verification TXT record). Do not turn on Cloudflare Email Routing: Google Workspace
   handles your email.

Check:

```bash
curl -sI https://advaegis.com | grep -i location   # → https://www.advaegis.com/
curl -sI https://www.advaegis.com | head -1        # → HTTP/2 200
```

## 5. Day-to-day with Claude Code

```bash
cd ~/Projects/advaegis-site
claude
```

Claude Code reads `CLAUDE.md` automatically. To get the same design guidance used to build
the site, install Anthropic's frontend-design plugin: type `/plugin` in Claude Code, find
**frontend-design** and install it.

The workflow (detail in `CLAUDE.md`):

1. Ask Claude Code for the change. It branches, makes the change, runs `npm run verify`
   and opens a pull request. It asks before installing anything.
2. Review the pull request and the preview URL in the CI run's summary.
3. Merge. GitHub Actions deploys `main` to production.

Dependabot opens weekly grouped update PRs. Ask Claude Code to review one
(for example, "review the Dependabot PR"), then merge it.

## Common changes

- **Company details or email**: `src/site.config.ts`
- **Launch MyTodoHelp**: in `src/content/products/mytodohelp.md`, set `status: live`, add
  `website: https://mytodohelp.com` and the store links under `stores:`.
- **Replace the MyTodoHelp icon**: save the high-resolution icon from the MyTodoHelp project as
  `public/images/products/mytodohelp/icon.png` (square, at least 256×256 px), or as `icon.svg` and update
  `icon:` in `mytodohelp.md`.
- **Add a product**: copy `mytodohelp.md` to `src/content/products/<slug>.md` and put its images in
  `public/images/products/<slug>/`.
- **Add or reword a consulting area**: `src/data/services.ts` (the home-page shield redraws itself).

## Before going live

- [ ] Founder name in `src/site.config.ts` is how you want it shown publicly.
- [ ] Privacy notice (`src/pages/privacy.astro`) reviewed. It is a starting point, not legal advice.
- [ ] Every page shows the legal footer, and it matches Companies House.
- [ ] `https://www.advaegis.com` loads in a private browser window (Apple checks that the site
      is publicly available).
