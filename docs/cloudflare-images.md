# Cloudflare public images

Public site media is stored in the Cloudflare R2 bucket `khalilnooh-public-media` (APAC, Standard storage). It is independent of the Worker that serves `khalilnooh.com`, so uploading an image here does not deploy the website.

## Portrait

- Source: user-supplied `KN_Builder_Profile_Pix.png` (1024 × 1536, original PNG)
- Object key: `portraits/khalil-nooh-builder-2026-09-13.png`
- Production URL: `https://media.khalilnooh.com/portraits/khalil-nooh-builder-2026-09-13.png`
- Cache policy: `public, max-age=31536000, immutable`

The custom domain is the production endpoint for this bucket. Its Cloudflare-managed `r2.dev` development URL remains enabled for testing: `https://pub-d0701c8f177f4a948aa4a18f8e38b9cd.r2.dev/`. Do not upload private material to this bucket.

The custom domain now resolves normally. Home and Profile use the supplied portrait directly; the former Tatler photo and its temporary development-domain fallback are no longer referenced by either portrait. The old R2 object remains available for cached pages.

## Uploading changed image bytes

The published object uses immutable caching. When the image bytes change, create a new, versioned key and update the image URL in the site; do not overwrite the current key. For example:

```sh
npx wrangler r2 object put \
  khalilnooh-public-media/portraits/khalil-nooh-mesolitica-2026-09.jpg \
  --file=public/media/khalil-nooh-mesolitica.jpg \
  --content-type=image/jpeg \
  --cache-control='public, max-age=31536000, immutable' \
  --remote
```

The resulting production URL is `https://media.khalilnooh.com/` followed by the new object key. Retain the old object while any deployed page or cached HTML can still reference it.
