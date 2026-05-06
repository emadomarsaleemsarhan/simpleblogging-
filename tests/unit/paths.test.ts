import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

const pathsModule = "../../src/lib/paths";

describe("storage paths", () => {
  afterEach(() => {
    delete process.env.BLOG_PUBLISHER_STORAGE_ROOT;
    vi.resetModules();
  });

  it("uses BLOG_PUBLISHER_STORAGE_ROOT when provided", async () => {
    const storageRoot = path.join(process.cwd(), ".tmp/render-storage");
    process.env.BLOG_PUBLISHER_STORAGE_ROOT = storageRoot;

    const { getExportZipPath, getUploadPath } = await import(pathsModule);

    expect(getUploadPath("blog-1", "post-1")).toBe(
      path.join(storageRoot, "blogs", "blog-1", "uploads", "post-1.docx"),
    );
    expect(getExportZipPath("blog-1", "export-1")).toBe(
      path.join(storageRoot, "blogs", "blog-1", "exports", "export-1", "website.zip"),
    );
  });
});
