import fs from "node:fs/promises";
import path from "node:path";

import { renderRss } from "./rss";
import { renderPage, renderPostPages, type StaticBlog, type StaticPost } from "./render";
import { renderSitemap } from "./sitemap";

export async function generateStaticSite(input: {
  blog: StaticBlog;
  posts: StaticPost[];
  outputDir: string;
}) {
  await fs.rm(input.outputDir, { recursive: true, force: true });
  await fs.mkdir(input.outputDir, { recursive: true });

  const writtenFiles: string[] = [];

  await writeFile(
    input.outputDir,
    "index.html",
    renderPage({
      blog: input.blog,
      title: input.blog.name,
      description: `${input.blog.name} posts`,
      canonicalPath: "/",
      body: `<h1>${escapeHtml(input.blog.name)}</h1>${renderPostList(input.posts)}`,
    }),
    writtenFiles,
  );

  await writeFile(
    input.outputDir,
    "blog/index.html",
    renderPage({
      blog: input.blog,
      title: `Posts - ${input.blog.name}`,
      description: `${input.blog.name} blog posts`,
      canonicalPath: "/blog/",
      body: `<h1>Posts</h1>${renderPostList(input.posts)}`,
    }),
    writtenFiles,
  );

  const publicPaths = ["/", "/blog/"];

  for (const post of input.posts) {
    for (const page of renderPostPages(input.blog, post)) {
      await writeFile(input.outputDir, pathFromPublicPath(page.path), page.html, writtenFiles);
      publicPaths.push(page.path);
    }
  }

  for (const category of uniqueTerms(input.posts.flatMap((post) => (post.category ? [post.category] : [])))) {
    const posts = input.posts.filter((post) => post.category?.slug === category.slug);
    const publicPath = `/category/${category.slug}/`;
    await writeFile(
      input.outputDir,
      pathFromPublicPath(publicPath),
      renderPage({
        blog: input.blog,
        title: `${category.name} - ${input.blog.name}`,
        description: `Posts in ${category.name}`,
        canonicalPath: publicPath,
        body: `<h1>${escapeHtml(category.name)}</h1>${renderPostList(posts)}`,
      }),
      writtenFiles,
    );
    publicPaths.push(publicPath);
  }

  for (const tag of uniqueTerms(input.posts.flatMap((post) => post.tags))) {
    const posts = input.posts.filter((post) => post.tags.some((postTag) => postTag.slug === tag.slug));
    const publicPath = `/tag/${tag.slug}/`;
    await writeFile(
      input.outputDir,
      pathFromPublicPath(publicPath),
      renderPage({
        blog: input.blog,
        title: `${tag.name} - ${input.blog.name}`,
        description: `Posts tagged ${tag.name}`,
        canonicalPath: publicPath,
        body: `<h1>${escapeHtml(tag.name)}</h1>${renderPostList(posts)}`,
      }),
      writtenFiles,
    );
    publicPaths.push(publicPath);
  }

  await writeFile(input.outputDir, "sitemap.xml", renderSitemap(input.blog.baseUrl, publicPaths), writtenFiles);
  await writeFile(input.outputDir, "rss.xml", renderRss(input.blog, input.posts), writtenFiles);
  await writeFile(input.outputDir, "robots.txt", "User-agent: *\nAllow: /\nSitemap: /sitemap.xml\n", writtenFiles);

  return { files: writtenFiles };
}

async function writeFile(outputDir: string, relativePath: string, contents: string, writtenFiles: string[]) {
  const destination = path.join(outputDir, relativePath);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, contents);
  writtenFiles.push(relativePath.replaceAll("\\", "/"));
}

function pathFromPublicPath(publicPath: string) {
  const trimmed = publicPath.replace(/^\/+/, "");
  return trimmed.endsWith("/") ? `${trimmed}index.html` : trimmed;
}

function renderPostList(posts: StaticPost[]) {
  const items = posts
    .map((post) => `<li><a href="/blog/${post.slug}/">${escapeHtml(post.title)}</a></li>`)
    .join("");
  return `<ul>${items}</ul>`;
}

function uniqueTerms(terms: { name: string; slug: string }[]) {
  return Array.from(new Map(terms.map((term) => [term.slug, term])).values());
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
