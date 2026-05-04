import { absoluteUrl } from "./render";

export function renderSitemap(baseUrl: string, paths: string[]) {
  const urls = paths
    .map((pathname) => `  <url><loc>${absoluteUrl(baseUrl, pathname)}</loc></url>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}
