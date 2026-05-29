import { defineCollection, z } from "astro:content";

const status = z.enum(["scraped", "stub", "manual-review", "blocked", "imported"]);

const posts = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    source: z.string(),
    sourceUrl: z.string().url(),
    publishedAt: z.coerce.date(),
    summary: z.string(),
    tags: z.array(z.string()),
    media: z.array(z.string()).default([]),
    crawlStatus: status
  })
});

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    role: z.string(),
    dates: z.string(),
    description: z.string(),
    outcomes: z.array(z.string()),
    links: z.array(z.object({ label: z.string(), url: z.string().url() })).default([]),
    media: z.array(z.string()).default([]),
    tags: z.array(z.string())
  })
});

const media = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    type: z.enum(["image", "video", "embed"]),
    localPath: z.string().optional(),
    originalUrl: z.string().url(),
    source: z.string(),
    attribution: z.string(),
    capturedAt: z.coerce.date(),
    tags: z.array(z.string()).default([])
  })
});

const sources = defineCollection({
  type: "data",
  schema: z.object({
    platform: z.string(),
    profileUrl: z.string().url(),
    crawlStrategy: z.enum(["profile", "sitemap", "adapter", "manual"]),
    enabled: z.boolean(),
    lastCrawledAt: z.string().nullable()
  })
});

export const collections = { posts, projects, media, sources };
