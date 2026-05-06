# Editorial Studio Redesign Design

Date: 2026-05-06
Status: Approved visual direction, pending implementation plan
Approved concept: `C:\Users\me\.codex\generated_images\019df227-c678-72b3-a162-d30b821d7f3f`

## Goal

Redesign the Blog Publisher admin interface into a refined editorial studio: warm, professional, bilingual, and built for repeated publishing work. The redesign should make the platform feel like an editor's command room for converting `.docx` files into reviewed posts and static websites.

The redesign covers the existing admin and auth surfaces, not the generated static-site templates.

## Visual Direction

The chosen direction is **Editorial Studio**.

The interface should feel:
- Refined and editorial, not generic SaaS.
- Warm and focused, using paper-like backgrounds and deep ink colors.
- Professional enough for daily publishing workflows.
- Bilingual by design, with Arabic and English labels fitting naturally.
- Dense but organized, with clear tables, forms, and publishing actions.

Avoid:
- Purple/blue gradient SaaS styling.
- Marketing-page hero layouts inside the admin.
- Decorative card grids that reduce operational clarity.
- Oversized rounded UI or nested cards.
- Generic browser-default form/table styling.

## Design System

### Palette

Use a restrained publishing palette:
- `paper`: warm editorial page background.
- `ink`: primary text and deep navigation surfaces.
- `forest`: primary action and active navigation.
- `amber`: secondary emphasis for export/review moments.
- `clay/rose`: destructive or archived state accents.
- `mist`: subtle panels, rows, and empty states.
- `line`: low-contrast borders.

The UI should not read as beige-only. Forest, ink, amber, and muted blue-gray accents should break up the warm base.

### Typography

Use a distinctive editorial display font for major headings and product identity where practical, paired with a readable UI font for controls and table data.

Implementation may use CSS font stacks first to avoid adding external network dependencies:
- Display: Georgia-style serif stack.
- UI: Segoe UI / Tahoma style stack with Arabic support.

Headings must remain readable in Arabic and English, with no viewport-width font scaling.

### Layout

Use an app shell:
- Fixed-width editorial sidebar on desktop.
- Responsive top navigation or collapsed sidebar on smaller screens.
- Main content with a constrained readable width for forms and wider content lanes for tables/previews.
- Header row with page title, contextual summary, language switcher, and account identity.

The admin must remain an app, not a landing page.

## Core Screens

### Login

The login page should become a quiet editorial entry screen:
- Brand mark/title.
- Short bilingual-friendly explanation.
- Language switcher.
- Compact sign-in form.
- Warm paper background with subtle publishing texture.

### Posts

The posts page should become the primary publishing desk:
- Strong page title and description.
- Primary upload action.
- Table with refined row spacing, status chips, category, slug, and updated date.
- Empty state styled as a workflow prompt.
- Status colors that clearly distinguish Draft, In Review, Approved, Published, and Archived.

### Upload

The upload page should emphasize the Word-to-post workflow:
- Clear upload form.
- DOCX constraint text if already present or needed.
- Stable drop/upload treatment if implementation scope allows without changing backend behavior.

### Post Editor

The editor should feel like reviewing a manuscript:
- Form fields grouped into metadata and content sections.
- Status select visually emphasized.
- HTML textarea remains usable, with monospace/editor styling.
- Save action clear and stable.

### Export

The export page should make completion obvious:
- Primary `Export Website` action.
- Success state with direct `Preview Website` and `Download ZIP` links.
- Recent exports table.
- Preview link visually paired with ZIP link.

### Settings

The settings page should support the platform identity:
- Blog name, slug, base URL.
- Published-site language selector.
- Published-site template selector.
- Reserved GitHub settings remain visually secondary.

### Preview

The exported-site preview page should feel integrated:
- Header with export context.
- Large iframe with professional framing.
- Clear route back to Export.

## Components

Create or refine reusable component styles for:
- App shell and sidebar navigation.
- Page headers.
- Buttons: primary, secondary/link-like, danger if needed.
- Tables and table rows.
- Status chips.
- Forms, labels, inputs, selects, textareas.
- Language switcher.
- Export success/status feedback.
- Preview frame.

Use existing React component boundaries where possible. Add small reusable components only where they reduce duplication or clarify repeated UI patterns.

## Bilingual Behavior

The redesign must preserve current Arabic/English behavior:
- `html lang` and `dir` continue to update from admin locale.
- Layout must not break in RTL.
- Sidebar, tables, forms, and action rows must look intentional in both directions.
- Arabic labels must not overflow buttons or table cells.

## Technical Constraints

Current stack:
- Next.js App Router.
- React Server Components with client components for actions.
- CSS currently centralized in `src/app/globals.css`.
- Prisma/SQLite backend remains unchanged for redesign.

The implementation should avoid introducing a heavy design framework unless the codebase already needs it. CSS modules or structured global CSS sections are acceptable if they keep the MVP simple.

## Verification

Before completion:
- Run unit tests, lint, build, and E2E.
- Verify the admin in browser at desktop width.
- Verify a mobile-sized viewport.
- Verify both English and Arabic admin modes.
- Capture an implementation screenshot and compare it to the approved concept.
- Check at least five fidelity points: palette, sidebar shape, table density, button treatment, bilingual layout, export feedback, and form readability.

## Out Of Scope

This redesign does not add new product features such as GitHub publishing, new analytics, rich WYSIWYG editing, or additional static-site templates.

Generated static-site templates are not redesigned in this pass, except where the admin preview frame displays them.
