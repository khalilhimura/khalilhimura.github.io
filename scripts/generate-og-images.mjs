import { Resvg } from "@resvg/resvg-js";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { buildOgImageSvg } from "./lib/og-image.mjs";

const rootDir = fileURLToPath(new URL("..", import.meta.url));
const postsDir = join(rootDir, "src/content/posts");
const outDir = join(rootDir, "public/og");

async function renderToFile(seedText, outPath) {
  const svg = buildOgImageSvg(seedText);
  const png = new Resvg(svg, { background: "white" }).render().asPng();
  await writeFile(outPath, png);
}

async function main() {
  await mkdir(outDir, { recursive: true });

  await renderToFile("khalilnooh.com", join(outDir, "default.png"));

  const entries = await readdir(postsDir, { withFileTypes: true });
  const slugs = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name.replace(/\.md$/, ""));

  for (const slug of slugs) {
    await renderToFile(slug, join(outDir, `${slug}.png`));
  }

  console.log(`Generated ${slugs.length + 1} OG image(s) in public/og/`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
