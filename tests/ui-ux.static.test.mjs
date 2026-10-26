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

test("homepage leads with current work and verified social sources", async () => {
  const home = await read("src/pages/index.astro");
  const editorial = await read("src/data/editorial.ts");
  assert.match(home, /href="#current-work"/);
  assert.match(home, /id="current-work"/);
  assert.match(home, /<SelectedWriting/);
  assert.match(home, /<FractionalCaioOffer variant="section"/);
  assert.match(editorial, /https:\/\/thefutureissolo.com\/accumulated-curiosity\//);
  assert.match(editorial, /https:\/\/thefutureissolo.com\/fluency/);
  assert.match(editorial, /https:\/\/www.facebook.com\/khalil.nooh/);
  assert.doesNotMatch(editorial, /augmented-curiosity|facebook.com\/khalilnooh/);
});

test("fractional CAIO offer is shared by the homepage section and /hire", async () => {
  const home = await read("src/pages/index.astro");
  const hire = await read("src/pages/hire/index.astro");
  const offer = await read("src/components/FractionalCaioOffer.astro");
  const copy = await read("src/data/fractionalCaio.ts");
  const nav = await read("src/components/SiteNav.astro");
  const css = await read("src/styles/global.css");

  assert.match(home, /<FractionalCaioOffer variant="section"/);
  assert.match(hire, /<FractionalCaioOffer variant="page"/);
  assert.match(offer, /id="fractional-caio"/);
  assert.match(offer, /id="book"/);
  assert.match(offer, /data-hire-form/);
  assert.match(offer, /name="name"/);
  assert.match(offer, /name="email"/);
  assert.match(offer, /name="company"/);
  assert.match(offer, /name="building"/);
  assert.match(offer, /name="timezone"/);
  assert.match(offer, /name="windows"/);
  assert.match(offer, /name="length"/);
  assert.match(offer, /name="mode"/);
  assert.match(offer, /name="preread"/);
  assert.match(offer, /In person in KL/);
  assert.match(offer, /value="video"/);
  assert.doesNotMatch(offer, /<img/);
  assert.doesNotMatch(offer, /fbq|facebook\.net|gtag\(|googletagmanager/);
  assert.match(copy, /RM 1,420 \/ hour · minimum/);
  assert.match(copy, /Invoice before we sit down/);
  assert.match(copy, /Coach/);
  assert.match(copy, /Architect/);
  assert.match(copy, /Govern/);
  assert.match(copy, /Stress-test/);
  assert.match(copy, /Transfer/);
  assert.match(copy, /Exit/);
  assert.match(copy, /https:\/\/thefutureissolo.com\/caio/);
  assert.match(nav, /href: "\/hire\/", label: "Hire"/);
  assert.match(css, /--paper: #fbfbf8/);
  assert.equal([...css.matchAll(/@import "@fontsource\//g)].length, 7);
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
