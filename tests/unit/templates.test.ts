import { describe, expect, it } from "vitest";
import {
  defaultStaticTheme,
  getStaticTemplate,
  normalizeStaticTheme,
  parseHeadingStyle,
  parseTemplateKey,
  parseThemeColor,
  staticTemplateOptions,
} from "../../src/lib/static/templates";

describe("static templates", () => {
  it("exposes the built-in templates", () => {
    expect(staticTemplateOptions.map((template) => template.key)).toEqual(["editorial", "minimal", "magazine"]);
  });

  it("falls back to editorial for unknown template keys", () => {
    expect(parseTemplateKey("unknown")).toBe("editorial");
    expect(getStaticTemplate("unknown").key).toBe("editorial");
  });

  it("validates hex theme colors", () => {
    expect(parseThemeColor("#abc", "#000000")).toBe("#abc");
    expect(parseThemeColor("#aabbcc", "#000000")).toBe("#aabbcc");
    expect(parseThemeColor("red", "#000000")).toBe("#000000");
    expect(parseThemeColor("url(javascript:alert(1))", "#000000")).toBe("#000000");
  });

  it("validates heading styles", () => {
    expect(parseHeadingStyle("classic")).toBe("classic");
    expect(parseHeadingStyle("modern")).toBe("modern");
    expect(parseHeadingStyle("bold")).toBe("bold");
    expect(parseHeadingStyle("script")).toBe("classic");
  });

  it("normalizes missing theme fields", () => {
    expect(normalizeStaticTheme({})).toEqual(defaultStaticTheme);
  });
});
