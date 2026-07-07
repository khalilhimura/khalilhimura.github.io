import assert from "node:assert/strict";
import { test } from "node:test";

import { buildOgImageSvg, OG_IMAGE_SIZE } from "../scripts/lib/og-image.mjs";

test("OG image generation is deterministic for a given seed", () => {
  const a = buildOgImageSvg("the-judgment-ledger");
  const b = buildOgImageSvg("the-judgment-ledger");
  assert.equal(a, b);
});

test("OG image varies between different seeds", () => {
  const a = buildOgImageSvg("the-judgment-ledger");
  const b = buildOgImageSvg("research-agent-harness");
  assert.notEqual(a, b);
});

test("OG image is a well-formed SVG at the standard social card size", () => {
  const svg = buildOgImageSvg("khalilnooh.com");
  assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.match(svg, new RegExp(`width="${OG_IMAGE_SIZE.width}" height="${OG_IMAGE_SIZE.height}"`));
  assert.equal((svg.match(/<svg/g) || []).length, 1);
});
