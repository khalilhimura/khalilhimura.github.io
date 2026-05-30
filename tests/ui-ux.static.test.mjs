import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("site navigation is simplified and marks the current page", async () => {
  const nav = await read("src/components/SiteNav.astro");

  assert.match(nav, /primaryLinks/);
  assert.match(nav, /secondaryLinks/);
  assert.match(nav, /aria-current=\{isActive\(link\.href\) \? "page" : undefined\}/);
  assert.doesNotMatch(nav, /label: "Blog" },\n  \{ href: "\/media\/", label: "Media" },\n  \{ href: "\/search\/", label: "Search" \}/);
});

test("site navigation collapses into a mobile hamburger menu", async () => {
  const nav = await read("src/components/SiteNav.astro");
  const css = await read("src/styles/global.css");

  assert.match(nav, /<details class="mobile-nav">/);
  assert.match(nav, /<summary class="menu-toggle" aria-label="Toggle navigation menu">/);
  assert.match(nav, /class="menu-icon" aria-hidden="true"/);
  assert.match(nav, /aria-label="Mobile primary navigation"/);
  assert.match(nav, /aria-label="Mobile secondary navigation"/);
  assert.match(css, /\.mobile-nav\s*{\s*display: none;/);
  assert.match(css, /@media \(max-width: 860px\)[\s\S]*\.nav-cluster\s*{\s*display: none;/);
  assert.match(css, /@media \(max-width: 860px\)[\s\S]*\.mobile-nav\s*{\s*display: block;/);
  assert.match(css, /min-height: 48px/);
});

test("homepage leads with a clearer editorial portfolio promise", async () => {
  const home = await read("src/pages/index.astro");

  assert.match(home, /source-linked operating record for founder work/i);
  assert.match(home, /Start with the proof/i);
  assert.match(home, /proof-strip/);
  assert.match(home, /class="proof-strip" role="region" aria-label="Site coverage"/);
});

test("timeline filters expose active state, result count, and empty state", async () => {
  const timeline = await read("src/pages/timeline/index.astro");

  assert.match(timeline, /data-filter-count/);
  assert.match(timeline, /data-empty-state/);
  assert.match(timeline, /aria-pressed="true"/);
  assert.match(timeline, /updateFilterButtons/);
  assert.match(timeline, /visibleCount/);
});

test("media filters expose active state, result count, and empty state", async () => {
  const media = await read("src/pages/media/index.astro");

  assert.match(media, /data-media-count/);
  assert.match(media, /data-empty-state/);
  assert.match(media, /aria-pressed="true"/);
  assert.match(media, /activeSource/);
});

test("portfolio cards are outcome-first with explicit evidence links", async () => {
  const portfolio = await read("src/pages/portfolio/index.astro");

  assert.match(portfolio, /project-kicker/);
  assert.match(portfolio, /Outcomes/);
  assert.match(portfolio, /Evidence/);
});

test("search page gives useful starting routes before the search box", async () => {
  const search = await read("src/pages/search/index.astro");

  assert.match(search, /search-shortcuts/);
  assert.match(search, /class="search-shortcuts" role="navigation" aria-label="Suggested search routes"/);
  assert.match(search, /Browse projects/);
  assert.match(search, /Open timeline/);
});

test("global styles include keyboard focus and active filter feedback", async () => {
  const css = await read("src/styles/global.css");

  assert.match(css, /:focus-visible/);
  assert.match(css, /\[aria-pressed="true"\]/);
  assert.match(css, /\.site-header nav \[aria-current="page"\]/);
  assert.match(css, /\.empty-state/);
});
