import { describe, expect, it } from "vitest";
import path from "node:path";
import { convertDocxToPostDraft } from "../../src/lib/docx/converter";

describe("convertDocxToPostDraft", () => {
  it("extracts title slug description and HTML", async () => {
    const result = await convertDocxToPostDraft({
      filePath: path.join(process.cwd(), "tests/fixtures/docx/basic.docx"),
      originalFilename: "basic.docx",
      assetOutputDir: path.join(process.cwd(), ".tmp/test-assets/basic"),
    });

    expect(result.title).toBe("Basic Test Post");
    expect(result.slug).toBe("basic-test-post");
    expect(result.metaDescription.length).toBeGreaterThan(10);
    expect(result.html).toContain("<h1");
    expect(result.html).toContain("<p");
  });

  it("preserves manual page breaks as pagination markers", async () => {
    const result = await convertDocxToPostDraft({
      filePath: path.join(process.cwd(), "tests/fixtures/docx/page-break.docx"),
      originalFilename: "page-break.docx",
      assetOutputDir: path.join(process.cwd(), ".tmp/test-assets/page-break"),
    });

    expect(result.html).toContain("<!-- wp:pagebreak -->");
  });
});
