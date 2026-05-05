import { describe, expect, it } from "vitest";
import { directionForLocale, statusLabel, t } from "../../src/lib/i18n/locales";

describe("i18n primitives", () => {
  it("maps locale to direction", () => {
    expect(directionForLocale("ar")).toBe("rtl");
    expect(directionForLocale("en")).toBe("ltr");
  });

  it("returns status labels in both languages", () => {
    expect(statusLabel("DRAFT", "en")).toBe("Draft");
    expect(statusLabel("DRAFT", "ar")).toBe("مسودة");
  });

  it("translates dashboard labels", () => {
    expect(t("nav.posts", "en")).toBe("Posts");
    expect(t("nav.posts", "ar")).toBe("المنشورات");
  });
});
