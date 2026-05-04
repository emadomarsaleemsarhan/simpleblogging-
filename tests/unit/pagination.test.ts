import { describe, expect, it } from "vitest";
import { paginateHtml } from "../../src/lib/posts/pagination";

describe("paginateHtml", () => {
  it("splits on manual page break markers first", () => {
    const pages = paginateHtml("<p>One</p><!-- wp:pagebreak --><p>Two</p>", 100);
    expect(pages).toEqual(["<p>One</p>", "<p>Two</p>"]);
  });

  it("keeps short posts as one page", () => {
    const pages = paginateHtml("<p>Short post</p>", 100);
    expect(pages).toHaveLength(1);
  });

  it("splits long posts at block boundaries", () => {
    const pages = paginateHtml("<p>one two three</p><p>four five six</p>", 4);
    expect(pages).toEqual(["<p>one two three</p>", "<p>four five six</p>"]);
  });
});
