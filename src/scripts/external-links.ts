import { linkAttributes } from "../lib/link-policy.mjs";

function applyPolicy(link: Element) {
  const href = link.getAttribute("href");
  if (href === null) return;
  const attributes = linkAttributes(href, location.href, link.getAttribute("rel") ?? "");
  for (const [name, value] of Object.entries(attributes)) {
    if (value === null) link.removeAttribute(name);
    else link.setAttribute(name, value);
  }
}

function scan(root: ParentNode) {
  if (root instanceof Element && root.matches("a[href], area[href]")) applyPolicy(root);
  root.querySelectorAll("a[href], area[href]").forEach(applyPolicy);
}
scan(document);
// Covers search results and links whose destination changes after a selection.
new MutationObserver(records => {
  for (const record of records) {
    if (record.type === "attributes" && record.target instanceof Element) applyPolicy(record.target);
    record.addedNodes.forEach(node => {
      if (node instanceof Element) scan(node);
    });
  }
}).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["href"] });
