# Khalil Nooh website revamp

## Direction and implementation

A light-only modern journal for an AI builder, educator, and author. EB Garamond gives the book and writing a publication voice; Geist keeps navigation clear. Off-white, charcoal, and one muted plum accent replace the previous multicolour clay surfaces. A Fraunces italic wordmark spells out Khalil Nooh in the header. Page routes, navigation labels, archive URLs, search, and RSS remain available.

The homepage prioritises current work (TFIS, Accumulated Curiosity, AI Fluency), curated public writing, the connection to Mesolitica, and independently published coverage. Reader-facing copy is newly written from sources, not presented as direct quotations. No coding background is assumed.

Existing uncommitted changes were copied to `/tmp/khalilnooh-before-revamp` before changes began. The user approved committing, pushing, and deploying the completed revamp on 13 September 2026.

## Source decisions

- User corrected the book URL to `https://thefutureissolo.com/accumulated-curiosity/` and Facebook to `https://www.facebook.com/khalil.nooh`.
- Facebook was read in the browser after dismissing the optional login prompt. The public Accumulated Curiosity update explicitly invites human review and describes highlights, comments, reading progress, and My Library. Its content date is 11 September 2026. A second public post explains independence as compatible with cooperation. Both link to exact post permalinks in `src/data/editorial.ts`.
- LinkedIn selections: the AI residency reality-vs-hype post, and the TFIS Taiko music experiment. Public post text was available through web search. No claims about engagement ranking or exhaustive selection are made.
- Tatler's MaLLaM interview connects Khalil's founder work at Mesolitica, Malaysian languages, sovereignty, training, and the TFIS thesis. The portrait is credited there to Mesolitica.
- Tatler's Gen.T anniversary article discusses Khalil's curiosity, experimentation, and the 500 Global AI residency.
- Digital News Asia reports MaLLaM's category recognition in the Malaysia World Summit Awards finals.
- e27's exact article URL was resolved from e27's own LinkedIn post and verified for title. The article's full body was not retrievable; the concise description is grounded in the associated TFIS and publisher posts.
- The live Fluency page confirms a two-hour course, six modules plus introduction/wrap-up, practical workflows, and verification habits. No prices are duplicated on this personal site.
- See `portfolio-sources.md` for the user-provided Google Slides deck and repository evidence.
- See `cloudflare-images.md` for public R2 storage and repeatable upload details.

## Archive handling

Eight pre-existing placeholder or proposed-expansion entries are marked as drafts. Their URLs and source files remain available, with noindex metadata; they are omitted from public listings, RSS, and the search index. The six substantive essays remain in the archive. The four newly curated social selections link directly to their original posts.

## Validation plan

Run Astro type checks, repository tests, and a production build. Serve the generated site to check Pagefind, internal links, desktop/mobile layouts, responsive navigation, publisher/timeline filters, keyboard focus, reduced motion, and light-only rendering. Inspect source changes without overwriting unrelated content.

## Verified results

- `npm run check`: 0 errors, warnings, or hints.
- `npm test`: 18 passing tests, including external-link handling. Updated the obsolete homepage-copy assertion to cover the corrected current-work and social URLs.
- `npm run build`: 36 static pages. Pagefind indexes 20 public pages; 16 preserved blog/timeline draft URLs stay outside its index.
- Parsed 653 internal links and anchors across the generated pages: no broken targets.
- Browser: desktop homepage and project layouts; mobile menu, publisher filter/reset, timeline search/empty state/reset; Pagefind search. Bot Crossing was subsequently removed from the portfolio at the user's request.
- All seven main pages: no horizontal overflow at 320px; homepage also checked at 390px. Portrait successfully loads from Cloudflare.
- With dark-mode preference emulated, computed page background remains light and `color-scheme` is `light only`. Reduced-motion preference disables smooth scrolling.
- Live builder portrait: Cloudflare returns the original 1024 × 1536 PNG; its SHA-256 matches the user-supplied `KN_Builder_Profile_Pix.png`.
- Video library: ten appearances with static preview images; the embedded player loads on request with autoplay disabled.
- Generated HTML audit: all 276 external links open a new tab with `noopener noreferrer`; all 677 internal links retain same-tab navigation.
- Release dry run: `npx wrangler deploy --dry-run` succeeds for `khalilnooh-com`.

The repository has a Cloudflare deployment workflow triggered by a push to `master`. Its previous runs failed because the GitHub Actions Cloudflare token was missing. An authenticated local `npx wrangler deploy` can publish the verified build. Verify provider completion and the live domain; a successful local build alone does not establish a deployed release.
