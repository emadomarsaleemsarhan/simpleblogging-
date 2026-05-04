import { describe, expect, it } from "vitest";
import { metadata } from "../../src/app/layout";

describe("scaffold", () => {
  it("defines the expected app metadata", () => {
    expect(metadata.title).toBe("Blog Publisher");
    expect(metadata.description).toBe("A lightweight publishing workflow for prepared blog content.");
  });
});
