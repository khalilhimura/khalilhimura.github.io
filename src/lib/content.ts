import { getCollection } from "astro:content";

export async function getPublishedPosts() {
  const posts = await getCollection("posts");
  return posts.sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());
}

export async function getProjects() {
  const projects = await getCollection("projects");
  return projects.sort((a, b) => a.data.title.localeCompare(b.data.title));
}

export async function getMediaItems() {
  const media = await getCollection("media");
  return media.sort((a, b) => b.data.capturedAt.valueOf() - a.data.capturedAt.valueOf());
}

export function getYear(date: Date) {
  return new Intl.DateTimeFormat("en", { year: "numeric" }).format(date);
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

export function uniqueSorted(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}
