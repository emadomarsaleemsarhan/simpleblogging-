import { describe, expect, it } from "vitest";
import { canTransitionPostStatus } from "../../src/lib/posts/status";

describe("canTransitionPostStatus", () => {
  it("allows the MVP review flow", () => {
    expect(canTransitionPostStatus("DRAFT", "IN_REVIEW")).toBe(true);
    expect(canTransitionPostStatus("IN_REVIEW", "APPROVED")).toBe(true);
    expect(canTransitionPostStatus("APPROVED", "PUBLISHED")).toBe(true);
    expect(canTransitionPostStatus("PUBLISHED", "ARCHIVED")).toBe(true);
  });

  it("prevents publishing directly from draft", () => {
    expect(canTransitionPostStatus("DRAFT", "PUBLISHED")).toBe(false);
  });
});
