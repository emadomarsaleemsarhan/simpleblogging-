# Bilingual Template and Static Preview Design

Date: 2026-05-05

## Summary

This design upgrades the Blog Publisher MVP with four required capabilities:

- Root-relative links inside generated static HTML.
- Preview of the last exported static website inside the admin dashboard.
- Arabic and English support for both admin and published site.
- A real template system with polished Arabic and English rendering modes.

The change builds on the current Next.js MVP and keeps ZIP export as the primary publishing path.

## Goals

- Generate published HTML that uses root-relative links such as `/blog/post-slug/` instead of embedding the domain.
- Keep absolute URLs only where they are required or expected for SEO documents and metadata.
- Let admins preview the last successful exported site from the dashboard.
- Let each user/session switch the admin interface between Arabic and English.
- Let each blog choose its published-site language and direction independently.
- Render the published static website in Arabic RTL or English LTR based on blog settings.
- Introduce a template registry so future templates can be added without rewriting the generator.
- Ship one initial template named `arabic-default`.

## Non-Goals

- Multiple selectable templates in this phase.
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

## Bilingual Default Template

The initial default template supports two language modes:

- Arabic mode renders `<html lang="ar" dir="rtl">`.
- English mode renders `<html lang="en" dir="ltr">`.
- Navigation labels and page headings follow the selected blog language.
- Typography and spacing adapt to direction.
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

## Admin Localization

The admin dashboard becomes bilingual. The user's selected admin language controls dashboard labels and direction. The blog's published language controls generated static output.

Required localized admin areas:

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

The admin layout should set language and direction from the active admin locale:

- Arabic: `lang="ar"` and `dir="rtl"`
- English: `lang="en"` and `dir="ltr"`

The MVP can store the admin locale in a cookie or session-level preference. It does not need a full user profile settings table unless implementation already makes that cheaper.

Blog settings should include a published-site language field:

- Arabic published site: `ar` / `rtl`
- English published site: `en` / `ltr`

Post status values may remain enum values internally, but UI labels should display Arabic equivalents:

- `DRAFT`: Arabic label meaning draft.
- `IN_REVIEW`: Arabic label meaning in review.
- `APPROVED`: Arabic label meaning approved.
- `PUBLISHED`: Arabic label meaning published.
- `ARCHIVED`: Arabic label meaning archived.

Implementation should store these labels in a translation map so tests can assert the exact Arabic strings without coupling UI code to enum names.

The same translation map should also include English labels for all statuses and dashboard text.

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

- If no completed export exists, the admin preview shows an empty state in the active admin language.
- If preview file resolution fails, return 404 without leaking local paths.
- If the iframe cannot load a file, the admin page still keeps the ZIP download available.
- Export failure handling remains unchanged: keep the previous successful export available.

## Testing

Unit tests should verify:

- Internal links in rendered HTML are root-relative.
- Generated page shell contains the blog language and direction.
- Arabic and English status label mapping.
- Template registry returns `arabic-default`.
- Preview path resolver prevents path traversal.

Integration or E2E tests should verify:

- Login page and dashboard can show Arabic and English labels.
- Export creates a ZIP and a previewable static site.
- Export page shows a preview action after successful export.
- Preview route serves the generated `index.html`.

## Acceptance Criteria

- Admin UI supports Arabic RTL and English LTR.
- Published static HTML supports Arabic RTL and English LTR per blog.
- Generated internal links do not include the domain.
- SEO artifacts still use `baseUrl` where appropriate.
- Export page can preview the last generated site inside the admin.
- ZIP export still works.
- Existing MVP publishing flow still passes.
