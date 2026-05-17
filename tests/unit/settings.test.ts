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
  it("renders template cards and visible theme controls", () => {
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
          templatesSection: "Templates",
          futureProviders: "Future providers",
          githubRepository: "GitHub repository",
          githubReserved: "Reserved",
          templateHelp: "Choose a template.",
          themePrimaryColor: "Primary color",
          themeSecondaryColor: "Accent color",
          themeBackgroundColor: "Background color",
          headingStyle: "Heading style",
          headingClassic: "Classic",
          headingModern: "Modern",
          headingBold: "Bold",
          previewSavedTemplate: "Preview saved template",
          save: "Save",
        },
        templates: [
          { key: "editorial", name: "Editorial", description: "Editorial template." },
          { key: "minimal", name: "Minimal", description: "Minimal template." },
          { key: "magazine", name: "Magazine", description: "Magazine template." },
        ],
      }),
    );

    expect(html).toContain("<h2 id=\"template-settings-title\">Templates</h2>");
    expect(html).toContain("<strong>Editorial</strong>");
    expect(html).toContain("<strong>Minimal</strong>");
    expect(html).toContain("<strong>Magazine</strong>");
    expect(html).toContain('type="radio" name="templateKey" checked="" value="editorial"');
    expect(html).toContain("<span>Primary color</span>");
    expect(html).toContain('type="color" name="themePrimaryColor" value="#123456"');
    expect(html).toContain("<span>Accent color</span>");
    expect(html).toContain('type="color" name="themeSecondaryColor" value="#abcdef"');
    expect(html).toContain("<span>Background color</span>");
    expect(html).toContain('type="color" name="themeBackgroundColor" value="#fefefe"');
    expect(html).toContain("<span>Heading style</span>");
    expect(html).toContain('<select name="themeHeadingStyle">');
    expect(html).toContain('<option value="modern" selected="">Modern</option>');
    expect(html).not.toContain('type="hidden" name="themePrimaryColor"');
    expect(html).not.toContain('type="hidden" name="themeSecondaryColor"');
    expect(html).not.toContain('type="hidden" name="themeBackgroundColor"');
    expect(html).not.toContain('type="hidden" name="themeHeadingStyle"');
  });
});
