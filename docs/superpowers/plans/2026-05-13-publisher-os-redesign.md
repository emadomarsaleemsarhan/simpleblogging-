# Publisher OS Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Blog Publisher's public app, login, dashboard, and exported default static template as the approved Publisher OS design.

**Architecture:** Keep the existing Next.js App Router, Prisma, auth, i18n, and static export architecture. The redesign is CSS-first with small focused component/page changes, no new component library, and no database schema changes.

**Tech Stack:** Next.js 15, React 19, TypeScript, Prisma, NextAuth, CSS modules via `src/app/globals.css`, existing static template renderer in `src/lib/static/templates.ts`, Playwright, Vitest.

---

## File Structure

- Modify `src/app/page.tsx`: replace anonymous-user redirect with public Publisher OS platform page while preserving signed-in redirect.
- Modify `src/app/login/page.tsx`: restyle login composition and reuse existing `LoginForm`.
- Modify `src/app/globals.css`: add Publisher OS design tokens, public page styles, refreshed dashboard styles, responsive rules, and static-like preview utilities.
- Modify `src/app/dashboard/layout.tsx`: add product-shell framing, user/blog context where lightweight, and keep locale switching.
- Modify `src/components/dashboard/sidebar.tsx`: update dashboard navigation markup to support product sections and improved visual hierarchy.
- Modify `src/app/dashboard/posts/page.tsx`: add dashboard summary cards and toolbar framing around posts table.
- Modify `src/app/dashboard/export/page.tsx`: add publishing pipeline framing and clearer export actions/history.
- Modify `src/app/dashboard/settings/page.tsx`: add explanatory page copy and better wrapper for template selection.
- Modify `src/components/dashboard/blog-settings-form.tsx`: make template selection obvious using a highlighted field group.
- Modify `src/lib/i18n/locales.ts`: add labels required by the new public page and dashboard copy in Arabic and English.
- Modify `src/lib/static/templates.ts`: rebuild the default `editorial` static template CSS/markup to match Publisher OS and `taelum.org`-inspired editorial presentation.
- Modify `tests/e2e/home.spec.ts`: verify anonymous users see platform page and authenticated/dashboard behavior remains reachable.
- Modify `tests/e2e/localization.spec.ts`: verify public/login/dashboard localized labels remain correct.
- Modify or add `tests/unit/static-generator.test.ts`: assert generated static HTML includes the new template markers and portable links.

---

## Task 1: Public Platform And Login Surface

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/login/page.tsx`
- Modify: `src/lib/i18n/locales.ts`
- Modify: `src/app/globals.css`
- Test: `tests/e2e/home.spec.ts`
- Test: `tests/e2e/localization.spec.ts`

- [ ] **Step 1: Write failing E2E coverage for public platform page**

Update `tests/e2e/home.spec.ts` with a test that clears auth state and expects public platform text:

```ts
import { test, expect } from "@playwright/test";

test("anonymous visitors see the Publisher OS platform page", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Word to static publishing|من Word إلى موقع/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Sign in|تسجيل الدخول/i })).toBeVisible();
});
```

- [ ] **Step 2: Run the new E2E test and confirm it fails**

Run:

```powershell
npx playwright test tests/e2e/home.spec.ts --project=chromium
```

Expected: FAIL because `/` currently redirects anonymous users to `/login`.

- [ ] **Step 3: Add public-page message keys**

Extend `MessageKey` in `src/lib/i18n/locales.ts` with:

```ts
| "public.nav.features"
| "public.nav.templates"
| "public.hero.kicker"
| "public.hero.title"
| "public.hero.subtitle"
| "public.hero.signIn"
| "public.hero.preview"
| "public.flow.title"
| "public.flow.upload"
| "public.flow.review"
| "public.flow.export"
| "public.features.docx"
| "public.features.review"
| "public.features.templates"
| "public.features.static"
```

Add English values:

```ts
"public.nav.features": "Features",
"public.nav.templates": "Templates",
"public.hero.kicker": "Static publishing platform",
"public.hero.title": "Word to static publishing",
"public.hero.subtitle": "Convert DOCX files into reviewed posts, organize categories and tags, then export a fast static website.",
"public.hero.signIn": "Sign in",
"public.hero.preview": "Preview template",
"public.flow.title": "Publishing flow",
"public.flow.upload": "Upload DOCX",
"public.flow.review": "Review and approve",
"public.flow.export": "Export ZIP or GitHub-ready site",
"public.features.docx": "DOCX conversion",
"public.features.review": "Editorial workflow",
"public.features.templates": "Selectable templates",
"public.features.static": "Portable static export",
```

Add Arabic values:

```ts
"public.nav.features": "المزايا",
"public.nav.templates": "القوالب",
"public.hero.kicker": "منصة نشر مواقع ثابتة",
"public.hero.title": "من Word إلى موقع ثابت",
"public.hero.subtitle": "حوّل ملفات DOCX إلى تدوينات قابلة للمراجعة، ونظّم التصنيفات والوسوم، ثم صدّر موقعًا ثابتًا سريعًا.",
"public.hero.signIn": "تسجيل الدخول",
"public.hero.preview": "معاينة القالب",
"public.flow.title": "مسار النشر",
"public.flow.upload": "رفع DOCX",
"public.flow.review": "مراجعة واعتماد",
"public.flow.export": "تصدير ZIP أو موقع جاهز لـ GitHub",
"public.features.docx": "تحويل DOCX",
"public.features.review": "سير عمل تحريري",
"public.features.templates": "قوالب قابلة للاختيار",
"public.features.static": "تصدير ثابت بروابط محمولة",
```

- [ ] **Step 4: Implement `src/app/page.tsx` public platform page**

Replace the redirect-only page with a signed-in redirect plus anonymous public page using existing `getCurrentSession()` and `getTranslator()`:

```tsx
import Link from "next/link";
import { redirect } from "next/navigation";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { getCurrentSession } from "@/lib/auth";
import { getTranslator } from "@/lib/i18n/server";

export default async function Home() {
  const [session, translator] = await Promise.all([getCurrentSession(), getTranslator()]);

  if (session?.user?.id) {
    redirect("/dashboard/posts");
  }

  return (
    <main className="platform-page">
      <nav className="platform-nav" aria-label="Platform">
        <Link className="platform-brand" href="/">
          <span className="platform-brand-mark">BP</span>
          <span>Blog Publisher</span>
        </Link>
        <div className="platform-nav-links">
          <a href="#features">{translator.t("public.nav.features")}</a>
          <a href="#template">{translator.t("public.nav.templates")}</a>
          <LocaleSwitcher currentLocale={translator.locale} returnTo="/" />
        </div>
      </nav>
      <section className="platform-hero">
        <div className="platform-hero-copy">
          <p className="eyebrow">{translator.t("public.hero.kicker")}</p>
          <h1>{translator.t("public.hero.title")}</h1>
          <p>{translator.t("public.hero.subtitle")}</p>
          <div className="platform-actions">
            <Link className="primary-action" href="/login">{translator.t("public.hero.signIn")}</Link>
            <a className="secondary-action" href="#template">{translator.t("public.hero.preview")}</a>
          </div>
        </div>
        <aside className="platform-flow-card" aria-label={translator.t("public.flow.title")}>
          <h2>{translator.t("public.flow.title")}</h2>
          <ol>
            <li>{translator.t("public.flow.upload")}</li>
            <li>{translator.t("public.flow.review")}</li>
            <li>{translator.t("public.flow.export")}</li>
          </ol>
        </aside>
      </section>
      <section id="features" className="platform-feature-grid" aria-label={translator.t("public.nav.features")}>
        {[
          "public.features.docx",
          "public.features.review",
          "public.features.templates",
          "public.features.static",
        ].map((key) => (
          <article key={key} className="platform-feature-card">
            <span className="feature-marker" />
            <h2>{translator.t(key as never)}</h2>
          </article>
        ))}
      </section>
      <section id="template" className="platform-template-preview">
        <div className="template-masthead">Editorial static site</div>
        <div className="template-preview-grid">
          <div>
            <p className="eyebrow">Published website</p>
            <h2>Content-first, portable, fast</h2>
          </div>
          <div className="template-preview-stack">
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 5: Restyle `src/app/login/page.tsx` composition**

Keep `LoginForm` unchanged. Wrap it in a Publisher OS split layout:

```tsx
<main className="auth-page publisher-auth">
  <section className="auth-story">
    <Link className="platform-brand" href="/">
      <span className="platform-brand-mark">BP</span>
      <span>Blog Publisher</span>
    </Link>
    <p className="eyebrow">Publisher OS</p>
    <h1>{t("auth.signIn")}</h1>
    <p>{t("auth.subtitle")}</p>
  </section>
  <section className="auth-card editorial-panel">
    <div className="auth-card-header">
      <LocaleSwitcher currentLocale={locale} returnTo="/login" />
    </div>
    <Suspense fallback={null}>
      <LoginForm labels={{ email: t("auth.email"), password: t("auth.password"), signIn: t("auth.signIn"), signingIn: t("auth.signingIn"), invalidLogin: t("auth.invalidLogin") }} />
    </Suspense>
  </section>
</main>
```

- [ ] **Step 6: Add public and login CSS**

Add CSS classes to `src/app/globals.css` for `.platform-page`, `.platform-nav`, `.platform-brand`, `.platform-hero`, `.platform-flow-card`, `.platform-feature-grid`, `.platform-template-preview`, `.publisher-auth`, `.auth-story`, and mobile breakpoints. Use dark green product backgrounds, amber actions, paper editorial cards, and no oversized decorative gradients.

- [ ] **Step 7: Run E2E tests**

Run:

```powershell
npx playwright test tests/e2e/home.spec.ts tests/e2e/localization.spec.ts --project=chromium
```

Expected: PASS.

- [ ] **Step 8: Commit Task 1**

```powershell
git add src/app/page.tsx src/app/login/page.tsx src/lib/i18n/locales.ts src/app/globals.css tests/e2e/home.spec.ts tests/e2e/localization.spec.ts
git commit -m "feat: add publisher os public surface"
```

---

## Task 2: Dashboard Shell And Shared UI System

**Files:**
- Modify: `src/app/dashboard/layout.tsx`
- Modify: `src/components/dashboard/sidebar.tsx`
- Modify: `src/app/globals.css`
- Test: `tests/e2e/publishing-flow.spec.ts`

- [ ] **Step 1: Write dashboard shell assertions**

Update `tests/e2e/publishing-flow.spec.ts` to assert the dashboard shell includes the Publisher OS brand and main navigation after login:

```ts
await expect(page.getByText("Publisher OS")).toBeVisible();
await expect(page.getByRole("navigation", { name: /Dashboard|لوحة/i })).toBeVisible();
```

- [ ] **Step 2: Run the test and confirm failure**

Run:

```powershell
npx playwright test tests/e2e/publishing-flow.spec.ts --project=chromium
```

Expected: FAIL until the shell text/labels are added.

- [ ] **Step 3: Update dashboard sidebar markup**

In `src/components/dashboard/sidebar.tsx`, change the brand text to include `Publisher OS`, add a small section label above links, and keep the current link hrefs and i18n labels:

```tsx
<aside className="dashboard-sidebar">
  <Link href="/dashboard/posts" className="dashboard-brand">
    <span className="dashboard-brand-mark">BP</span>
    <span>
      <strong>Blog Publisher</strong>
      <small>Publisher OS</small>
    </span>
  </Link>
  <p className="dashboard-nav-label">Workspace</p>
  <nav aria-label="Dashboard" className="dashboard-nav">
    ...
  </nav>
</aside>
```

- [ ] **Step 4: Update dashboard layout header**

In `src/app/dashboard/layout.tsx`, wrap `children` in a `.dashboard-content` region and update the header with product context:

```tsx
<main className="dashboard-main">
  <header className="dashboard-header">
    <div>
      <p className="dashboard-kicker">Publisher OS</p>
      <span className="dashboard-user">{session.user.email}</span>
    </div>
    <LocaleSwitcher currentLocale={translator.locale} returnTo="/dashboard/posts" />
  </header>
  <div className="dashboard-content">{children}</div>
</main>
```

- [ ] **Step 5: Replace dashboard shell CSS**

Update `src/app/globals.css` dashboard styles so:

- `.dashboard-shell` uses dark app background behind sidebar and paper background in main.
- `.dashboard-sidebar` is sticky on desktop and horizontal on mobile.
- `.dashboard-brand small` is visible and muted.
- `.dashboard-content` has max width and consistent vertical rhythm.
- `.editorial-panel`, `.data-table`, `.button-link`, `.primary-action`, `.secondary-action`, `.status-chip` share the Publisher OS tokens.

- [ ] **Step 6: Run dashboard flow test**

Run:

```powershell
npx playwright test tests/e2e/publishing-flow.spec.ts --project=chromium
```

Expected: PASS or existing unrelated flow failures documented before fixes.

- [ ] **Step 7: Commit Task 2**

```powershell
git add src/app/dashboard/layout.tsx src/components/dashboard/sidebar.tsx src/app/globals.css tests/e2e/publishing-flow.spec.ts
git commit -m "feat: refresh dashboard shell"
```

---

## Task 3: Dashboard Content Pages

**Files:**
- Modify: `src/app/dashboard/posts/page.tsx`
- Modify: `src/app/dashboard/export/page.tsx`
- Modify: `src/app/dashboard/settings/page.tsx`
- Modify: `src/components/dashboard/blog-settings-form.tsx`
- Modify: `src/lib/i18n/locales.ts`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add dashboard content labels**

Add message keys for cards and helper text:

```ts
| "dashboard.stats.posts"
| "dashboard.stats.review"
| "dashboard.stats.published"
| "settings.templateHelp"
| "export.pipelineTitle"
| "export.pipelineCopy"
```

English values:

```ts
"dashboard.stats.posts": "Posts",
"dashboard.stats.review": "In review",
"dashboard.stats.published": "Published",
"settings.templateHelp": "Choose the default visual system used when exporting the static site.",
"export.pipelineTitle": "Static publishing pipeline",
"export.pipelineCopy": "Generate a portable website package with relative links, assets, sitemap, RSS, and preview pages.",
```

Arabic values:

```ts
"dashboard.stats.posts": "المنشورات",
"dashboard.stats.review": "قيد المراجعة",
"dashboard.stats.published": "منشور",
"settings.templateHelp": "اختر النظام البصري الافتراضي المستخدم عند تصدير الموقع الثابت.",
"export.pipelineTitle": "مسار نشر الموقع الثابت",
"export.pipelineCopy": "أنشئ حزمة موقع محمولة بروابط نسبية وملفات أصول وخرائط موقع وRSS وصفحات معاينة.",
```

- [ ] **Step 2: Add posts stat cards**

In `src/app/dashboard/posts/page.tsx`, calculate:

```ts
const inReviewCount = posts.filter((post) => post.status === "IN_REVIEW").length;
const publishedCount = posts.filter((post) => post.status === "PUBLISHED").length;
```

Render a `.dashboard-stat-grid` before the table with total posts, in-review, and published counts.

- [ ] **Step 3: Improve export page framing**

In `src/app/dashboard/export/page.tsx`, wrap title and `ExportButton` in `.publishing-panel editorial-panel`, add heading/copy from the new labels, then keep recent exports table below.

- [ ] **Step 4: Improve settings page and template selector**

In `src/app/dashboard/settings/page.tsx`, add page title row copy and pass `templateHelp` into `BlogSettingsForm`.

In `src/components/dashboard/blog-settings-form.tsx`, wrap the template select in:

```tsx
<div className="template-choice-field">
  <label>
    <span>{labels.template}</span>
    <select name="templateKey" defaultValue={blog.templateKey}>...</select>
  </label>
  <p>{labels.templateHelp}</p>
</div>
```

- [ ] **Step 5: Add page content CSS**

Add `.dashboard-stat-grid`, `.dashboard-stat-card`, `.publishing-panel`, `.template-choice-field`, and responsive rules to `src/app/globals.css`.

- [ ] **Step 6: Run TypeScript and focused tests**

Run:

```powershell
npm run build
npx playwright test tests/e2e/publishing-flow.spec.ts --project=chromium
```

Expected: build PASS, E2E PASS.

- [ ] **Step 7: Commit Task 3**

```powershell
git add src/app/dashboard/posts/page.tsx src/app/dashboard/export/page.tsx src/app/dashboard/settings/page.tsx src/components/dashboard/blog-settings-form.tsx src/lib/i18n/locales.ts src/app/globals.css
git commit -m "feat: redesign dashboard content pages"
```

---

## Task 4: Default Static Website Template

**Files:**
- Modify: `src/lib/static/templates.ts`
- Test: `tests/unit/static-generator.test.ts`
- Test: `tests/unit/zip-export.test.ts`

- [ ] **Step 1: Add static template assertions**

Update `tests/unit/static-generator.test.ts` to assert generated pages include Publisher OS editorial template markers and portable links:

```ts
expect(html).toContain('data-template="editorial"');
expect(html).toContain("static-masthead");
expect(html).toContain('href="/"');
expect(html).toContain('href="/blog/"');
```

- [ ] **Step 2: Run static tests and confirm failure for missing marker**

Run:

```powershell
npm test -- tests/unit/static-generator.test.ts
```

Expected: FAIL if `static-masthead` does not exist yet.

- [ ] **Step 3: Rebuild `editorialStaticTemplate` markup**

In `src/lib/static/templates.ts`, keep `createStaticTemplate()` and labels, but update generated HTML to use:

```html
<header class="static-masthead">
  <div class="static-masthead-inner">
    <a class="static-brand" href="...">...</a>
    <nav class="static-nav">...</nav>
  </div>
</header>
<main class="static-main">...</main>
```

Keep `portableHref(page.currentPath, "/")` and `portableHref(page.currentPath, "/blog/")`.

- [ ] **Step 4: Replace static template CSS**

Update static template `<style>` to align with Publisher OS:

- `body` uses warm paper background and high-contrast ink.
- `.static-masthead` uses editorial white/paper with a strong ink bottom border.
- `.static-brand` is large and publication-like.
- `.static-nav a` are compact text links or small outlined buttons.
- `.static-main` uses max width `1120px`.
- `article` uses readable max width `820px`, not a heavy admin card.
- `.post-list` uses editorial list/card rows.
- `.pagination` remains clear and accessible.
- RTL rules keep `direction: rtl` for Arabic pages.

- [ ] **Step 5: Run static and zip tests**

Run:

```powershell
npm test -- tests/unit/static-generator.test.ts tests/unit/zip-export.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit Task 4**

```powershell
git add src/lib/static/templates.ts tests/unit/static-generator.test.ts tests/unit/zip-export.test.ts
git commit -m "feat: align static template with publisher os"
```

---

## Task 5: Full Verification And Visual QA

**Files:**
- Modify only if verification reveals issues.

- [ ] **Step 1: Run unit test suite**

Run:

```powershell
npm test
```

Expected: all unit tests PASS.

- [ ] **Step 2: Run production build**

Run:

```powershell
npm run build
```

Expected: Next production build PASS.

- [ ] **Step 3: Run relevant E2E tests**

Run:

```powershell
npx playwright test tests/e2e/home.spec.ts tests/e2e/localization.spec.ts tests/e2e/publishing-flow.spec.ts --project=chromium
```

Expected: PASS.

- [ ] **Step 4: Start local app**

Run:

```powershell
npm run dev -- --port 52345
```

Expected: local Next app available at `http://localhost:52345`.

- [ ] **Step 5: Browser QA**

Check in desktop and mobile widths:

- `/` anonymous public platform page.
- `/login`.
- `/dashboard/posts`.
- `/dashboard/posts/upload`.
- `/dashboard/settings` template selector.
- `/dashboard/export`.
- Latest export preview route after generating an export.

Expected: no broken layout, no overlapping text, RTL works in Arabic, English works in LTR, and exported preview looks like a publication.

- [ ] **Step 6: Audit generated ZIP links**

Generate an export and download the ZIP. Inspect `index.html`, `/blog/`, and one post page. Confirm internal links use root-relative `/` paths and work without a domain.

- [ ] **Step 7: Final commit if QA fixes were needed**

If changes were made during QA:

```powershell
git add .
git commit -m "fix: polish publisher os redesign"
```

---

## Self-Review

- Spec coverage: public page, login, dashboard, settings template choice, default static template, multilingual support, and verification are covered.
- Scope check: no database, auth, native iOS, or publishing-provider changes are included.
- Placeholder scan: no TODO/TBD placeholders remain in implementation steps.
- Type consistency: new i18n keys are defined before usage; class names referenced in tasks are introduced in the CSS tasks; static template markers are asserted before implementation.
