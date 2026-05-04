import { describe, expect, it } from "vitest";
import { createUniqueSlug } from "../../src/lib/posts/import-docx";

describe("createUniqueSlug", () => {
  it("keeps an unused slug unchanged", async () => {
    const slug = await createUniqueSlug("hello-world", async () => false);
    expect(slug).toBe("hello-world");
  });

  it("adds a numeric suffix when the slug exists", async () => {
    const existing = new Set(["hello-world", "hello-world-2"]);
    const slug = await createUniqueSlug("hello-world", async (candidate) => existing.has(candidate));
    expect(slug).toBe("hello-world-3");
  });
});
