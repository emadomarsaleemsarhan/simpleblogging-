# Publisher OS Redesign Design

Date: 2026-05-13
Status: Approved visual direction, awaiting implementation plan approval

## Goal

Redesign Blog Publisher as a polished publishing platform, not an admin-only utility. The approved direction is **Publisher OS**: a strong SaaS product surface for the management app, paired with an editorial Arabic-first static site template inspired by the content density and navigation spirit of `taelum.org`.

The redesign covers the public platform pages, login, dashboard, and the default exported static website template.

## Design Direction

The interface should feel like a professional publishing operating system:

- Dark, confident product surfaces for platform framing and navigation.
- Warm editorial reading surfaces for content, using paper, ink, forest green, and amber accents.
- Arabic and English support across the same layout system, with RTL and LTR handled cleanly.
- Content-first hierarchy: posts, categories, tags, export status, and template choices should be easy to scan.
- No landing-page fluff. The first screen should communicate what the platform does and immediately lead to login, preview, and publishing workflows.

## Scope

### Public Platform

Replace the current root redirect-only behavior with a public platform page when the visitor is not signed in. Signed-in users can still be routed toward the dashboard.

The public page should include:

- Product navigation with Arabic/English language switching.
- A hero explaining the platform: DOCX to static site, review workflow, export ZIP/GitHub-ready publishing.
- A product preview panel showing the publishing flow.
- Feature bands for DOCX conversion, review states, templates, static export, SEO, and multilingual publishing.
- Clear calls to action for login and previewing the default published-site style.

### Login

Restyle login as part of the same Publisher OS system:

- Split or asymmetric composition with platform context and login form.
- Keep the form simple and accessible.
- Preserve current authentication behavior and error handling.

### Dashboard

Rebuild the dashboard visual shell without changing the core data model:

- Sidebar becomes a dark Publisher OS navigation rail with clearer sections.
- Main area uses warm editorial surfaces, dense but readable cards/tables, and better page headers.
- Add dashboard-level product framing: blog identity, current user, language switcher, and key publishing actions.
- Posts, upload, taxonomy, export, settings, edit, and preview pages should share consistent spacing, forms, tables, buttons, and status chips.
- Improve template selection visibility in settings so it is obvious that the exported site has a selectable/default template.

### Default Static Template

Make the exported default template match the new platform identity while remaining a true static website:

- Editorial masthead inspired by `taelum.org`, with clear home/posts navigation.
- Article listing pages should feel like a content publication, not admin output.
- Article pages should support long reading: readable width, table styling, images, pagination, next/prev links, table of contents/progress where already supported by generated content.
- Keep portable relative URLs using `/` paths independent of domain.
- Preserve SEO output: title, description, canonical, Open Graph, structured data, next/prev.

## Components And Styling

Use the existing Next.js app and CSS-first architecture. Do not add a component library unless required.

Core style tokens:

- Deep product background: near-black green.
- Editorial surface: warm off-white paper.
- Primary accent: forest green.
- Secondary accent: amber.
- Utility colors: muted blue-gray, restrained rose for destructive/error states.
- Radius stays modest at 6-8px.

Reusable surfaces:

- Product shell
- Editorial panel
- Metric/stat cards
- Toolbar/action row
- Status chips
- Data table
- Form sections
- Static site masthead
- Article card/list items

Typography should remain robust with available web-safe fonts unless a safe font loading strategy is added. Avoid generic AI-gradient styling and keep the design grounded in publishing.

## Data Flow

No schema changes are required for the redesign.

Existing flows remain:

- Auth via the current session helpers.
- Locale from existing i18n helpers and locale switcher.
- Dashboard pages continue reading from Prisma as they do now.
- Static export continues using `src/lib/static/templates.ts`.
- ZIP/export routes remain unchanged except for generated HTML/CSS output.

## Accessibility

- Maintain semantic headings, nav landmarks, buttons, labels, and form errors.
- Preserve keyboard usability for forms and links.
- Keep contrast high on dark and paper surfaces.
- Ensure RTL/LTR layout does not visually overlap on mobile.
- Avoid text inside controls overflowing at narrow widths.

## Testing And Verification

After implementation:

- Run unit tests.
- Run Next build.
- Run relevant Playwright tests or add/update visual flow tests for public page, dashboard, localization, and export preview.
- Manually verify in browser at desktop and mobile widths:
  - public platform page,
  - login,
  - posts dashboard,
  - upload,
  - settings template selector,
  - export page and exported-site preview.
- Export a ZIP and inspect links in generated pages.

## Out Of Scope

- Native iOS redesign.
- New publishing provider functionality.
- New database fields.
- Replacing the current auth system.
- Full brand identity work beyond the approved Publisher OS direction.
