# Bilingual Template and Static Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add bilingual admin localization, per-blog published-site language, a template registry with bilingual static rendering, root-relative HTML links, and admin preview of the last exported static site.

**Architecture:** Keep the existing Next.js MVP and refactor static page markup behind a small template registry. Store admin locale in a cookie and blog published locale in the existing `Blog` model. Serve export preview files through authenticated dashboard routes using the stored `siteDir` in `Export.payload`.

**Tech Stack:** Next.js App Router, TypeScript, Prisma/SQLite, Vitest, Playwright, existing static generator and ZIP export modules.

---

## Scope Check

This plan is one cohesive feature set because the requested changes meet at the static export boundary: localized dashboard controls set blog language, the template renderer consumes that language, and the preview route serves the generated output.

## Planned File Structure

- Modify `prisma/schema.prisma`: add `Blog.locale` with default `en`.
- Add migration under `prisma/migrations/*_add_blog_locale/`.
- Modify `prisma/seed.ts`: seed default blog locale.
- Create `src/lib/i18n/locales.ts`: locale types, direction, dictionaries, status labels.
- Create `src/lib/i18n/server.ts`: read admin locale cookie and expose translator.
- Create `src/app/actions/locale.ts`: server action for switching admin locale.
- Modify `src/app/layout.tsx`: use admin locale for `lang` and `dir`.
- Modify dashboard pages/components under `src/app` and `src/components/dashboard`: use localized labels.
- Modify `src/components/dashboard/blog-settings-form.tsx`: add published-site language selector.
- Modify `src/app/dashboard/settings/page.tsx`: save blog locale.
- Create `src/lib/static/templates/types.ts`: template contract.
- Create `src/lib/static/templates/registry.ts`: template lookup.
- Create `src/lib/static/templates/arabic-default/template.ts`: bilingual default template renderers.
- Create `src/lib/static/templates/arabic-default/styles.ts`: static template CSS.
- Modify `src/lib/static/render.ts`: keep URL helpers and shared types, remove direct page shell ownership.
- Modify `src/lib/static/site-generator.ts`: call selected template.
- Modify `src/lib/static/rss.ts` and `src/lib/static/sitemap.ts` only if type changes require it.
- Modify `src/app/api/exports/route.ts`: pass blog locale and store `siteDir` in export payload.
- Create `src/lib/exports/payload.ts`: parse export payload safely.
- Create `src/lib/exports/preview.ts`: resolve preview file paths safely.
- Create `src/app/dashboard/export/preview/page.tsx`: iframe wrapper page.
- Create `src/app/dashboard/export/preview/[...path]/route.ts`: authenticated static file serving route.
- Modify `src/app/dashboard/export/page.tsx`: show preview action for latest successful export.
- Tests under `tests/unit`: i18n, template registry/rendering, preview path resolver.
- Modify `tests/e2e/publishing-flow.spec.ts`: assert preview appears and loads generated content.
- Add `tests/e2e/localization.spec.ts`: assert Arabic and English dashboard labels can display.

## Task 1: Add Locale Model and Translation Primitives

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `prisma/seed.ts`
- Create: `src/lib/i18n/locales.ts`
- Create: `tests/unit/i18n.test.ts`

- [ ] **Step 1: Write failing i18n tests**

```ts
import { describe, expect, it } from "vitest";
import { directionForLocale, statusLabel, t } from "../../src/lib/i18n/locales";

describe("i18n primitives", () => {
  it("maps locale to direction", () => {
    expect(directionForLocale("ar")).toBe("rtl");
    expect(directionForLocale("en")).toBe("ltr");
  });

  it("returns status labels in both languages", () => {
    expect(statusLabel("DRAFT", "en")).toBe("Draft");
    expect(statusLabel("DRAFT", "ar")).toBe("مسودة");
  });

  it("translates dashboard labels", () => {
    expect(t("nav.posts", "en")).toBe("Posts");
    expect(t("nav.posts", "ar")).toBe("المنشورات");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- tests/unit/i18n.test.ts
```

Expected: FAIL because `src/lib/i18n/locales.ts` does not exist.

- [ ] **Step 3: Implement i18n primitives**

Create `src/lib/i18n/locales.ts`:

```ts
import type { PostStatus } from "@prisma/client";

export type Locale = "ar" | "en";
export type Direction = "rtl" | "ltr";
export type MessageKey =
  | "nav.posts"
  | "nav.upload"
  | "nav.taxonomy"
  | "nav.export"
  | "nav.settings"
  | "auth.signIn"
  | "posts.title"
  | "upload.title"
  | "export.title"
  | "export.preview"
  | "export.downloadZip"
  | "settings.title"
  | "settings.siteLanguage"
  | "common.save";

const messages: Record<Locale, Record<MessageKey, string>> = {
  en: {
    "nav.posts": "Posts",
    "nav.upload": "Upload Word",
    "nav.taxonomy": "Categories & Tags",
    "nav.export": "Export",
    "nav.settings": "Settings",
    "auth.signIn": "Sign in",
    "posts.title": "Posts",
    "upload.title": "Upload Word",
    "export.title": "Export",
    "export.preview": "Preview Website",
    "export.downloadZip": "Download ZIP",
    "settings.title": "Settings",
    "settings.siteLanguage": "Published site language",
    "common.save": "Save"
  },
  ar: {
    "nav.posts": "المنشورات",
    "nav.upload": "رفع Word",
    "nav.taxonomy": "التصنيفات والوسوم",
    "nav.export": "التصدير",
    "nav.settings": "الإعدادات",
    "auth.signIn": "تسجيل الدخول",
    "posts.title": "المنشورات",
    "upload.title": "رفع Word",
    "export.title": "التصدير",
    "export.preview": "معاينة الموقع",
    "export.downloadZip": "تحميل ZIP",
    "settings.title": "الإعدادات",
    "settings.siteLanguage": "لغة الموقع المنشور",
    "common.save": "حفظ"
  }
};

const statuses: Record<Locale, Record<PostStatus, string>> = {
  en: {
    DRAFT: "Draft",
    IN_REVIEW: "In Review",
    APPROVED: "Approved",
    PUBLISHED: "Published",
    ARCHIVED: "Archived"
  },
  ar: {
    DRAFT: "مسودة",
    IN_REVIEW: "قيد المراجعة",
    APPROVED: "معتمد",
    PUBLISHED: "منشور",
    ARCHIVED: "مؤرشف"
  }
};

export function directionForLocale(locale: Locale): Direction {
  return locale === "ar" ? "rtl" : "ltr";
}

export function t(key: MessageKey, locale: Locale): string {
  return messages[locale][key];
}

export function statusLabel(status: PostStatus, locale: Locale): string {
  return statuses[locale][status];
}

export function parseLocale(value: string | undefined | null): Locale {
  return value === "ar" ? "ar" : "en";
}
```

- [ ] **Step 4: Add blog locale to Prisma**

In `prisma/schema.prisma`, add:

```prisma
locale      String       @default("en")
```

to `model Blog`.

Update `prisma/seed.ts` to set:

```ts
locale: "en",
```

in both blog `update` and `create`.

- [ ] **Step 5: Run migration and tests**

Run:

```bash
npm run prisma:migrate -- --name add_blog_locale
npm run prisma:generate
npm run prisma:seed
npm test -- tests/unit/i18n.test.ts
npm run build
```

Expected: migration, seed, test, and build pass.

- [ ] **Step 6: Commit**

```bash
git add prisma src/lib/i18n tests/unit/i18n.test.ts
git commit -m "feat: add bilingual locale primitives"
```

## Task 2: Localize Admin Shell and Core Pages

**Files:**
- Create: `src/lib/i18n/server.ts`
- Create: `src/app/actions/locale.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/login/page.tsx`
- Modify: `src/app/login/login-form.tsx`
- Modify: `src/app/dashboard/layout.tsx`
- Modify: `src/components/dashboard/sidebar.tsx`
- Modify: `src/app/dashboard/posts/page.tsx`
- Modify: `src/app/dashboard/posts/upload/page.tsx`
- Modify: `src/components/dashboard/post-form.tsx`
- Modify: `src/app/dashboard/export/page.tsx`
- Test: `tests/e2e/localization.spec.ts`

- [ ] **Step 1: Write failing E2E localization test**

```ts
import { expect, test } from "@playwright/test";

test("dashboard can switch between English and Arabic labels", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();

  await page.getByRole("button", { name: "العربية" }).click();
  await expect(page.getByRole("button", { name: "تسجيل الدخول" })).toBeVisible();

  await page.getByRole("button", { name: "English" }).click();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test:e2e -- tests/e2e/localization.spec.ts
```

Expected: FAIL because locale switch buttons do not exist.

- [ ] **Step 3: Implement server locale helpers**

Create `src/lib/i18n/server.ts`:

```ts
import { cookies } from "next/headers";
import { directionForLocale, parseLocale, t, type Locale } from "./locales";

export const ADMIN_LOCALE_COOKIE = "blog-publisher-locale";

export async function getAdminLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return parseLocale(cookieStore.get(ADMIN_LOCALE_COOKIE)?.value);
}

export async function getAdminDirection() {
  return directionForLocale(await getAdminLocale());
}

export async function getTranslator() {
  const locale = await getAdminLocale();
  return {
    locale,
    dir: directionForLocale(locale),
    t: (key: Parameters<typeof t>[0]) => t(key, locale)
  };
}
```

Create `src/app/actions/locale.ts`:

```ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_LOCALE_COOKIE } from "@/lib/i18n/server";
import { parseLocale } from "@/lib/i18n/locales";

export async function switchLocale(formData: FormData) {
  const locale = parseLocale(String(formData.get("locale")));
  const returnTo = String(formData.get("returnTo") ?? "/login");
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_LOCALE_COOKIE, locale, {
    path: "/",
    sameSite: "lax"
  });
  redirect(returnTo.startsWith("/") ? returnTo : "/login");
}
```

- [ ] **Step 4: Add locale switcher and translated labels**

Use `getTranslator()` in server components. Add two small forms in login/dashboard header:

```tsx
<form action={switchLocale}>
  <input type="hidden" name="locale" value="ar" />
  <input type="hidden" name="returnTo" value="/login" />
  <button type="submit">العربية</button>
</form>
<form action={switchLocale}>
  <input type="hidden" name="locale" value="en" />
  <input type="hidden" name="returnTo" value="/login" />
  <button type="submit">English</button>
</form>
```

Apply translations to sidebar, login heading/button, posts title, upload title, export title/buttons, and status labels in visible tables/forms.

- [ ] **Step 5: Run verification**

Run:

```bash
npm run test:e2e -- tests/e2e/localization.spec.ts
npm test
npm run build
```

Expected: localization E2E, unit tests, and build pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/i18n src/app/actions src/app src/components/dashboard tests/e2e/localization.spec.ts
git commit -m "feat: localize admin dashboard"
```

## Task 3: Add Published Site Language Setting

**Files:**
- Modify: `src/components/dashboard/blog-settings-form.tsx`
- Modify: `src/app/dashboard/settings/page.tsx`
- Modify: `tests/unit/settings.test.ts`

- [ ] **Step 1: Write failing settings test**

Append to `tests/unit/settings.test.ts`:

```ts
import { parseLocale } from "../../src/lib/i18n/locales";

it("falls back unsupported blog locale values to English", () => {
  expect(parseLocale("fr")).toBe("en");
});
```

- [ ] **Step 2: Run test**

Run:

```bash
npm test -- tests/unit/settings.test.ts tests/unit/i18n.test.ts
```

Expected: tests pass if Task 1 exists; this confirms locale parsing before UI wiring.

- [ ] **Step 3: Add site language selector**

In `BlogSettingsForm`, add:

```tsx
<label>
  <span>{siteLanguageLabel}</span>
  <select name="locale" defaultValue={blog.locale}>
    <option value="en">English</option>
    <option value="ar">العربية</option>
  </select>
</label>
```

Extend the component props to include `locale` and localized label strings.

In `settings/page.tsx`, save:

```ts
locale: parseLocale(String(formData.get("locale")))
```

- [ ] **Step 4: Run verification**

Run:

```bash
npm test -- tests/unit/settings.test.ts tests/unit/i18n.test.ts
npm run build
```

Expected: tests and build pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/blog-settings-form.tsx src/app/dashboard/settings/page.tsx tests/unit/settings.test.ts
git commit -m "feat: configure published site language"
```

## Task 4: Refactor Static Rendering Behind Bilingual Template

**Files:**
- Create: `src/lib/static/templates/types.ts`
- Create: `src/lib/static/templates/registry.ts`
- Create: `src/lib/static/templates/arabic-default/template.ts`
- Create: `src/lib/static/templates/arabic-default/styles.ts`
- Modify: `src/lib/static/render.ts`
- Modify: `src/lib/static/site-generator.ts`
- Modify: `tests/unit/static-generator.test.ts`
- Create: `tests/unit/template-registry.test.ts`

- [ ] **Step 1: Write failing template tests**

Create `tests/unit/template-registry.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getStaticTemplate } from "../../src/lib/static/templates/registry";

describe("static template registry", () => {
  it("returns the bilingual default template", () => {
    expect(getStaticTemplate("arabic-default").id).toBe("arabic-default");
  });

  it("renders Arabic RTL and English LTR shells", () => {
    const template = getStaticTemplate("arabic-default");
    expect(template.renderShell({
      locale: "ar",
      title: "اختبار",
      description: "وصف",
      canonicalUrl: "https://example.com/",
      body: "<h1>اختبار</h1>",
      rootPath: "/"
    })).toContain('<html lang="ar" dir="rtl">');
    expect(template.renderShell({
      locale: "en",
      title: "Test",
      description: "Description",
      canonicalUrl: "https://example.com/",
      body: "<h1>Test</h1>",
      rootPath: "/"
    })).toContain('<html lang="en" dir="ltr">');
  });
});
```

- [ ] **Step 2: Update static generator test for root-relative links**

In `tests/unit/static-generator.test.ts`, assert:

```ts
const html = await fs.readFile(path.join(outputDir, "index.html"), "utf8");
expect(html).toContain('href="/blog/hello/"');
expect(html).not.toContain('href="https://example.com/blog/hello/"');
expect(html).toContain('lang="en"');
expect(html).toContain('dir="ltr"');
```

Add a second case with `blog.locale: "ar"` and assert `lang="ar"` and `dir="rtl"`.

- [ ] **Step 3: Run failing tests**

Run:

```bash
npm test -- tests/unit/template-registry.test.ts tests/unit/static-generator.test.ts
```

Expected: FAIL because template files and locale-aware generator do not exist.

- [ ] **Step 4: Implement template types and registry**

Create `src/lib/static/templates/types.ts`:

```ts
import type { Locale } from "@/lib/i18n/locales";
import type { StaticBlog, StaticPost } from "../render";

export type ShellInput = {
  locale: Locale;
  title: string;
  description: string;
  canonicalUrl: string;
  body: string;
  rootPath: string;
  previousUrl?: string;
  nextUrl?: string;
  structuredData?: object;
};

export type StaticTemplate = {
  id: "arabic-default";
  renderShell(input: ShellInput): string;
  renderHome(blog: StaticBlog, posts: StaticPost[]): string;
  renderBlogIndex(blog: StaticBlog, posts: StaticPost[]): string;
  renderPost(post: StaticPost, pageHtml: string, currentPage: number, pageCount: number): string;
  renderCategory(name: string, posts: StaticPost[]): string;
  renderTag(name: string, posts: StaticPost[]): string;
};
```

Create `registry.ts` returning the `arabicDefaultTemplate`.

- [ ] **Step 5: Implement bilingual default template**

Move shell/page markup from `render.ts` into `arabic-default/template.ts`. Use root-relative internal links in all page bodies. Embed CSS from `styles.ts` in the shell.

Required shell line:

```ts
`<html lang="${locale}" dir="${directionForLocale(locale)}">`
```

- [ ] **Step 6: Refactor generator**

Update `StaticBlog` to include:

```ts
locale: Locale;
```

Update `generateStaticSite` to call:

```ts
const template = getStaticTemplate("arabic-default");
```

and use template methods for page bodies/shells.

- [ ] **Step 7: Run verification**

Run:

```bash
npm test -- tests/unit/template-registry.test.ts tests/unit/static-generator.test.ts
npm test
npm run build
```

Expected: tests and build pass.

- [ ] **Step 8: Commit**

```bash
git add src/lib/static tests/unit/template-registry.test.ts tests/unit/static-generator.test.ts
git commit -m "feat: render static site with bilingual template"
```

## Task 5: Store Export Site Directory and Serve Preview Safely

**Files:**
- Create: `src/lib/exports/payload.ts`
- Create: `src/lib/exports/preview.ts`
- Modify: `src/app/api/exports/route.ts`
- Create: `src/app/dashboard/export/preview/page.tsx`
- Create: `src/app/dashboard/export/preview/[...path]/route.ts`
- Modify: `src/app/dashboard/export/page.tsx`
- Test: `tests/unit/export-preview.test.ts`

- [ ] **Step 1: Write failing preview resolver tests**

```ts
import { describe, expect, it } from "vitest";
import path from "node:path";
import { resolvePreviewFilePath } from "../../src/lib/exports/preview";

describe("resolvePreviewFilePath", () => {
  const siteDir = path.join(process.cwd(), ".tmp/site");

  it("defaults directory requests to index.html", () => {
    expect(resolvePreviewFilePath(siteDir, [])).toBe(path.join(siteDir, "index.html"));
    expect(resolvePreviewFilePath(siteDir, ["blog", "post"])).toBe(path.join(siteDir, "blog", "post", "index.html"));
  });

  it("rejects path traversal", () => {
    expect(() => resolvePreviewFilePath(siteDir, ["..", "secret.txt"])).toThrow("Invalid preview path.");
  });
});
```

- [ ] **Step 2: Run failing test**

Run:

```bash
npm test -- tests/unit/export-preview.test.ts
```

Expected: FAIL because preview resolver does not exist.

- [ ] **Step 3: Implement payload and preview helpers**

Create `payload.ts`:

```ts
export type ExportPayload = { files: number; siteDir?: string; error?: string };

export function parseExportPayload(value: string | null): ExportPayload {
  if (!value) return { files: 0 };
  try {
    const parsed = JSON.parse(value) as ExportPayload;
    return { files: Number(parsed.files ?? 0), siteDir: parsed.siteDir, error: parsed.error };
  } catch {
    return { files: 0 };
  }
}
```

Create `preview.ts`:

```ts
import path from "node:path";

export function resolvePreviewFilePath(siteDir: string, segments: string[]) {
  const relativePath = segments.length === 0 ? "index.html" : path.join(...segments);
  const withIndex = path.extname(relativePath) ? relativePath : path.join(relativePath, "index.html");
  const resolved = path.resolve(siteDir, withIndex);
  const root = path.resolve(siteDir);
  if (!resolved.startsWith(root + path.sep) && resolved !== root) {
    throw new Error("Invalid preview path.");
  }
  return resolved;
}
```

- [ ] **Step 4: Store `siteDir` in export payload**

In `src/app/api/exports/route.ts`, set:

```ts
payload: JSON.stringify({ files: result.files.length, siteDir: outputDir })
```

and pass blog locale to `generateStaticSite`.

- [ ] **Step 5: Add preview routes**

`src/app/dashboard/export/preview/page.tsx` renders an iframe:

```tsx
<iframe title={...} src="/dashboard/export/preview/site/" />
```

`src/app/dashboard/export/preview/[...path]/route.ts`:

- requires session
- gets default blog
- finds latest completed `Export`
- parses payload
- resolves requested file
- serves bytes with content type by extension

- [ ] **Step 6: Update export page**

Show `Preview Website` link when a completed export has `payload.siteDir`.

- [ ] **Step 7: Run verification**

Run:

```bash
npm test -- tests/unit/export-preview.test.ts
npm test
npm run build
```

Expected: tests and build pass.

- [ ] **Step 8: Commit**

```bash
git add src/lib/exports src/app/api/exports/route.ts src/app/dashboard/export tests/unit/export-preview.test.ts
git commit -m "feat: preview exported static site"
```

## Task 6: Bilingual Export Flow E2E

**Files:**
- Modify: `tests/e2e/publishing-flow.spec.ts`
- Modify: `tests/e2e/localization.spec.ts`

- [ ] **Step 1: Extend publishing E2E**

After export completes, add:

```ts
await page.getByRole("link", { name: /Preview Website|معاينة الموقع/ }).click();
await expect(page.frameLocator("iframe").getByRole("heading", { name: "My Blog" })).toBeVisible();
```

Adjust heading expectation if the template renders the blog title differently.

- [ ] **Step 2: Extend localization E2E**

Ensure English and Arabic controls both work:

```ts
await page.goto("/login");
await page.getByRole("button", { name: "العربية" }).click();
await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
await page.getByRole("button", { name: "English" }).click();
await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
```

- [ ] **Step 3: Run E2E**

Run:

```bash
npm run test:e2e -- tests/e2e/localization.spec.ts tests/e2e/publishing-flow.spec.ts
```

Expected: both E2E tests pass.

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/localization.spec.ts tests/e2e/publishing-flow.spec.ts
git commit -m "test: cover bilingual export preview flow"
```

## Task 7: Final Verification and Docs

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update README**

Add:

```md
## Localization and Templates

The admin dashboard supports English and Arabic. The active admin language is stored in a cookie.

Each blog has a published-site language setting. Static exports render with the bilingual default template and use root-relative links for internal navigation.

After exporting, use the Export page to preview the generated static site inside the dashboard before downloading the ZIP.
```

- [ ] **Step 2: Run full verification**

Run these sequentially, not in parallel:

```bash
npm run build
npm test
npm run test:e2e
npm run lint
```

Expected: all commands pass. `next lint` may print the existing deprecation notice, but no ESLint warnings or errors.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: document bilingual templates and preview"
```

## Self-Review

Spec coverage:

- Root-relative internal HTML links: Task 4.
- Absolute SEO metadata remains via `baseUrl`: Task 4, existing RSS/sitemap helpers.
- Admin preview of last export: Task 5 and Task 6.
- Admin Arabic/English switching: Task 2 and Task 6.
- Blog-level published language: Task 1, Task 3, Task 4.
- Template registry and bilingual default template: Task 4.
- Error handling for no preview/path traversal: Task 5.
- Tests and E2E: Tasks 1, 2, 4, 5, 6, 7.

No multiple-template selection, theme marketplace, or GitHub publishing is included because the approved spec excludes them.
