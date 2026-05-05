import { describe, expect, it } from "vitest";
import { directionForLocale, parseLocale, statusLabel, t } from "../../src/lib/i18n/locales";

describe("i18n primitives", () => {
  it("maps locale to direction", () => {
    expect(directionForLocale("ar")).toBe("rtl");
    expect(directionForLocale("en")).toBe("ltr");
  });

  it("returns status labels in both languages", () => {
    expect(statusLabel("DRAFT", "en")).toBe("Draft");
    expect(statusLabel("DRAFT", "ar")).toBe("\u0645\u0633\u0648\u062f\u0629");
  });

  it("translates dashboard labels", () => {
    expect(t("nav.posts", "en")).toBe("Posts");
    expect(t("nav.posts", "ar")).toBe("\u0627\u0644\u0645\u0646\u0634\u0648\u0631\u0627\u062a");
  });

  it("parses supported locales and falls back to English", () => {
    expect(parseLocale("ar")).toBe("ar");
    expect(parseLocale("en")).toBe("en");
    expect(parseLocale("fr")).toBe("en");
    expect(parseLocale(undefined)).toBe("en");
  });
});
