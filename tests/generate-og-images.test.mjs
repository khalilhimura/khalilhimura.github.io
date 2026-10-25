import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { renderToFile } from "../scripts/generate-og-images.mjs";

function sha256(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

test("renderToFile leaves an existing OG PNG unchanged", async () => {
  const dir = await mkdtemp(join(tmpdir(), "og-skip-"));
  const outPath = join(dir, "when-the-subsidies-dim.png");
  const existing = Buffer.from("handmade-og-card");
  await writeFile(outPath, existing);

  await renderToFile("when-the-subsidies-dim", outPath);

  assert.equal(sha256(await readFile(outPath)), sha256(existing));
});

test("renderToFile writes a PNG when the OG file is missing", async () => {
  const dir = await mkdtemp(join(tmpdir(), "og-write-"));
  const outPath = join(dir, "missing-slug.png");

  await renderToFile("missing-slug", outPath);

  const png = await readFile(outPath);
  assert.equal(png.subarray(0, 8).toString("binary"), "\x89PNG\r\n\x1a\n");
});
