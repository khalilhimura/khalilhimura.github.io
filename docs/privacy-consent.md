# Privacy controls

Implemented for the current static Astro site. This is a technical consent implementation, not a determination that every privacy law worldwide applies or that all operational obligations have been met.

## Inventory and decisions

- First-party delivery, fonts, Pagefind search, portrait and video thumbnails are served by this site's Cloudflare infrastructure. The audit found no analytics/advertising tags in source or the live HTML. Cloudflare injects a security challenge script on production; optional-media consent does not disable security services.
- The only optional service in source is YouTube/Google. Privacy-enhanced embeds are withheld until the user both consents to external media and requests a player. Thumbnail requests do not reach YouTube.
- `kn:privacy:v1` local storage contains the external-media boolean, consent version, update timestamp and expiry. No unique user identifier, remote consent service or consent telemetry. Both acceptance and rejection expire after 180 days. This is a policy choice, not a universal legal maximum.
- Invalid, expired, future-dated or outdated-version records fail closed. Expired entries are removed on the next consent check. If browser storage fails, an explicit choice is kept for that page only; failed writes attempt to remove any older stored permission.
- The banner gives Accept all and Reject all the same styling and one-click access, plus Settings. External media is initially unchecked. Closing/Escape does not give consent.
- Cookie settings stays available in the footer. Withdrawal resets the choice to rejection, removes active iframes and propagates between same-origin tabs when storage works. Expiry and window reactivation re-check permission. Browser restrictions prevent this site from erasing YouTube-domain storage or undoing prior third-party processing; the notice explains that limit.
- The English and Bahasa Malaysia notice identifies Khalil Nooh and the user-provided `khalil.himura+privacy@gmail.com` contact, providers, purposes, international processing, local-storage duration, provider retention policies, requests and complaints. Other linked TFIS/social websites have separate policies.

## Maintenance

Bump `CONSENT_VERSION` in `src/lib/consent.mjs` whenever optional purposes or providers change materially. Update both language versions of the notice and its date at the same time. Keep the same storage key so older-version records are detected and removed.

Do not add optional analytics, advertising, preconnects, third-party images or embeds without adding an appropriate default-off category and enforcing consent before its first request. Audit Cloudflare dashboard injection settings when enabling new features; a client banner cannot retroactively block edge-injected scripts. Review actual security/log-retention settings, processor terms and relevant transfer obligations as part of operations. No Cloudflare security settings were changed by this implementation.

Consent is recorded on the visitor's device only. No central evidence log was added. Whether additional evidence, processor contracts or other compliance records are needed depends on the site's processing and applicable law. Keep the published privacy mailbox monitored; Gmail plus addressing is an alias to the existing inbox, not a disposable or anonymous account.

## Verification

- Unit tests cover rejection/default denial, exact expiry, invalid records, version changes, unavailable storage, failed rejection writes and persisted choices.
- Browser checks: no iframe or YouTube/Google request before permission, after rejection, or on acceptance alone; explicit video request after permission creates a no-autoplay embed; rejection survives reload; withdrawal removes players in both open tabs.
- No-JavaScript visitors can use direct video links; disabled inline-player controls cannot contact YouTube.

## Primary guidance consulted

- [ICO: storage and access technologies](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/)
- [ICO: managing consent in practice](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/how-do-we-manage-consent-in-practice/)
- [Malaysia PDP: privacy-notice guide](https://www.pdp.gov.my/ppdpv1/wp-content/uploads/2025/01/A-Quick-Guide-to-PRIVACY-NOTICE.pdf)
- [Cloudflare: security cookies](https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/)
- [YouTube: privacy-enhanced embeds](https://support.google.com/youtube/answer/171780?hl=en)
