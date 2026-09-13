import { parse, serialize } from "parse5";
import { linkAttributes } from "./link-policy.mjs";

/** Apply the policy to rendered HTML, including Markdown and noscript fallbacks.
 * @param {string} html @param {string} pageUrl
 */
export function rewriteHtmlLinks(html, pageUrl) {
  const document = parse(html, { scriptingEnabled: false });
  function visit(node) {
    if (["a", "area"].includes(node.tagName)) {
      const href = node.attrs.find(attr => attr.name === "href");
      if (href) {
        const rel = node.attrs.find(attr => attr.name === "rel")?.value;
        const attributes = linkAttributes(href.value, pageUrl, rel);
        node.attrs = node.attrs.filter(attr => !["target", "rel"].includes(attr.name));
        for (const [name, value] of Object.entries(attributes)) {
          if (value !== null) node.attrs.push({ name, value });
        }
      }
    }
    for (const child of node.childNodes ?? []) visit(child);
    if (node.content) visit(node.content);
  }
  visit(document);
  return serialize(document);
}
