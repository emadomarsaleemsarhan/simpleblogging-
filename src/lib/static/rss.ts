import type { StaticBlog, StaticPost } from "./render";
import { rootRelative } from "./links";
import { postPath } from "./render";

export function renderRss(blog: StaticBlog, posts: StaticPost[]) {
  const items = posts
    .map(
      (post) => `<item>
  <title>${escapeXml(post.title)}</title>
  <link>${rootRelative(postPath(post.slug))}</link>
  <guid>${rootRelative(postPath(post.slug))}</guid>
  <description>${escapeXml(post.metaDescription)}</description>
  <pubDate>${post.updatedAt.toUTCString()}</pubDate>
</item>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${escapeXml(blog.name)}</title>
  <link>/</link>
  <description>${escapeXml(blog.name)}</description>
${items}
</channel>
</rss>`;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
