import assert from "node:assert/strict";
import { test } from "node:test";
import { parse } from "parse5";
import { isExternalLink, linkAttributes } from "../src/lib/link-policy.mjs";
import { rewriteHtmlLinks } from "../src/lib/html-links.mjs";

const page = "https://khalilnooh.com/media/";
test("external web destinations include other products, protocol-relative links, and misleading hostnames", () => {
  for (const href of ["https://thefutureissolo.com/", "//youtube.com/watch?v=123", "http://example.org/", "https://khalilnooh.com.example.org/", "https://khalilnooh.com@example.org/"]) {
    assert.equal(isExternalLink(href, page), true, href);
    assert.equal(linkAttributes(href, page).target, "_blank");
  }
});
test("navigation within the domain, anchors, and protocol handlers stay in the current context", () => {
  for (const href of ["/profile/", "../blog/", "#coverage", "?v=123", "https://khalilnooh.com/", "https://www.khalilnooh.com/", "https://media.khalilnooh.com/a.png", "https://KHALILNOOH.COM./", "mailto:hello@example.org", "tel:+123", "http://["]) {
    assert.equal(isExternalLink(href, page), false, href);
    assert.equal(linkAttributes(href, page).target, null);
  }
  assert.equal(isExternalLink("http://127.0.0.1:4322/profile/", "http://127.0.0.1:4322/"), false);
  assert.equal(isExternalLink("https://khalilnooh.com/profile/", "http://127.0.0.1:4322/"), false);
});
test("new-tab security tokens are merged without losing editorial rel attributes", () => {
  const attrs = linkAttributes("https://example.org/", page, "nofollow sponsored noopener");
  assert.equal(attrs.target, "_blank");
  assert.deepEqual(new Set(attrs.rel.split(" ")), new Set(["nofollow", "sponsored", "noopener", "noreferrer"]));
});
test("rendered HTML covers body, Markdown-like content, noscript, and image maps without rewriting script text", () => {
  const source = '<!doctype html><html><head><script>const snippet = `<a href="https://untouched.test/">`;</script></head><body><a href="https://outside.test/?x=1&amp;y=2" rel="nofollow">Outside</a><p><a href="/profile/" target="_blank">Inside</a></p><noscript><a href="https://youtube.com/">Fallback</a></noscript><map><area href="https://example.org/" target="_self"></map></body></html>';
  const output = rewriteHtmlLinks(source, page);
  const tree = parse(output, { scriptingEnabled: false });
  const links = [];
  function visit(node) { if (["a", "area"].includes(node.tagName)) links.push(Object.fromEntries(node.attrs.map(a => [a.name,a.value]))); for (const n of node.childNodes ?? []) visit(n); }
  visit(tree);
  assert.equal(links.length, 4);
  assert.equal(links[0].href, "https://outside.test/?x=1&y=2");
  assert.equal(links[1].target, undefined);
  for (const link of [links[0],links[2],links[3]]) { assert.equal(link.target, "_blank"); assert.match(link.rel, /noopener/); assert.match(link.rel, /noreferrer/); }
  assert.ok(output.includes('const snippet = `<a href="https://untouched.test/">`;'));
});
