# advaegis.com

The company website for ADVAEGIS LTD: a static [Astro](https://astro.build) site, hosted free on
Cloudflare Workers Static Assets and deployed automatically from GitHub.

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
wrangler.jsonc            Cloudflare Worker config (static assets only)
CLAUDE.md                 conventions for Claude Code
```

## 1. Set up on your Mac

You need Node.js 22 or later, git, and Claude Code.

```bash
node -v                  # should print v22 or later. If not: brew install node@22 (or use nvm)
mkdir -p ~/Projects && cd ~/Projects
unzip ~/Downloads/advaegis-site.zip      # creates ~/Projects/advaegis-site
cd advaegis-site
npm install
npm run dev              # open http://localhost:4321
```

Then build it once and serve it the way Cloudflare will:

```bash
npm run build
npm run preview          # Wrangler serves dist/ at http://localhost:8787
```

## 2. Put it on GitHub (private)

Using the GitHub CLI (`brew install gh`, then `gh auth login`):

```bash
git init -b main
git add .
git commit -m "Initial Advaegis website"
gh repo create advaegis/advaegis-site --private --source=. --push
```

Or create an empty private repo named `advaegis-site` in the `advaegis` organisation on github.com, then:

```bash
git remote add origin git@github.com:advaegis/advaegis-site.git
git push -u origin main
```

Protect `main` so only reviewed code reaches production. In the GitHub repo, go to
**Settings → Rules → Rulesets → New branch ruleset**, target `main`, and turn on
"Require a pull request before merging" and "Block force pushes".

## 3. Connect Cloudflare (automatic deploys from `main`)

1. In the Cloudflare dashboard, go to **Workers & Pages → Create → Import a repository**.
2. Connect GitHub and install the Cloudflare app on the `advaegis` organisation.
   Give it access to **only** the `advaegis-site` repository.
3. Select `advaegis-site` and use these settings:
   - Project name: `advaegis-site` (must match `name` in `wrangler.jsonc`)
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy`
   - Production branch: `main`
   - Builds for non-production branches: on. Each pull request then gets its own preview
     URL, uploaded with `npx wrangler versions upload`.
4. Save and deploy. The first deploy attaches **www.advaegis.com** as a custom domain
   (from `routes` in `wrangler.jsonc`) and Cloudflare issues the certificate.

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

The workflow (also in `CLAUDE.md`):

1. `git switch -c feat/short-description`
2. Ask Claude Code for the change; check it with `npm run dev` / `npm run preview`.
3. `git push -u origin HEAD`, then open a pull request (`gh pr create`).
4. Review the pull request and its Cloudflare preview URL, then merge. Cloudflare deploys `main`.

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
