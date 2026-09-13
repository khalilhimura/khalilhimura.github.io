import { defineMiddleware } from "astro:middleware";
import { rewriteHtmlLinks } from "./lib/html-links.mjs";

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  if (!response.headers.get("content-type")?.includes("text/html")) return response;
  const html = rewriteHtmlLinks(await response.text(), context.url.href);
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(html, { status: response.status, statusText: response.statusText, headers });
});
