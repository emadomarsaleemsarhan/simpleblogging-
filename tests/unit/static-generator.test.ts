import { describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import { generateStaticSite } from "../../src/lib/static/site-generator";

function extractJsonLd(html: string) {
  const match = html.match(/<script type="application\/ld\+json">(?<json>[\s\S]*?)<\/script>/);
  if (!match?.groups?.json) {
    throw new Error("JSON-LD script was not found");
  }
  return match.groups.json;
}

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

  it("keeps sitemap and RSS links free of deployment domains", async () => {
    const outputDir = path.join(process.cwd(), ".tmp/static-feed-links-test");
    await fs.rm(outputDir, { recursive: true, force: true });

    await generateStaticSite({
      blog: { name: "My Blog", baseUrl: "http://localhost:52345", locale: "en" },
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

    const sitemap = await fs.readFile(path.join(outputDir, "sitemap.xml"), "utf8");
    const rss = await fs.readFile(path.join(outputDir, "rss.xml"), "utf8");

    expect(sitemap).toContain("<loc>/blog/hello/</loc>");
    expect(rss).toContain("<link>/blog/hello/</link>");
    expect(`${sitemap}\n${rss}`).not.toContain("localhost");
    expect(`${sitemap}\n${rss}`).not.toContain("https://example.com");
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
    expect(html).toContain("static-masthead");
  });

  it("uses the editorial template by default", async () => {
    const outputDir = path.join(process.cwd(), ".tmp/static-default-template-test");
    await fs.rm(outputDir, { recursive: true, force: true });

    await generateStaticSite({
      blog: { name: "My Blog", baseUrl: "https://example.com", locale: "en" },
      posts: [],
      outputDir,
    });

    const html = await fs.readFile(path.join(outputDir, "index.html"), "utf8");
    expect(html).toContain('data-template="editorial"');
    expect(html).toContain("--theme-primary: #0f6f5c");
    expect(html).toContain("class=\"post-list\"");
    expect(html).toContain("static-brand");
  });

  it("applies selected template and theme variables to generated HTML", async () => {
    const outputDir = path.join(process.cwd(), ".tmp/static-themed-template-test");
    await fs.rm(outputDir, { recursive: true, force: true });

    await generateStaticSite({
      blog: {
        name: "My Blog",
        baseUrl: "https://example.com",
        locale: "en",
        templateKey: "magazine",
        themePrimaryColor: "#123456",
        themeSecondaryColor: "#abcdef",
        themeBackgroundColor: "#fafafa",
        themeHeadingStyle: "bold",
      },
      posts: [],
      outputDir,
    });

    const html = await fs.readFile(path.join(outputDir, "index.html"), "utf8");
    expect(html).toContain('data-template="magazine"');
    expect(html).toContain("--theme-primary: #123456");
    expect(html).toContain("--theme-secondary: #abcdef");
    expect(html).toContain("--theme-background: #fafafa");
    expect(html).toContain("--heading-weight: 950");
  });

  it("falls back safely when optional theme values are invalid or missing", async () => {
    const outputDir = path.join(process.cwd(), ".tmp/static-invalid-theme-test");
    await fs.rm(outputDir, { recursive: true, force: true });

    await generateStaticSite({
      blog: {
        name: "My Blog",
        baseUrl: "https://example.com",
        locale: "en",
        themePrimaryColor: "url(javascript:alert(1))",
        themeSecondaryColor: null,
        themeBackgroundColor: "red",
        themeHeadingStyle: "script",
      },
      posts: [],
      outputDir,
    });

    const html = await fs.readFile(path.join(outputDir, "index.html"), "utf8");
    expect(html).toContain("--theme-primary: #0f6f5c");
    expect(html).toContain("--theme-secondary: #c9842b");
    expect(html).toContain("--theme-background: #f6f1e7");
    expect(html).toContain("--heading-weight: 850");
    expect(html).not.toContain("url(javascript:alert(1))");
  });

  it("rejects public paths that would write outside the output directory", async () => {
    const outputDir = path.join(process.cwd(), ".tmp/static-path-traversal-test");
    const storageRoot = path.join(process.cwd(), ".tmp");
    const escapedPath = path.join(storageRoot, "outside-owned", "index.html");
    await fs.rm(outputDir, { recursive: true, force: true });
    await fs.rm(path.dirname(escapedPath), { recursive: true, force: true });

    await expect(
      generateStaticSite({
        blog: { name: "My Blog", baseUrl: "https://example.com", locale: "en" },
        posts: [
          {
            title: "Unsafe",
            slug: "../../outside-owned",
            html: "<p>Unsafe</p>",
            metaDescription: "Unsafe",
            updatedAt: new Date("2026-05-04T00:00:00Z"),
            tags: [],
            category: null,
          },
        ],
        outputDir,
      }),
    ).rejects.toThrow(/Unsafe static output path/);

    await expect(fs.access(escapedPath)).rejects.toThrow();
  });

  it("does not emit active script content from stored post HTML", async () => {
    const outputDir = path.join(process.cwd(), ".tmp/static-sanitized-html-test");
    await fs.rm(outputDir, { recursive: true, force: true });

    await generateStaticSite({
      blog: { name: "My Blog", baseUrl: "https://example.com", locale: "en" },
      posts: [
        {
          title: "Unsafe",
          slug: "unsafe",
          html: '<p>Unsafe</p><img src="x" onerror="alert(1)"><script>alert(2)</script>',
          metaDescription: "Unsafe",
          updatedAt: new Date("2026-05-04T00:00:00Z"),
          tags: [],
          category: null,
        },
      ],
      outputDir,
    });

    const html = await fs.readFile(path.join(outputDir, "blog/unsafe/index.html"), "utf8");
    expect(html).toContain("<p>Unsafe</p>");
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("<script>alert(2)</script>");
  });

  it("emits parseable JSON-LD while escaping script-breaking content", async () => {
    const outputDir = path.join(process.cwd(), ".tmp/static-json-ld-test");
    await fs.rm(outputDir, { recursive: true, force: true });

    await generateStaticSite({
      blog: { name: "My Blog", baseUrl: "https://example.com", locale: "en" },
      posts: [
        {
          title: 'Unsafe </script><script>alert("x")</script> & line\u2028sep',
          slug: "json-ld",
          html: "<p>Safe body</p>",
          metaDescription: "JSON-LD test",
          updatedAt: new Date("2026-05-04T00:00:00Z"),
          tags: [],
          category: null,
        },
      ],
      outputDir,
    });

    const html = await fs.readFile(path.join(outputDir, "blog/json-ld/index.html"), "utf8");
    const json = extractJsonLd(html);
    const structuredData = JSON.parse(json);

    expect(structuredData.headline).toBe('Unsafe </script><script>alert("x")</script> & line\u2028sep');
    expect(json).toContain("\\u003c/script\\u003e\\u003cscript\\u003e");
    expect(json).toContain("\\u0026");
    expect(json).not.toContain("&quot;");
    expect(json).not.toContain("</script><script>");
  });
});
