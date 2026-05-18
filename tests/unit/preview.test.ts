import { describe, expect, it } from "vitest";
import path from "node:path";
import { previewContentType, resolvePreviewFile, rewritePreviewHtmlLinks } from "../../src/lib/static/preview";

describe("static export preview helpers", () => {
  it("resolves root and directory requests to index.html", () => {
    const root = path.join(process.cwd(), ".tmp/site-preview");

    expect(resolvePreviewFile(root, undefined)).toBe(path.join(root, "index.html"));
    expect(resolvePreviewFile(root, ["blog", "hello"], true)).toBe(path.join(root, "blog", "hello", "index.html"));
  });

  it("rejects paths outside the exported site directory", () => {
    const root = path.join(process.cwd(), ".tmp/site-preview");

    expect(resolvePreviewFile(root, ["..", "secret.txt"])).toBeNull();
  });

  it("maps common static content types", () => {
    expect(previewContentType("index.html")).toBe("text/html; charset=utf-8");
    expect(previewContentType("styles.css")).toBe("text/css; charset=utf-8");
  });

  it("rewrites exported relative links to preview API paths", () => {
    const html = [
      '<a href="../../index.html">Home</a>',
      '<a href="../index.html">Blog</a>',
      '<a href="page/2/index.html">Page 2</a>',
      '<a href="/tag/news/">News</a>',
      '<img src="../../assets/photo.png">',
      '<a href="https://example.com">External</a>',
      '<img src="//cdn.example.com/photo.png">',
    ].join("");

    expect(
      rewritePreviewHtmlLinks({
        html,
        currentSegments: ["blog", "hello"],
        directoryRequest: true,
        previewRootPath: "/api/exports/export-1/preview",
      }),
    ).toBe(
      [
        '<a href="/api/exports/export-1/preview/">Home</a>',
        '<a href="/api/exports/export-1/preview/blog/">Blog</a>',
        '<a href="/api/exports/export-1/preview/blog/hello/page/2/">Page 2</a>',
        '<a href="/api/exports/export-1/preview/tag/news/">News</a>',
        '<img src="/api/exports/export-1/preview/assets/photo.png">',
        '<a href="https://example.com">External</a>',
        '<img src="//cdn.example.com/photo.png">',
      ].join(""),
    );
  });
});
