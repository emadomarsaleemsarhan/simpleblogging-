import { describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import { generateStaticSite } from "../../src/lib/static/site-generator";

describe("generateStaticSite", () => {
  it("writes core static files", async () => {
    const outputDir = path.join(process.cwd(), ".tmp/static-test");
    await fs.rm(outputDir, { recursive: true, force: true });

    const result = await generateStaticSite({
      blog: { name: "My Blog", baseUrl: "https://example.com", locale: "en" },
      posts: [
        {
          title: "Hello",
          slug: "hello",
          html: "<h1>Hello</h1><p>World</p>",
          metaDescription: "World",
          updatedAt: new Date("2026-05-04T00:00:00Z"),
          tags: [],
          category: null,
        },
      ],
      outputDir,
    });

    expect(result.files).toContain("index.html");
    expect(result.files).toContain("blog/hello/index.html");
    expect(result.files).toContain("sitemap.xml");
    expect(result.files).toContain("rss.xml");
    expect(result.files).toContain("robots.txt");
    await expect(fs.access(path.join(outputDir, "blog/hello/index.html"))).resolves.toBeUndefined();
  });

  it("renders Arabic site direction and portable internal links", async () => {
    const outputDir = path.join(process.cwd(), ".tmp/static-ar-test");
    await fs.rm(outputDir, { recursive: true, force: true });

    await generateStaticSite({
      blog: { name: "مدونتي", baseUrl: "https://example.com", locale: "ar" },
      posts: [
        {
          title: "مرحبا",
          slug: "hello",
          html: "<h1>مرحبا</h1><p>نص طويل</p>",
          metaDescription: "نص طويل",
          updatedAt: new Date("2026-05-04T00:00:00Z"),
          tags: [],
          category: null,
        },
      ],
      outputDir,
    });

    const html = await fs.readFile(path.join(outputDir, "blog/hello/index.html"), "utf8");
    expect(html).toContain('<html lang="ar" dir="rtl">');
    expect(html).toContain('href="../../index.html"');
    expect(html).toContain('href="../index.html"');
    expect(html).not.toContain('<a href="/blog/');
    expect(html).not.toContain('href="https://example.com/blog/');
  });

  it("writes links that work from the exported ZIP file tree", async () => {
    const outputDir = path.join(process.cwd(), ".tmp/static-portable-links-test");
    await fs.rm(outputDir, { recursive: true, force: true });

    await generateStaticSite({
      blog: { name: "My Blog", baseUrl: "https://example.com", locale: "en" },
      posts: [
        {
          title: "Hello",
          slug: "hello",
          html: "<h1>Hello</h1><p>World</p>",
          metaDescription: "World",
          updatedAt: new Date("2026-05-04T00:00:00Z"),
          tags: [],
          category: null,
        },
      ],
      outputDir,
    });

    const home = await fs.readFile(path.join(outputDir, "index.html"), "utf8");
    const post = await fs.readFile(path.join(outputDir, "blog/hello/index.html"), "utf8");

    expect(home).toContain('href="blog/index.html"');
    expect(home).toContain('href="blog/hello/index.html"');
    expect(post).toContain('href="../../index.html"');
    expect(post).toContain('href="../index.html"');
  });

  it("renders the selected static template", async () => {
    const outputDir = path.join(process.cwd(), ".tmp/static-template-test");
    await fs.rm(outputDir, { recursive: true, force: true });

    await generateStaticSite({
      blog: { name: "My Blog", baseUrl: "https://example.com", locale: "en", templateKey: "editorial" },
      posts: [],
      outputDir,
    });

    const html = await fs.readFile(path.join(outputDir, "index.html"), "utf8");
    expect(html).toContain('data-template="editorial"');
  });
});
