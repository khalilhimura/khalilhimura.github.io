import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const dryRun = process.argv.includes("--dry-run");
const sourcesDir = path.join(root, "src/content/sources");
const postsDir = path.join(root, "src/content/posts");

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/https?:\/\//g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function frontmatter(record) {
  return `---\ntitle: "${record.title.replaceAll('"', '\\"')}"\nsource: "${record.source.replaceAll('"', '\\"')}"\nsourceUrl: "${record.sourceUrl}"\npublishedAt: ${record.publishedAt}\nsummary: "${record.summary.replaceAll('"', '\\"')}"\ntags: ${JSON.stringify(record.tags)}\nmedia: []\ncrawlStatus: "${record.crawlStatus}"\n---\n\n${record.body}\n`;
}

async function listSources() {
  const { readdir } = await import("node:fs/promises");
  const files = await readdir(sourcesDir);
  const sources = [];
  for (const file of files.filter((name) => name.endsWith(".json"))) {
    const fullPath = path.join(sourcesDir, file);
    const parsed = JSON.parse(await readFile(fullPath, "utf8"));
    sources.push({ ...parsed, file });
  }
  return sources;
}

async function fetchPublicProfile(source) {
  if (!source.enabled) {
    return {
      title: `${source.platform} source disabled`,
      summary: "Source is configured but disabled.",
      body: "Enable this source once its public URL and crawl behavior are confirmed.",
      crawlStatus: "manual-review"
    };
  }

  if (source.crawlStrategy === "adapter") {
    return {
      title: `${source.platform} adapter pending`,
      summary: "Adapter source is waiting for a known export or API shape.",
      body: "This source uses an adapter boundary. Implement the adapter once the export or API contract is available.",
      crawlStatus: "manual-review"
    };
  }

  try {
    const response = await fetch(source.profileUrl, {
      headers: {
        "user-agent": "KhalilNoohSiteCrawler/0.1 public-profile-indexer"
      }
    });

    if (!response.ok) {
      return blocked(source, `Public request returned HTTP ${response.status}.`);
    }

    const html = await response.text();
    const title = html.match(/<title[^>]*>(.*?)<\/title>/is)?.[1]?.replace(/\s+/g, " ").trim();
    const description = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1];

    return {
      title: title || `${source.platform} public profile snapshot`,
      summary: description || `Public metadata discovered for ${source.platform}. Review before publishing.`,
      body: `A public crawl reached ${source.profileUrl}. Review the source page and replace this draft with the specific post body or extracted public update.`,
      crawlStatus: "manual-review"
    };
  } catch (error) {
    return blocked(source, error.message);
  }
}

function blocked(source, reason) {
  return {
    title: `${source.platform} public source stub`,
    summary: `${source.platform} did not expose a full public body during crawling.`,
    body: `The crawler could not collect full public content from ${source.profileUrl}.\n\nReason: ${reason}\n\nKeep this as a source stub or replace it with an approved public export.`,
    crawlStatus: "blocked"
  };
}

await mkdir(postsDir, { recursive: true });
const sources = await listSources();
const today = new Date().toISOString().slice(0, 10);
const created = [];

for (const source of sources) {
  const result = await fetchPublicProfile(source);
  const slug = `${today}-${slugify(source.platform)}-${slugify(result.title)}`;
  const target = path.join(postsDir, `${slug}.md`);

  const record = {
    title: result.title,
    source: source.platform,
    sourceUrl: source.profileUrl,
    publishedAt: today,
    summary: result.summary,
    tags: ["public source", source.platform.toLowerCase().replaceAll(" ", "-")],
    crawlStatus: result.crawlStatus,
    body: result.body
  };

  if (existsSync(target)) {
    created.push({ target, status: "exists" });
    continue;
  }

  if (!dryRun) {
    await writeFile(target, frontmatter(record), "utf8");
  }
  created.push({ target, status: dryRun ? "dry-run" : "created" });
}

console.table(created);
