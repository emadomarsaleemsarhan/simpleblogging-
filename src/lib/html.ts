import sanitizeHtml from "sanitize-html";

const pageBreakToken = "___BLOG_PUBLISHER_PAGE_BREAK___";

export const pageBreakMarker = "<!-- wp:pagebreak -->";

export function sanitizePostHtml(html: string) {
  return sanitizeHtml(html.replaceAll(pageBreakMarker, pageBreakToken), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "img",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title"],
      "*": ["class"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
  })
    .replaceAll(pageBreakToken, pageBreakMarker)
    .trim();
}
