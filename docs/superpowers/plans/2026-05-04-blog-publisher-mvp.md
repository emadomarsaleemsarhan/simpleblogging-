# Blog Publisher MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Blog Publisher MVP: a Next.js web platform that imports `.docx` files, converts them into editable posts, manages publishing workflow, generates a static blog, and exports it as a ZIP.

**Architecture:** Use a single Next.js App Router application. Keep business logic in focused `src/lib/*` modules so DOCX conversion, pagination, static rendering, and ZIP export are testable without the UI.

**Tech Stack:** Next.js, TypeScript, Prisma, SQLite, NextAuth credentials auth, Vitest, Playwright, mammoth, jszip, sanitize-html, slugify, zod.

---

## Scope Check

This MVP includes one complete publishing path: login -> default blog -> upload `.docx` -> edit metadata -> preview -> status workflow -> generate static files -> download ZIP. GitHub publishing remains a reserved data-model capability only.

## Planned File Structure

- `package.json`: project scripts and dependencies.
- `next.config.ts`: Next.js configuration.
- `tsconfig.json`: TypeScript configuration.
- `vitest.config.ts`: unit test configuration.
- `playwright.config.ts`: end-to-end test configuration.
- `.env.example`: required environment variables.
- `prisma/schema.prisma`: SQLite data model.
- `prisma/seed.ts`: local seed user and default blog.
- `src/app/layout.tsx`: global app layout.
- `src/app/page.tsx`: redirect to dashboard or login.
- `src/app/login/page.tsx`: credentials login page.
- `src/app/dashboard/layout.tsx`: authenticated dashboard shell.
- `src/app/dashboard/posts/page.tsx`: post list.
- `src/app/dashboard/posts/upload/page.tsx`: Word upload UI.
- `src/app/dashboard/posts/[postId]/page.tsx`: post editor.
- `src/app/dashboard/posts/[postId]/preview/page.tsx`: admin preview.
- `src/app/dashboard/taxonomy/page.tsx`: categories and tags.
- `src/app/dashboard/export/page.tsx`: ZIP export screen.
- `src/app/api/auth/[...nextauth]/route.ts`: NextAuth route.
- `src/app/api/posts/upload/route.ts`: upload endpoint.
- `src/app/api/exports/route.ts`: export endpoint.
- `src/app/api/exports/[exportId]/download/route.ts`: ZIP download endpoint.
- `src/components/dashboard/*`: dashboard UI components.
- `src/lib/auth.ts`: auth configuration and session helpers.
- `src/lib/db.ts`: Prisma client singleton.
- `src/lib/paths.ts`: storage paths for uploads, assets, exports.
- `src/lib/slug.ts`: slug generation.
- `src/lib/docx/converter.ts`: DOCX-to-sanitized-HTML conversion.
- `src/lib/docx/page-breaks.ts`: manual page break normalization.
- `src/lib/posts/pagination.ts`: long post pagination.
- `src/lib/posts/status.ts`: status transitions.
- `src/lib/static/render.ts`: HTML page rendering.
- `src/lib/static/site-generator.ts`: static site generation.
- `src/lib/static/rss.ts`: RSS generation.
- `src/lib/static/sitemap.ts`: sitemap generation.
- `src/lib/static/zip.ts`: ZIP creation.
- `tests/unit/*.test.ts`: unit tests for core modules.
- `tests/e2e/publishing-flow.spec.ts`: browser flow test.
- `tests/fixtures/docx/*`: small Word fixture documents.

## Task 1: Scaffold the Next.js Project

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `.env.example`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`

- [ ] **Step 1: Create the project files**

Create the files above with TypeScript, App Router, and scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "tsx prisma/seed.ts"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run:

```bash
npm install next react react-dom @prisma/client next-auth bcryptjs mammoth jszip sanitize-html slugify zod date-fns
npm install -D typescript @types/node @types/react @types/react-dom prisma tsx vitest @vitejs/plugin-react @playwright/test @types/bcryptjs @types/sanitize-html eslint eslint-config-next
```

Expected: dependencies install and `package-lock.json` is created.

- [ ] **Step 3: Verify the empty app builds**

Run:

```bash
npm run build
```

Expected: Next.js production build succeeds.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json next.config.ts tsconfig.json vitest.config.ts playwright.config.ts .env.example src/app
git commit -m "chore: scaffold Next.js app"
```

## Task 2: Add Database Schema and Seed Data

**Files:**
- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`
- Create: `src/lib/db.ts`
- Create: `src/lib/posts/status.ts`
- Test: `tests/unit/status.test.ts`

- [ ] **Step 1: Write status transition tests**

```ts
import { describe, expect, it } from "vitest";
import { canTransitionPostStatus } from "../../src/lib/posts/status";

describe("canTransitionPostStatus", () => {
  it("allows the MVP review flow", () => {
    expect(canTransitionPostStatus("DRAFT", "IN_REVIEW")).toBe(true);
    expect(canTransitionPostStatus("IN_REVIEW", "APPROVED")).toBe(true);
    expect(canTransitionPostStatus("APPROVED", "PUBLISHED")).toBe(true);
    expect(canTransitionPostStatus("PUBLISHED", "ARCHIVED")).toBe(true);
  });

  it("prevents publishing directly from draft", () => {
    expect(canTransitionPostStatus("DRAFT", "PUBLISHED")).toBe(false);
  });
});
```

- [ ] **Step 2: Run the failing test**

Run:

```bash
npm test -- tests/unit/status.test.ts
```

Expected: fail because `src/lib/posts/status.ts` does not exist.

- [ ] **Step 3: Implement post statuses**

```ts
export type PostStatus = "DRAFT" | "IN_REVIEW" | "APPROVED" | "PUBLISHED" | "ARCHIVED";

const allowedTransitions: Record<PostStatus, PostStatus[]> = {
  DRAFT: ["IN_REVIEW", "ARCHIVED"],
  IN_REVIEW: ["DRAFT", "APPROVED", "ARCHIVED"],
  APPROVED: ["IN_REVIEW", "PUBLISHED", "ARCHIVED"],
  PUBLISHED: ["ARCHIVED"],
  ARCHIVED: ["DRAFT"]
};

export function canTransitionPostStatus(from: PostStatus, to: PostStatus) {
  return allowedTransitions[from].includes(to);
}
```

- [ ] **Step 4: Add Prisma schema**

Define `User`, `Blog`, `BlogMember`, `Post`, `Category`, `Tag`, `Asset`, `Export`, and enums for post status, role, asset type, and provider. Use SQLite and include unique constraints for `Blog.ownerId`, `Post.blogId + slug`, `Category.blogId + slug`, and `Tag.blogId + slug`.

- [ ] **Step 5: Add seed user**

Seed user:

```ts
{
  email: "admin@example.com",
  name: "Admin",
  password: bcrypt.hashSync("admin12345", 10)
}
```

Create one default blog named `My Blog`.

- [ ] **Step 6: Run migration and seed**

Run:

```bash
npm run prisma:migrate -- --name init
npm run prisma:seed
npm test -- tests/unit/status.test.ts
```

Expected: migration succeeds, seed succeeds, status tests pass.

- [ ] **Step 7: Commit**

```bash
git add prisma src/lib/db.ts src/lib/posts/status.ts tests/unit/status.test.ts
git commit -m "feat: add data model and post workflow"
```

## Task 3: Add Authentication and Dashboard Shell

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/app/login/page.tsx`
- Modify: `src/app/page.tsx`
- Create: `src/app/dashboard/layout.tsx`
- Create: `src/components/dashboard/sidebar.tsx`

- [ ] **Step 1: Configure credentials auth**

Use NextAuth credentials provider with Prisma user lookup and bcrypt password comparison. Session must include `user.id`.

- [ ] **Step 2: Protect dashboard layout**

`src/app/dashboard/layout.tsx` must call the session helper and redirect unauthenticated users to `/login`.

- [ ] **Step 3: Add login page**

Create a server-rendered login form that posts to NextAuth credentials sign-in and shows a concise error state from the query string.

- [ ] **Step 4: Verify manually**

Run:

```bash
npm run dev
```

Expected: `/dashboard/posts` redirects to `/login`; logging in as `admin@example.com` / `admin12345` opens the dashboard shell.

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth.ts src/app/api/auth src/app/login src/app/page.tsx src/app/dashboard src/components/dashboard
git commit -m "feat: add authentication and dashboard shell"
```

## Task 4: Implement Slugs, Paths, and Pagination

**Files:**
- Create: `src/lib/slug.ts`
- Create: `src/lib/paths.ts`
- Create: `src/lib/posts/pagination.ts`
- Test: `tests/unit/slug.test.ts`
- Test: `tests/unit/pagination.test.ts`

- [ ] **Step 1: Write slug tests**

```ts
import { describe, expect, it } from "vitest";
import { createSlug } from "../../src/lib/slug";

describe("createSlug", () => {
  it("creates readable ASCII slugs", () => {
    expect(createSlug("Hello From Word!")).toBe("hello-from-word");
  });

  it("falls back when the title has no slug characters", () => {
    expect(createSlug("!!!", "uploaded-file")).toBe("uploaded-file");
  });
});
```

- [ ] **Step 2: Write pagination tests**

```ts
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
});
```

- [ ] **Step 3: Run failing tests**

Run:

```bash
npm test -- tests/unit/slug.test.ts tests/unit/pagination.test.ts
```

Expected: fail because modules do not exist.

- [ ] **Step 4: Implement modules**

`createSlug(title, fallback?)` should use `slugify` with lower-case strict output. `paginateHtml(html, threshold)` should split on `<!-- wp:pagebreak -->` before applying automatic threshold behavior.

- [ ] **Step 5: Run tests**

Run:

```bash
npm test -- tests/unit/slug.test.ts tests/unit/pagination.test.ts
```

Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/slug.ts src/lib/paths.ts src/lib/posts/pagination.ts tests/unit/slug.test.ts tests/unit/pagination.test.ts
git commit -m "feat: add slug paths and pagination utilities"
```

## Task 5: Implement DOCX Conversion

**Files:**
- Create: `src/lib/docx/converter.ts`
- Create: `src/lib/docx/page-breaks.ts`
- Create: `tests/unit/docx-converter.test.ts`
- Create: `tests/fixtures/docx/basic.docx`
- Create: `tests/fixtures/docx/page-break.docx`

- [ ] **Step 1: Add fixture documents**

Create two small Word fixtures:

- `basic.docx`: Heading 1 title, first paragraph, list, table, link.
- `page-break.docx`: Heading 1, paragraph, manual page break, second paragraph.

- [ ] **Step 2: Write conversion tests**

```ts
import { describe, expect, it } from "vitest";
import path from "node:path";
import { convertDocxToPostDraft } from "../../src/lib/docx/converter";

describe("convertDocxToPostDraft", () => {
  it("extracts title slug description and HTML", async () => {
    const result = await convertDocxToPostDraft({
      filePath: path.join(process.cwd(), "tests/fixtures/docx/basic.docx"),
      originalFilename: "basic.docx",
      assetOutputDir: path.join(process.cwd(), ".tmp/test-assets/basic")
    });

    expect(result.title).toBe("Basic Test Post");
    expect(result.slug).toBe("basic-test-post");
    expect(result.metaDescription.length).toBeGreaterThan(10);
    expect(result.html).toContain("<h1");
    expect(result.html).toContain("<p");
  });
});
```

- [ ] **Step 3: Run failing test**

Run:

```bash
npm test -- tests/unit/docx-converter.test.ts
```

Expected: fail because converter does not exist.

- [ ] **Step 4: Implement converter**

Use `mammoth.convertToHtml`, extract images to `assetOutputDir`, sanitize with `sanitize-html`, derive title from first `<h1>`, derive description from first paragraph, and emit warnings for missing Heading 1.

- [ ] **Step 5: Run tests**

Run:

```bash
npm test -- tests/unit/docx-converter.test.ts
```

Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/docx tests/unit/docx-converter.test.ts tests/fixtures/docx
git commit -m "feat: convert DOCX files into post drafts"
```

## Task 6: Add Upload Endpoint and Post Editor

**Files:**
- Create: `src/app/api/posts/upload/route.ts`
- Create: `src/app/dashboard/posts/page.tsx`
- Create: `src/app/dashboard/posts/upload/page.tsx`
- Create: `src/app/dashboard/posts/[postId]/page.tsx`
- Create: `src/components/dashboard/post-form.tsx`

- [ ] **Step 1: Implement upload endpoint**

Accept `multipart/form-data`, require `.docx`, store the original file under `storage/blogs/{blogId}/uploads/{postId}.docx`, run conversion, create a Draft post, create asset records, and return `{ postId }`.

- [ ] **Step 2: Implement post list**

Show title, slug, category, status, updated date, and actions for edit and preview.

- [ ] **Step 3: Implement upload page**

Add a file input accepting `.docx`, submit to `/api/posts/upload`, show conversion warnings, and redirect to the editor.

- [ ] **Step 4: Implement editor**

Allow editing title, slug, meta description, category, tags, status, SEO title, Open Graph image, and sanitized HTML content.

- [ ] **Step 5: Manual verification**

Run:

```bash
npm run dev
```

Expected: upload fixture DOCX, open editor, save metadata, and see post in list.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/posts/upload src/app/dashboard/posts src/components/dashboard/post-form.tsx
git commit -m "feat: add DOCX upload and post editor"
```

## Task 7: Add Static Site Generation

**Files:**
- Create: `src/lib/static/render.ts`
- Create: `src/lib/static/site-generator.ts`
- Create: `src/lib/static/rss.ts`
- Create: `src/lib/static/sitemap.ts`
- Test: `tests/unit/static-generator.test.ts`

- [ ] **Step 1: Write generator test**

```ts
import { describe, expect, it } from "vitest";
import path from "node:path";
import { generateStaticSite } from "../../src/lib/static/site-generator";

describe("generateStaticSite", () => {
  it("writes core static files", async () => {
    const outputDir = path.join(process.cwd(), ".tmp/static-test");
    const result = await generateStaticSite({
      blog: { name: "My Blog", baseUrl: "https://example.com" },
      posts: [{
        title: "Hello",
        slug: "hello",
        html: "<h1>Hello</h1><p>World</p>",
        metaDescription: "World",
        updatedAt: new Date("2026-05-04T00:00:00Z"),
        tags: [],
        category: null
      }],
      outputDir
    });

    expect(result.files).toContain("index.html");
    expect(result.files).toContain("blog/hello/index.html");
    expect(result.files).toContain("sitemap.xml");
    expect(result.files).toContain("rss.xml");
    expect(result.files).toContain("robots.txt");
  });
});
```

- [ ] **Step 2: Run failing test**

Run:

```bash
npm test -- tests/unit/static-generator.test.ts
```

Expected: fail because generator does not exist.

- [ ] **Step 3: Implement static rendering**

Generate homepage, blog index, post pages, paginated post pages, category pages, tag pages, simple author page, sitemap, RSS, and robots. Include canonical URLs, meta description, Open Graph tags, JSON-LD BlogPosting data, and next/prev links for paginated posts.

- [ ] **Step 4: Run tests**

Run:

```bash
npm test -- tests/unit/static-generator.test.ts
```

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/static tests/unit/static-generator.test.ts
git commit -m "feat: generate static blog website"
```

## Task 8: Add ZIP Export

**Files:**
- Create: `src/lib/static/zip.ts`
- Create: `src/app/api/exports/route.ts`
- Create: `src/app/api/exports/[exportId]/download/route.ts`
- Create: `src/app/dashboard/export/page.tsx`
- Test: `tests/unit/zip-export.test.ts`

- [ ] **Step 1: Write ZIP test**

```ts
import { describe, expect, it } from "vitest";
import path from "node:path";
import JSZip from "jszip";
import { zipDirectory } from "../../src/lib/static/zip";

describe("zipDirectory", () => {
  it("adds nested files to the archive", async () => {
    const archive = await zipDirectory(path.join(process.cwd(), "tests/fixtures/static-site"));
    const zip = await JSZip.loadAsync(archive);
    expect(zip.file("index.html")).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run failing test**

Run:

```bash
npm test -- tests/unit/zip-export.test.ts
```

Expected: fail because ZIP module or fixture does not exist.

- [ ] **Step 3: Implement ZIP module and export API**

`zipDirectory(directory)` returns a `Buffer`. Export API validates blog base URL, generates static output, zips it, saves an Export record with provider `ZIP`, and returns the export id.

- [ ] **Step 4: Implement export UI**

Show last export timestamp, generated file count, error messages, Export Website button, and Download ZIP link.

- [ ] **Step 5: Run tests**

Run:

```bash
npm test -- tests/unit/zip-export.test.ts tests/unit/static-generator.test.ts
```

Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/static/zip.ts src/app/api/exports src/app/dashboard/export tests/unit/zip-export.test.ts tests/fixtures/static-site
git commit -m "feat: export generated website as zip"
```

## Task 9: Add Taxonomy and Settings Screens

**Files:**
- Create: `src/app/dashboard/taxonomy/page.tsx`
- Create: `src/app/dashboard/settings/page.tsx`
- Create: `src/components/dashboard/taxonomy-manager.tsx`
- Create: `src/components/dashboard/blog-settings-form.tsx`

- [ ] **Step 1: Implement taxonomy manager**

Allow creating, renaming, and deleting categories and tags scoped to the current blog. Prevent deleting a category currently used by posts unless the UI first moves those posts to uncategorized.

- [ ] **Step 2: Implement settings form**

Allow editing blog name, slug, base URL, and simple theme fields. Show reserved GitHub publish settings as disabled text under "Future publishing providers" so the MVP scope remains explicit.

- [ ] **Step 3: Manual verification**

Run:

```bash
npm run dev
```

Expected: create category and tag, assign them to a post, export site, and see generated category/tag pages.

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/taxonomy src/app/dashboard/settings src/components/dashboard/taxonomy-manager.tsx src/components/dashboard/blog-settings-form.tsx
git commit -m "feat: manage blog taxonomy and settings"
```

## Task 10: Add End-to-End Publishing Test

**Files:**
- Create: `tests/e2e/publishing-flow.spec.ts`
- Modify: `playwright.config.ts`

- [ ] **Step 1: Write E2E test**

```ts
import { expect, test } from "@playwright/test";

test("publishes a DOCX post and downloads a ZIP", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@example.com");
  await page.getByLabel("Password").fill("admin12345");
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.getByRole("link", { name: "Upload Word" }).click();
  await page.getByLabel("Word file").setInputFiles("tests/fixtures/docx/basic.docx");
  await page.getByRole("button", { name: "Convert Word file" }).click();

  await expect(page.getByLabel("Title")).toHaveValue("Basic Test Post");
  await page.getByLabel("Status").selectOption("IN_REVIEW");
  await page.getByRole("button", { name: "Save post" }).click();
  await page.getByLabel("Status").selectOption("APPROVED");
  await page.getByRole("button", { name: "Save post" }).click();

  await page.getByRole("link", { name: "Export" }).click();
  await page.getByRole("button", { name: "Export Website" }).click();
  await expect(page.getByRole("link", { name: "Download ZIP" })).toBeVisible();
});
```

- [ ] **Step 2: Run E2E test**

Run:

```bash
npm run test:e2e -- tests/e2e/publishing-flow.spec.ts
```

Expected: pass with browser automation.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/publishing-flow.spec.ts playwright.config.ts
git commit -m "test: cover DOCX publishing flow"
```

## Task 11: Final Verification and Documentation

**Files:**
- Create: `README.md`
- Modify: `.gitignore`

- [ ] **Step 1: Document setup**

README must include:

```md
# Blog Publisher

## Local Development

1. Copy `.env.example` to `.env`.
2. Run `npm install`.
3. Run `npm run prisma:migrate -- --name init`.
4. Run `npm run prisma:seed`.
5. Run `npm run dev`.
6. Sign in with `admin@example.com` / `admin12345`.

## MVP Scope

The MVP supports ZIP export. GitHub publishing is reserved for a future phase.
```

- [ ] **Step 2: Ensure generated data is ignored**

`.gitignore` must include:

```gitignore
storage/
.tmp/
prisma/dev.db
prisma/dev.db-journal
test-results/
playwright-report/
```

- [ ] **Step 3: Run full verification**

Run:

```bash
npm run build
npm test
npm run test:e2e
```

Expected: all commands pass.

- [ ] **Step 4: Commit**

```bash
git add README.md .gitignore
git commit -m "docs: add MVP setup instructions"
```

## Self-Review

Spec coverage:

- Authentication and default blog: Tasks 2 and 3.
- DOCX upload and conversion: Tasks 5 and 6.
- Categories and tags: Tasks 2, 7, and 9.
- Post statuses: Tasks 2, 6, and 10.
- Long post pagination: Tasks 4 and 7.
- Static website generation: Task 7.
- SEO files and metadata: Task 7.
- ZIP export: Task 8.
- Dashboard UI: Tasks 3, 6, 8, and 9.
- Testing: Tasks 2, 4, 5, 7, 8, 10, and 11.

No GitHub publishing implementation is included because the approved MVP explicitly defers it.
