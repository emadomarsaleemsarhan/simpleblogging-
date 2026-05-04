import { describe, expect, it } from "vitest";
import { normalizeBaseUrl } from "../../src/lib/settings";

describe("normalizeBaseUrl", () => {
  it("trims and preserves valid urls", () => {
    expect(normalizeBaseUrl(" https://example.com/blog ")).toBe("https://example.com/blog/");
  });

  it("rejects invalid urls", () => {
    expect(() => normalizeBaseUrl("not a url")).toThrow("Base URL must be a valid URL.");
  });
});
