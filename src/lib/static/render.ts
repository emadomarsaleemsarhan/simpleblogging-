import { paginateHtml } from "@/lib/posts/pagination";

export type StaticPost = {
  title: string;
  slug: string;
  html: string;
  metaDescription: string;
  updatedAt: Date;
  tags: { name: string; slug: string }[];
  category: { name: string; slug: string } | null;
};

export type StaticBlog = {
  name: string;
  baseUrl: string;
};

export function renderPage(input: {
  blog: StaticBlog;
  title: string;
  description: string;
  canonicalPath: string;
  body: string;
  previousPath?: string;
  nextPath?: string;
  structuredData?: object;
}) {
  const canonicalUrl = absoluteUrl(input.blog.baseUrl, input.canonicalPath);
  const structuredData = input.structuredData
    ? `<script type="application/ld+json">${escapeHtml(JSON.stringify(input.structuredData))}</script>`
    : "";
  const previous = input.previousPath ? `<link rel="prev" href="${absoluteUrl(input.blog.baseUrl, input.previousPath)}">` : "";
  const next = input.nextPath ? `<link rel="next" href="${absoluteUrl(input.blog.baseUrl, input.nextPath)}">` : "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(input.title)}</title>
  <meta name="description" content="${escapeHtml(input.description)}">
  <link rel="canonical" href="${canonicalUrl}">
  ${previous}
  ${next}
  <meta property="og:title" content="${escapeHtml(input.title)}">
  <meta property="og:description" content="${escapeHtml(input.description)}">
  ${structuredData}
</head>
<body>
  <header><a href="/">${escapeHtml(input.blog.name)}</a></header>
  <main>${input.body}</main>
</body>
</html>`;
}

export function renderPostPages(blog: StaticBlog, post: StaticPost, wordThreshold = 900) {
  const pages = paginateHtml(post.html, wordThreshold);

  return pages.map((html, index) => {
    const pageNumber = index + 1;
    const canonicalPath = postPath(post.slug, pageNumber);
    return {
      path: canonicalPath,
      html: renderPage({
        blog,
        title: pageNumber === 1 ? post.title : `${post.title} - Page ${pageNumber}`,
        description: post.metaDescription,
        canonicalPath,
        previousPath: pageNumber > 1 ? postPath(post.slug, pageNumber - 1) : undefined,
        nextPath: pageNumber < pages.length ? postPath(post.slug, pageNumber + 1) : undefined,
        structuredData: {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          dateModified: post.updatedAt.toISOString(),
        },
        body: `<article>${html}${renderPagination(post.slug, pageNumber, pages.length)}</article>`,
      }),
    };
  });
}

export function postPath(slug: string, pageNumber = 1) {
  return pageNumber === 1 ? `/blog/${slug}/` : `/blog/${slug}/page/${pageNumber}/`;
}

export function absoluteUrl(baseUrl: string, pathname: string) {
  return new URL(pathname, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`).toString();
}

function renderPagination(slug: string, currentPage: number, pageCount: number) {
  if (pageCount <= 1) {
    return "";
  }

  const links = Array.from({ length: pageCount }, (_, index) => {
    const pageNumber = index + 1;
    return `<a href="${postPath(slug, pageNumber)}">${pageNumber}</a>`;
  }).join("");

  return `<nav aria-label="Post pages">${links}</nav>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
