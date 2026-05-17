import { paginateHtml } from "@/lib/posts/pagination";
import { sanitizePostHtml } from "@/lib/html";
import { portableHref, rootRelative } from "./links";
import { getStaticLocale, getStaticTemplate, normalizeStaticTheme } from "./templates";

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
  locale?: string;
  templateKey?: string;
  themePrimaryColor?: string | null;
  themeSecondaryColor?: string | null;
  themeBackgroundColor?: string | null;
  themeHeadingStyle?: string | null;
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
  const locale = getStaticLocale(input.blog.locale);
  const template = getStaticTemplate(input.blog.templateKey);
  const structuredData = input.structuredData
    ? `<script type="application/ld+json">${escapeHtml(JSON.stringify(input.structuredData))}</script>`
    : "";

  return template.renderPage({
    blogName: input.blog.name,
    locale,
    currentPath: input.canonicalPath,
    title: input.title,
    description: input.description,
    canonicalUrl: rootRelative(input.canonicalPath),
    previousUrl: input.previousPath ? rootRelative(input.previousPath) : undefined,
    nextUrl: input.nextPath ? rootRelative(input.nextPath) : undefined,
    structuredData,
    theme: normalizeStaticTheme(input.blog),
    body: input.body,
  });
}

export function renderPostPages(blog: StaticBlog, post: StaticPost, wordThreshold = 900) {
  const pages = paginateHtml(sanitizePostHtml(post.html), wordThreshold);
  const labels = getStaticTemplate(blog.templateKey).labels(getStaticLocale(blog.locale));

  return pages.map((html, index) => {
    const pageNumber = index + 1;
    const canonicalPath = postPath(post.slug, pageNumber);
    return {
      path: canonicalPath,
      html: renderPage({
        blog,
        title: pageNumber === 1 ? post.title : `${post.title} - ${labels.posts} ${pageNumber}`,
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
        body: `<article>${html}${renderPagination(canonicalPath, post.slug, pageNumber, pages.length, labels)}</article>`,
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

function renderPagination(
  currentPath: string,
  slug: string,
  currentPage: number,
  pageCount: number,
  labels: { previous: string; next: string },
) {
  if (pageCount <= 1) {
    return "";
  }

  const previous =
    currentPage > 1
      ? `<a href="${portableHref(currentPath, postPath(slug, currentPage - 1))}">${escapeHtml(labels.previous)}</a>`
      : "";
  const next =
    currentPage < pageCount
      ? `<a href="${portableHref(currentPath, postPath(slug, currentPage + 1))}">${escapeHtml(labels.next)}</a>`
      : "";
  const links = Array.from({ length: pageCount }, (_, index) => {
    const pageNumber = index + 1;
    if (pageNumber === currentPage) {
      return `<span aria-current="page">${pageNumber}</span>`;
    }
    return `<a href="${portableHref(currentPath, postPath(slug, pageNumber))}">${pageNumber}</a>`;
  }).join("");

  return `<nav class="pagination" aria-label="Post pages">${previous}${links}${next}</nav>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
