# Arabic Template and Static Preview Design

Date: 2026-05-05

## Summary

This design upgrades the Blog Publisher MVP with four required capabilities:

- Root-relative links inside generated static HTML.
- Preview of the last exported static website inside the admin dashboard.
- Arabic and right-to-left layout as the default for both admin and published site.
- A real template system with one polished default Arabic template.

The change builds on the current Next.js MVP and keeps ZIP export as the primary publishing path.

## Goals

- Generate published HTML that uses root-relative links such as `/blog/post-slug/` instead of embedding the domain.
- Keep absolute URLs only where they are required or expected for SEO documents and metadata.
- Let admins preview the last successful exported site from the dashboard.
- Translate the admin interface into Arabic and set the dashboard to `lang="ar"` and `dir="rtl"`.
- Render the published static website with Arabic RTL layout.
- Introduce a template registry so future templates can be added without rewriting the generator.
- Ship one initial template named `arabic-default`.

## Non-Goals

- Multiple selectable templates in this phase.
- Bilingual admin language switching.
- Theme marketplace or user-editable template code.
- Replacing ZIP export or adding GitHub publishing.

## Root-Relative URL Rules

Generated HTML pages must use root-relative paths for internal visitor navigation:

- `/`
- `/blog/`
- `/blog/post-slug/`
- `/blog/post-slug/page/2/`
- `/category/category-slug/`
- `/tag/tag-slug/`
- `/assets/...`

Generated HTML must not use the configured domain for internal links.

The configured `baseUrl` remains valid for:

- `sitemap.xml`
- `rss.xml`
- canonical links
- Open Graph URL fields
- structured data URL fields when needed

This keeps the exported site portable across hosts while preserving SEO metadata that expects absolute URLs.

## Template System

The static generator will stop owning page markup directly. It will call a template selected from a small registry.

Initial structure:

- `src/lib/static/templates/registry.ts`
- `src/lib/static/templates/types.ts`
- `src/lib/static/templates/arabic-default/template.ts`
- `src/lib/static/templates/arabic-default/styles.ts`

The template contract renders:

- Home page.
- Blog index page.
- Post page.
- Paginated post page controls.
- Category page.
- Tag page.
- Shared HTML shell.
- Navigation.
- Article table of contents.
- Reading progress markup.

The generator remains responsible for:

- Selecting the template.
- Writing files.
- Copying or embedding template CSS.
- Generating RSS, sitemap, robots, and ZIP.
- Returning generated file metadata.

The initial registry will always select `arabic-default`, but the boundary must make adding a second template straightforward later.

## Arabic Default Template

The `arabic-default` template renders HTML with:

- `<html lang="ar" dir="rtl">`
- Arabic navigation labels.
- Arabic page headings for home, posts, categories, tags, and pagination.
- RTL typography and spacing.
- A readable article layout.
- Root-relative internal navigation.
- Table of contents from article headings.
- Reading progress markup.
- Previous and next pagination links for long posts.

The template should work for every currently generated public page:

- `index.html`
- `/blog/`
- `/blog/post-slug/`
- `/blog/post-slug/page/2/`
- `/category/category-slug/`
- `/tag/tag-slug/`

## Admin Arabic and RTL

The admin dashboard becomes Arabic-first.

Required translated areas:

- Sidebar navigation.
- Login page.
- Posts list.
- Upload page.
- Post editor labels and buttons.
- Preview page heading.
- Taxonomy page.
- Export page.
- Settings page.
- Common status labels.
- Common error and empty-state messages.

The admin root layout should use Arabic directionality:

- `lang="ar"`
- `dir="rtl"`

Post status values may remain enum values internally, but UI labels should display Arabic equivalents:

- `DRAFT`: Arabic label meaning draft.
- `IN_REVIEW`: Arabic label meaning in review.
- `APPROVED`: Arabic label meaning approved.
- `PUBLISHED`: Arabic label meaning published.
- `ARCHIVED`: Arabic label meaning archived.

Implementation should store these labels in a translation map so tests can assert the exact Arabic strings without coupling UI code to enum names.

## Static Site Preview in Admin

The Export page will show the latest successful ZIP/static export. If one exists, it shows:

- Export status.
- Updated time.
- Download ZIP link.
- Preview Website action.

Preview uses an admin route that serves generated files from the last successful export folder:

- `/dashboard/export/preview/`
- `/dashboard/export/preview/blog/post-slug/`
- `/dashboard/export/preview/category/category-slug/`

The preview page embeds the route in an iframe. The serving route must:

- Require an authenticated session.
- Resolve the current user's default blog.
- Find the latest completed ZIP export for that blog.
- Serve files only from that export's generated static site directory.
- Prevent path traversal.
- Default directory paths to `index.html`.
- Return 404 for missing files.

The preview route must not expose local filesystem paths.

## Data Model Impact

No major schema change is required.

The existing `Export.resultUrl` currently points to the ZIP path. To support preview cleanly, export metadata should also preserve the static output directory. This can be stored in `Export.payload` JSON for now:

```json
{
  "files": 42,
  "siteDir": "storage/blogs/.../exports/.../site"
}
```

Future schema cleanup can split this into typed columns if export providers grow.

## Error Handling

- If no completed export exists, the admin preview shows an Arabic empty state.
- If preview file resolution fails, return 404 without leaking local paths.
- If the iframe cannot load a file, the admin page still keeps the ZIP download available.
- Export failure handling remains unchanged: keep the previous successful export available.

## Testing

Unit tests should verify:

- Internal links in rendered HTML are root-relative.
- Generated page shell contains `lang="ar"` and `dir="rtl"`.
- Arabic status label mapping.
- Template registry returns `arabic-default`.
- Preview path resolver prevents path traversal.

Integration or E2E tests should verify:

- Login page and dashboard show Arabic labels.
- Export creates a ZIP and a previewable static site.
- Export page shows a preview action after successful export.
- Preview route serves the generated `index.html`.

## Acceptance Criteria

- Admin UI is Arabic and RTL by default.
- Published static HTML is Arabic and RTL by default.
- Generated internal links do not include the domain.
- SEO artifacts still use `baseUrl` where appropriate.
- Export page can preview the last generated site inside the admin.
- ZIP export still works.
- Existing MVP publishing flow still passes.
