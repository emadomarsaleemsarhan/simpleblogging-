import { describe, expect, it } from "vitest";
import { createSlug } from "../../src/lib/slug";

describe("createSlug", () => {
  it("creates readable ASCII slugs", () => {
    expect(createSlug("Hello From Word!")).toBe("hello-from-word");
  });

  it("falls back when the title has no slug characters", () => {
    expect(createSlug("!!!", "uploaded-file")).toBe("uploaded-file");
  });
});
