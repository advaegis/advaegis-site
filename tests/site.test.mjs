// Checks the built site in dist/ against the rules in CLAUDE.md.
// Run `npm run build` first (or `npm run verify`, which does both).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { site } from '../src/site.config.ts';

const dist = new URL('../dist/', import.meta.url).pathname;
assert.ok(existsSync(dist), 'dist/ is missing: run `npm run build` first');

const pages = readdirSync(dist, { recursive: true })
  .filter((f) => f.endsWith('.html'))
  .map((f) => ({ file: f, html: readFileSync(join(dist, f), 'utf8') }));

/** Every value of an attribute across a page, e.g. all href="..." values. */
const attrs = (html, name) =>
  [...html.matchAll(new RegExp(`\\s${name}="([^"]*)"`, 'g'))].map((m) => m[1]);

/** Does a site path (/a/, /a, /a.png) map to a built file, as Cloudflare would serve it? */
const resolves = (path) => {
  const p = decodeURIComponent(path.split(/[?#]/)[0]);
  return [p, join(p, 'index.html'), `${p}.html`].some((c) => statSync(join(dist, c), { throwIfNoEntry: false })?.isFile());
};

test('pages were built', () => {
  assert.ok(pages.length > 0);
});

test('every page shows the statutory company disclosures', () => {
  const { legalName, number, jurisdiction, registeredOffice } = site.company;
  for (const { file, html } of pages) {
    const text = html.replace(/\s+/g, ' ');
    for (const fact of [legalName, `company number ${number}`, jurisdiction, registeredOffice]) {
      assert.ok(text.includes(fact), `${file}: footer is missing "${fact}"`);
    }
  }
});

test('no inline scripts or styles (blocked by the CSP)', () => {
  for (const { file, html } of pages) {
    assert.ok(!/<script(?![^>]*\ssrc=)[^>]*>/.test(html), `${file}: inline <script>`);
    assert.ok(!/<style[\s>]/.test(html), `${file}: inline <style>`);
    assert.ok(!/\sstyle="/.test(html), `${file}: style="" attribute`);
  }
});

test('no third-party requests', () => {
  for (const { file, html } of pages) {
    const loaded = [
      ...attrs(html, 'src'),
      ...[...html.matchAll(/<link\b[^>]*>/g)]
        .filter(([tag]) => !/rel="canonical"/.test(tag))
        .flatMap(([tag]) => attrs(tag, 'href')),
    ];
    for (const url of loaded) {
      assert.ok(!/^(https?:)?\/\//.test(url), `${file}: loads ${url}`);
    }
  }
});

test('internal links and assets resolve', () => {
  for (const { file, html } of pages) {
    for (const url of [...attrs(html, 'href'), ...attrs(html, 'src')]) {
      if (url.startsWith('/') && !url.startsWith('//')) {
        assert.ok(resolves(url), `${file}: broken link ${url}`);
      }
    }
  }
});

test('every image has alt text (empty alt only for decorative images)', () => {
  for (const { file, html } of pages) {
    for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
      assert.ok(/\salt="/.test(tag), `${file}: <img> without alt: ${tag}`);
    }
  }
});

test('sitemap lists exactly the built pages', () => {
  const xml = readFileSync(join(dist, 'sitemap.xml'), 'utf8');
  const listed = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]));
  for (const url of listed) {
    assert.equal(url.origin, new URL(site.url).origin, `sitemap: wrong host ${url}`);
    assert.ok(resolves(url.pathname), `sitemap: ${url.pathname} was not built`);
  }
  const paths = new Set(listed.map((u) => u.pathname));
  for (const { file } of pages.filter((p) => p.file !== '404.html')) {
    const path = `/${relative('.', file).replace(/index\.html$/, '')}`;
    assert.ok(paths.has(path), `sitemap: ${path} is missing (add it to pages in sitemap.xml.ts)`);
  }
});
