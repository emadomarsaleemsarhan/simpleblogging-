import { describe, expect, it } from "vitest";

import { sanitizePostHtml } from "../../src/lib/html";

describe("sanitizePostHtml", () => {
  it("removes active script content and event handlers from saved post HTML", () => {
    const html = sanitizePostHtml('<p>Hello</p><img src="x" onerror="alert(1)"><script>alert(2)</script>');

    expect(html).toContain("<p>Hello</p>");
    expect(html).toContain('<img src="x" />');
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("<script");
  });
});
