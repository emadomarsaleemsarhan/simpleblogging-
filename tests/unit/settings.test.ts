import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BlogSettingsForm } from "../../src/components/dashboard/blog-settings-form";
import { normalizeBaseUrl } from "../../src/lib/settings";

describe("normalizeBaseUrl", () => {
  it("trims and preserves valid urls", () => {
    expect(normalizeBaseUrl(" https://example.com/blog ")).toBe("https://example.com/blog/");
  });

  it("rejects invalid urls", () => {
    expect(() => normalizeBaseUrl("not a url")).toThrow("Base URL must be a valid URL.");
  });
});

describe("BlogSettingsForm", () => {
  it("preserves theme settings while visible controls are pending", () => {
    const html = renderToStaticMarkup(
      createElement(BlogSettingsForm, {
        action: async () => {},
        blog: {
          name: "Publisher",
          slug: "publisher",
          baseUrl: "https://example.com/",
          locale: "en",
          templateKey: "editorial",
          themePrimaryColor: "#123456",
          themeSecondaryColor: "#abcdef",
          themeBackgroundColor: "#fefefe",
          themeHeadingStyle: "modern",
        },
        labels: {
          blogName: "Blog name",
          slug: "Slug",
          baseUrl: "Base URL",
          siteLanguage: "Site language",
          template: "Template",
          futureProviders: "Future providers",
          githubRepository: "GitHub repository",
          githubReserved: "Reserved",
          templateHelp: "Choose a template.",
          save: "Save",
        },
        templates: [{ key: "editorial", name: "Editorial" }],
      }),
    );

    expect(html).toContain('type="hidden" name="themePrimaryColor" value="#123456"');
    expect(html).toContain('type="hidden" name="themeSecondaryColor" value="#abcdef"');
    expect(html).toContain('type="hidden" name="themeBackgroundColor" value="#fefefe"');
    expect(html).toContain('type="hidden" name="themeHeadingStyle" value="modern"');
  });
});
