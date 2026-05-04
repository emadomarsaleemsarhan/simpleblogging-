# Blog Publisher MVP Design

Date: 2026-05-04

## Summary

Blog Publisher MVP is a web platform for converting `.docx` files into reviewable blog posts, managing their metadata and workflow state, generating a static website, and exporting that website as a ZIP file. The first release deliberately focuses on a complete ZIP publishing path. GitHub publishing, advanced approval permissions, and external deployment integrations are deferred.

The MVP will be built as a single Next.js application with Prisma and SQLite. The application owns the admin dashboard, authentication, DOCX conversion, local file storage, static-site generation, and ZIP export.

## Goals

- Let users sign in and manage their own blog, with one default blog created per user.
- Upload `.docx` files and convert them into clean, editable blog posts.
- Preserve common Word content: headings, paragraphs, lists, tables, links, images, and basic formatting.
- Extract the first Heading 1 as the post title when available.
- Suggest a slug and meta description automatically.
- Support categories and multiple tags per post.
- Support post states: Draft, In Review, Approved, Published, Archived.
- Split long posts into multiple static pages using manual page breaks first, then automatic word-count splitting when needed.
- Generate a database-free static website for visitors.
- Export the full static website as a ZIP file.

## Non-Goals for MVP

- GitHub OAuth, repository creation, branch selection, commits, or GitHub Pages publishing.
- Fine-grained reviewer assignments, audit logs, or complex team permissions.
- Theme marketplace or advanced custom templates.
- External object storage, CDN publishing, analytics, or scheduled publishing.

The data model will reserve publish settings fields that can support GitHub publishing later, but those fields will not be active in the MVP UI.

## Architecture

The MVP uses a monolithic Next.js App Router application.

Main parts:

- Admin UI: login, sidebar navigation, post table, upload flow, editor, preview, taxonomy screens, export screen, settings.
- Server actions/API routes: authenticated mutations for uploads, post updates, status changes, preview generation, and export.
- Prisma + SQLite: stores users, blogs, posts, categories, tags, assets, and export metadata.
- Local file storage: stores original DOCX files, extracted images, generated static files, and ZIP exports.
- DOCX converter: validates Word uploads, extracts content and assets, sanitizes HTML, and returns conversion warnings.
- Static generator: renders published content into portable HTML files and supporting XML/text files.

Visitors never depend on the database. They consume only the generated static output.

## Data Model

Core records:

- User: account identity and default blog ownership.
- Blog: name, slug, base URL, owner, theme settings, publish settings. The MVP creates one default blog per user while keeping the schema compatible with more blogs later.
- BlogMember: connects users to blogs with a simple role such as owner or editor.
- Post: title, slug, meta description, content HTML, status, category, tags, SEO fields, pagination settings, timestamps.
- Category: name and slug scoped to a blog.
- Tag: name and slug scoped to a blog.
- Asset: extracted file path, type, original filename, dimensions when available, and owning post.
- Export: provider, ZIP path, generated file count, last published timestamp, and future GitHub fields.

Post statuses:

- Draft: created from upload or manual edit and not ready for review.
- In Review: ready for owner/editor review.
- Approved: accepted by an owner/editor and eligible to be published.
- Published: included in generated static output after the publish/export action.
- Archived: hidden from generated output.

## DOCX Conversion

The upload flow accepts `.docx` files only. On upload, the server stores the original file, runs conversion, and creates a Draft post.

The converter extracts:

- First Heading 1 as the title when present.
- Fallback title from filename when no Heading 1 exists.
- First meaningful paragraph as meta description.
- Headings, paragraphs, ordered and unordered lists, tables, links, and basic inline formatting.
- Images into a per-blog/per-post assets folder.
- Manual page breaks as pagination markers.

The converter generates:

- Clean sanitized HTML as the internal post content format.
- A suggested slug derived from the title.
- Conversion warnings for recoverable issues.

Recoverable conversion issues should not fail the whole upload. For example, a corrupted image can be skipped and reported while the post remains editable as Draft. Invalid file type, unreadable DOCX, or empty content should fail with a clear error.

## Editing and Preview

The dashboard uses a compact operations-style layout with sidebar navigation. The post list is table-first and optimized for repeated publishing work.

Main screens:

- Posts: list, filters by status/category, search, upload action.
- Upload Word: accepts `.docx`, shows conversion progress and warnings.
- Post editor: title, slug, meta description, category, tags, status, SEO fields, and sanitized HTML content editing.
- Preview: renders the post using the static template before export.
- Categories and Tags: manage taxonomy per blog.
- Export: generate website, download ZIP, view last export metadata.
- Settings: blog name, base URL, simple theme settings, publish settings.

## Long Post Pagination

Pagination order:

1. Manual Word page breaks create explicit pages.
2. If no manual page breaks are present and the content exceeds the configured word threshold, automatic splitting creates pages at safe block boundaries.

Generated URLs:

- `/blog/post-slug/`
- `/blog/post-slug/page/2/`
- `/blog/post-slug/page/3/`

Each paginated post includes:

- Previous and next buttons.
- Page number navigation.
- Reading progress bar.
- Table of contents based on headings.
- SEO `next` and `prev` links where appropriate.

## Static Website Generation

Export generates a complete static website folder and then compresses it as a ZIP.

Generated files include:

- `index.html`
- Blog listing pages.
- Individual post pages.
- Paginated post pages.
- Category pages.
- Tag pages.
- Author pages in a simple MVP form.
- Assets.
- `sitemap.xml`
- `rss.xml`
- `robots.txt`

Only Published posts are included in public listing pages and feeds. Archived posts are excluded. Draft, In Review, and Approved posts can be previewed in the admin but are not included in exported public output unless explicitly published.

## SEO

Each generated post page includes:

- Meta title.
- Meta description.
- Canonical URL.
- Open Graph title, description, and image when available.
- Structured data for blog posts.
- `next` and `prev` links for paginated articles.

Category, tag, and listing pages also receive basic titles, descriptions, canonical URLs, and sitemap entries.

## ZIP Export

When the user clicks Export Website:

1. The app validates blog settings and base URL.
2. The static generator renders the full website to an export folder.
3. Assets are copied into the output.
4. Sitemap, RSS, and robots files are generated.
5. The output folder is compressed into a ZIP.
6. An Export record is saved with provider `zip`, ZIP path, timestamp, and generated file metadata.
7. The user can download the ZIP from the Export screen.

The ZIP must contain the complete website and work on any static host without a database.

## Error Handling

Upload failures:

- Reject non-`.docx` files.
- Show clear errors for unreadable files.
- Show clear errors for empty or unsupported documents.

Conversion warnings:

- Preserve the draft when partial conversion succeeds.
- Show warnings for skipped images, unsupported formatting, missing Heading 1, or fallback metadata.

Export failures:

- Stop the export if required blog settings are missing.
- Report the failing generation step.
- Keep the previous successful export available until a new export succeeds.

## Testing

Focused automated tests should cover:

- DOCX validation.
- Title, slug, and meta description extraction.
- HTML sanitization.
- Image asset extraction path behavior.
- Manual page break pagination.
- Automatic word-count pagination.
- Static URL generation for paginated posts.
- Category and tag page generation.
- Sitemap, RSS, and robots generation.
- ZIP contents and folder structure.

End-to-end coverage should verify:

- Login.
- Upload `.docx`.
- Edit post metadata.
- Preview post.
- Move through review statuses.
- Publish/export.
- Download ZIP.

## Future Phase: GitHub Publishing

After ZIP export works, GitHub publishing can be added using the reserved publish settings:

- `provider`
- `githubRepo`
- `githubBranch`
- `publishDirectory`
- `lastPublishedAt`
- `lastCommitHash`

The future flow will let the user link GitHub, select or create a repository, select branch and directory, generate the same static output, commit files, push to GitHub, and show repository and GitHub Pages links when available.
