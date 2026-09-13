const SITE_DOMAIN = "khalilnooh.com";

/** @param {string} href @param {string} pageUrl */
export function isExternalLink(href, pageUrl) {
  try {
    const page = new URL(pageUrl);
    const destination = new URL(href, page);
    if (!["http:", "https:"].includes(destination.protocol)) return false;
    const host = destination.hostname.toLowerCase().replace(/\.$/, "");
    return host !== page.hostname.toLowerCase().replace(/\.$/, "") &&
      host !== SITE_DOMAIN && !host.endsWith(`.${SITE_DOMAIN}`);
  } catch {
    return false;
  }
}

/** @param {string} href @param {string} pageUrl @param {string} [rel] */
export function linkAttributes(href, pageUrl, rel = "") {
  const external = isExternalLink(href, pageUrl);
  const tokens = new Set(rel.split(/\s+/).filter(Boolean).map(token => token.toLowerCase()));
  if (external) {
    tokens.add("noopener");
    tokens.add("noreferrer");
  }
  return { target: external ? "_blank" : null, rel: [...tokens].join(" ") || null };
}
