import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const posts = await getCollection("posts");
  return rss({
    title: "Khalil Nooh Public Timeline",
    description: "Source-linked public postings, portfolio notes, and media updates.",
    site: context.site,
    items: posts
      .sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf())
      .map((post) => ({
        title: post.data.title,
        pubDate: post.data.publishedAt,
        description: post.data.summary,
        link: `/timeline/${post.slug}/`
      }))
  });
}
