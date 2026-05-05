import { describe, expect, it } from "vitest";
import path from "node:path";
import { previewContentType, resolvePreviewFile } from "../../src/lib/static/preview";

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
});
