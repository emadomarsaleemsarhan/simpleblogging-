# Editorial Studio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the existing Blog Publisher admin and login UI into the approved Editorial Studio direction while preserving all current bilingual, publishing, export, and preview behavior.

**Architecture:** Keep the current Next.js App Router structure and central `src/app/globals.css` styling, but organize the CSS into a small design system of tokens and component families. Avoid new backend work; update React markup only where better semantic hooks or reusable styling are needed.

**Tech Stack:** Next.js 15, React 19, TypeScript, Prisma SQLite, plain CSS, Vitest, Playwright.

---

## File Structure

- Modify `src/app/globals.css`: design tokens, editorial shell, auth, tables, forms, buttons, status chips, responsive RTL/LTR styles.
- Modify `src/app/dashboard/layout.tsx`: add shell header structure and stable styling hooks.
- Modify `src/components/dashboard/sidebar.tsx`: add navigation item classes and compact brand treatment.
- Modify `src/components/locale-switcher.tsx`: add button variant classes while preserving server action.
- Modify `src/app/login/page.tsx`: add editorial login structure.
- Modify `src/app/dashboard/posts/page.tsx`: add status chip markup and editorial table wrappers.
- Modify `src/components/dashboard/post-form.tsx`: group metadata/content fields and add status chip-friendly styling hooks.
- Modify `src/components/dashboard/blog-settings-form.tsx`: align settings fields with editorial form styling.
- Modify `src/app/dashboard/export/export-button.tsx`: style success feedback as export action feedback.
- Modify `src/app/dashboard/export/page.tsx`: add table/action wrappers for export dashboard.
- Modify `src/app/dashboard/export/[exportId]/preview/page.tsx`: improve preview frame layout hooks.
- Modify `src/app/dashboard/posts/upload/page.tsx` and `src/app/dashboard/posts/upload/upload-form.tsx`: style upload workflow.
- Modify `tests/e2e/localization.spec.ts`: add a visual-regression-adjacent smoke check for redesigned controls without snapshot fragility.
- Modify `tests/e2e/publishing-flow.spec.ts`: ensure redesigned export success state remains reachable.

---

### Task 1: Add Redesign Smoke Tests

**Files:**
- Modify: `tests/e2e/localization.spec.ts`
- Modify: `tests/e2e/publishing-flow.spec.ts`

- [ ] **Step 1: Extend localization smoke coverage before styling**

Add expectations that will still be true after redesign and catch missing shell/control hooks:

```ts
await expect(page.locator(".auth-page")).toBeVisible();
await expect(page.locator(".locale-switcher")).toBeVisible();
```

In `tests/e2e/localization.spec.ts`, place those after `await page.goto("/login");`.

- [ ] **Step 2: Extend export success smoke coverage before styling**

In `tests/e2e/publishing-flow.spec.ts`, after reading `exportPayload`, add:

```ts
await expect(page.getByRole("status")).toContainText("Export completed.");
await expect(page.getByRole("link", { name: "Preview Website" }).first()).toBeVisible();
```

This verifies the redesigned export feedback remains visible.

- [ ] **Step 3: Run E2E tests and confirm current behavior**

Run:

```powershell
$env:CI='1'; npm run test:e2e -- tests/e2e/localization.spec.ts tests/e2e/publishing-flow.spec.ts
```

Expected: PASS. If this fails because port 3000 is already occupied by a stale dev server, stop the listening process on 3000 and rerun with `$env:CI='1'`.

- [ ] **Step 4: Commit tests**

```powershell
& 'C:\Program Files\Git\cmd\git.exe' add tests/e2e/localization.spec.ts tests/e2e/publishing-flow.spec.ts
& 'C:\Program Files\Git\cmd\git.exe' commit -m "test: cover redesigned admin shell"
```

---

### Task 2: Build Editorial Design Tokens And Base Components

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Replace root tokens with Editorial Studio tokens**

At the top of `src/app/globals.css`, replace the current `:root` block with:

```css
:root {
  color-scheme: light;
  --font-display: Georgia, "Times New Roman", serif;
  --font-ui: "Segoe UI", Tahoma, Arial, sans-serif;
  --font-mono: Consolas, "Courier New", monospace;
  --paper: #f6f1e7;
  --paper-deep: #ede4d3;
  --surface: #fffdf8;
  --surface-strong: #ffffff;
  --ink: #16231f;
  --ink-soft: #31413b;
  --muted: #68766f;
  --line: #ded5c5;
  --line-strong: #c9bda9;
  --forest: #0f6f5c;
  --forest-dark: #0a3f35;
  --amber: #c9842b;
  --bluegray: #536b7a;
  --rose: #b4535f;
  --mist: #edf3ef;
  --shadow-soft: 0 18px 48px rgba(22, 35, 31, 0.09);
  --shadow-tight: 0 10px 24px rgba(22, 35, 31, 0.10);
  --radius: 8px;
  --radius-sm: 6px;
  font-family: var(--font-ui);
  background: var(--paper);
  color: var(--ink);
}
```

- [ ] **Step 2: Add base page texture and control typography**

Add or update:

```css
body {
  margin: 0;
  min-height: 100vh;
  background:
    linear-gradient(135deg, rgba(15, 111, 92, 0.06), transparent 34%),
    radial-gradient(circle at 82% 0%, rgba(201, 132, 43, 0.10), transparent 30%),
    var(--paper);
}

button,
input,
select,
textarea {
  font-family: var(--font-ui);
  font-size: 0.95rem;
}

h1,
h2,
h3,
.dashboard-brand,
.auth-brand-title {
  font-family: var(--font-display);
  letter-spacing: 0;
}
```

- [ ] **Step 3: Add reusable buttons, panels, tables, forms, chips**

Append component styles:

```css
.editorial-panel {
  background: rgba(255, 253, 248, 0.86);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow-soft);
}

.button-link,
.stack-form button,
.primary-action {
  border: 0;
  border-radius: var(--radius-sm);
  background: var(--forest);
  color: white;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 700;
  min-height: 42px;
  padding: 10px 15px;
  box-shadow: var(--shadow-tight);
}

.button-link:hover,
.stack-form button:hover,
.primary-action:hover {
  background: var(--forest-dark);
}

.secondary-link {
  color: var(--forest-dark);
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 4px;
}

.status-chip {
  align-items: center;
  border-radius: 999px;
  display: inline-flex;
  font-size: 0.78rem;
  font-weight: 800;
  min-height: 24px;
  padding: 4px 9px;
}

.status-chip[data-status="DRAFT"] { background: #eef1ef; color: #53605a; }
.status-chip[data-status="IN_REVIEW"] { background: #fff0d8; color: #8a5419; }
.status-chip[data-status="APPROVED"] { background: #e2f3ed; color: #0f6f5c; }
.status-chip[data-status="PUBLISHED"] { background: #e7eef8; color: #315d8f; }
.status-chip[data-status="ARCHIVED"] { background: #f7e6e8; color: #9d3f4c; }
```

- [ ] **Step 4: Run CSS/build verification**

Run:

```powershell
npm run build
```

Expected: build passes.

- [ ] **Step 5: Commit base styles**

```powershell
& 'C:\Program Files\Git\cmd\git.exe' add src/app/globals.css
& 'C:\Program Files\Git\cmd\git.exe' commit -m "style: add editorial studio design tokens"
```

---

### Task 3: Redesign Auth And App Shell

**Files:**
- Modify: `src/app/login/page.tsx`
- Modify: `src/app/dashboard/layout.tsx`
- Modify: `src/components/dashboard/sidebar.tsx`
- Modify: `src/components/locale-switcher.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Update login page markup**

Change `src/app/login/page.tsx` return block to:

```tsx
return (
  <main className="auth-page">
    <section className="auth-card editorial-panel">
      <div className="auth-card-header">
        <LocaleSwitcher currentLocale={locale} returnTo="/login" />
        <p className="eyebrow">Blog Publisher</p>
        <h1 className="auth-brand-title">{t("auth.signIn")}</h1>
        <p>{t("auth.subtitle")}</p>
      </div>
      <Suspense fallback={null}>
        <LoginForm
          labels={{
            email: t("auth.email"),
            password: t("auth.password"),
            signIn: t("auth.signIn"),
            signingIn: t("auth.signingIn"),
            invalidLogin: t("auth.invalidLogin"),
          }}
        />
      </Suspense>
    </section>
  </main>
);
```

- [ ] **Step 2: Update dashboard layout markup**

Change `src/app/dashboard/layout.tsx` main content header to:

```tsx
<main className="dashboard-main">
  <header className="dashboard-header">
    <div>
      <p className="dashboard-kicker">Blog Publisher</p>
      <span className="dashboard-user">{session.user.email}</span>
    </div>
    <LocaleSwitcher currentLocale={translator.locale} returnTo="/dashboard/posts" />
  </header>
  {children}
</main>
```

- [ ] **Step 3: Update sidebar markup**

Change `DashboardSidebar` to include nav classes:

```tsx
export function DashboardSidebar({ t }: { t: (key: MessageKey) => string }) {
  return (
    <aside className="dashboard-sidebar">
      <Link href="/dashboard/posts" className="dashboard-brand">
        <span className="dashboard-brand-mark">BP</span>
        <span>Blog Publisher</span>
      </Link>
      <nav aria-label="Dashboard" className="dashboard-nav">
        {navigation.map((item) => (
          <Link key={item.href} href={item.href} className="dashboard-nav-link">
            {t(item.label)}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 4: Update locale switcher button classes**

In `src/components/locale-switcher.tsx`, add `className="locale-option"` to both language buttons.

- [ ] **Step 5: Add shell/auth CSS**

In `src/app/globals.css`, replace the current `.auth-*`, `.dashboard-*`, and `.locale-switcher` sections with editorial styles:

```css
.auth-page {
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 32px;
}

.auth-card {
  display: grid;
  gap: 22px;
  max-width: 460px;
  padding: 30px;
  width: min(460px, 100%);
}

.auth-card-header {
  display: grid;
  gap: 10px;
}

.auth-brand-title {
  font-size: clamp(2.1rem, 6vw, 3.4rem);
  line-height: 1;
  margin: 0;
}

.dashboard-shell {
  display: grid;
  grid-template-columns: 264px minmax(0, 1fr);
  min-height: 100vh;
}

.dashboard-sidebar {
  background: linear-gradient(180deg, var(--forest-dark), #102b25);
  color: white;
  padding: 24px 18px;
}

.dashboard-brand {
  align-items: center;
  display: flex;
  gap: 12px;
  font-size: 1.2rem;
  font-weight: 800;
  margin-bottom: 34px;
}

.dashboard-brand-mark {
  align-items: center;
  background: var(--amber);
  border-radius: var(--radius-sm);
  color: #23180b;
  display: inline-flex;
  font-family: var(--font-ui);
  font-size: 0.82rem;
  height: 38px;
  justify-content: center;
  width: 38px;
}

.dashboard-nav {
  display: grid;
  gap: 7px;
}

.dashboard-nav-link {
  border-radius: var(--radius-sm);
  color: rgba(255, 255, 255, 0.78);
  font-weight: 700;
  padding: 10px 12px;
}

.dashboard-nav-link:hover {
  background: rgba(255, 255, 255, 0.10);
  color: white;
}

.dashboard-main {
  padding: 28px 34px 44px;
}

.dashboard-header {
  align-items: center;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  margin-bottom: 30px;
}

.dashboard-kicker,
.eyebrow {
  color: var(--muted);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  margin: 0;
  text-transform: uppercase;
}

.dashboard-user {
  color: var(--ink-soft);
  font-weight: 700;
}

.locale-switcher {
  display: flex;
  gap: 8px;
}

.locale-option {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  color: var(--ink);
  cursor: pointer;
  font-weight: 700;
  min-height: 34px;
  padding: 7px 10px;
}

.locale-option[aria-pressed="true"] {
  background: var(--ink);
  border-color: var(--ink);
  color: white;
}
```

- [ ] **Step 6: Run focused verification**

Run:

```powershell
npm run build
$env:CI='1'; npm run test:e2e -- tests/e2e/localization.spec.ts
```

Expected: build passes and localization test passes.

- [ ] **Step 7: Commit auth and shell redesign**

```powershell
& 'C:\Program Files\Git\cmd\git.exe' add src/app/login/page.tsx src/app/dashboard/layout.tsx src/components/dashboard/sidebar.tsx src/components/locale-switcher.tsx src/app/globals.css
& 'C:\Program Files\Git\cmd\git.exe' commit -m "style: redesign auth and dashboard shell"
```

---

### Task 4: Redesign Posts Table And Editor Forms

**Files:**
- Modify: `src/app/dashboard/posts/page.tsx`
- Modify: `src/components/dashboard/post-form.tsx`
- Modify: `src/app/dashboard/posts/upload/page.tsx`
- Modify: `src/app/dashboard/posts/upload/upload-form.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add status chip markup in posts table**

In `src/app/dashboard/posts/page.tsx`, replace:

```tsx
<td>{statusLabel(post.status, translator.locale)}</td>
```

with:

```tsx
<td>
  <span className="status-chip" data-status={post.status}>
    {statusLabel(post.status, translator.locale)}
  </span>
</td>
```

- [ ] **Step 2: Wrap posts table**

Wrap the table with:

```tsx
<div className="table-frame editorial-panel">
  <table className="data-table">
    ...
  </table>
</div>
```

Keep the existing table contents.

- [ ] **Step 3: Update post form grouping**

In `src/components/dashboard/post-form.tsx`, wrap metadata fields and content field:

```tsx
<form action={action} className="stack-form editor-form editorial-panel">
  <fieldset className="form-section">
    <legend>Post metadata</legend>
    ...
  </fieldset>
  <fieldset className="form-section">
    <legend>Manuscript HTML</legend>
    ...
  </fieldset>
  <button type="submit">Save post</button>
</form>
```

Move title, slug, excerpt, and status labels into the first fieldset; move HTML content into the second.

- [ ] **Step 4: Style upload page surface**

In `src/app/dashboard/posts/upload/page.tsx`, wrap existing title and form in:

```tsx
<section className="content-stack">
  ...
</section>
```

In `src/app/dashboard/posts/upload/upload-form.tsx`, add `editorial-panel upload-panel` to the form className.

- [ ] **Step 5: Add table/form CSS**

Append:

```css
.content-stack {
  display: grid;
  gap: 20px;
}

.page-title-row h1,
section > h1 {
  font-size: clamp(2.1rem, 4vw, 3.4rem);
  line-height: 1.04;
  margin: 0;
}

.page-title-row p,
section > p {
  color: var(--muted);
  line-height: 1.65;
}

.table-frame {
  overflow: hidden;
}

.data-table {
  border-collapse: collapse;
  width: 100%;
}

.data-table th {
  background: rgba(237, 243, 239, 0.78);
  color: var(--ink-soft);
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.data-table th,
.data-table td {
  border-bottom: 1px solid var(--line);
  padding: 14px 16px;
  text-align: start;
}

.data-table tr:last-child td {
  border-bottom: 0;
}

.data-table a {
  color: var(--forest-dark);
  font-weight: 800;
}

.stack-form {
  display: grid;
  gap: 18px;
  max-width: 860px;
  padding: 20px;
}

.form-section {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  display: grid;
  gap: 16px;
  margin: 0;
  padding: 16px;
}

.form-section legend {
  color: var(--ink-soft);
  font-weight: 800;
  padding: 0 6px;
}

.stack-form label {
  display: grid;
  gap: 7px;
}

.stack-form label span {
  color: var(--ink-soft);
  font-weight: 800;
}

.stack-form input,
.stack-form select,
.stack-form textarea {
  background: var(--surface-strong);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-sm);
  color: var(--ink);
  padding: 11px 12px;
}

.editor-form textarea {
  font-family: var(--font-mono);
}

.upload-panel {
  max-width: 680px;
}
```

- [ ] **Step 6: Run post/editor verification**

Run:

```powershell
npm run build
$env:CI='1'; npm run test:e2e -- tests/e2e/publishing-flow.spec.ts
```

Expected: build passes and publishing flow passes.

- [ ] **Step 7: Commit posts and forms**

```powershell
& 'C:\Program Files\Git\cmd\git.exe' add src/app/dashboard/posts src/components/dashboard/post-form.tsx src/app/globals.css
& 'C:\Program Files\Git\cmd\git.exe' commit -m "style: redesign publishing desk and editor forms"
```

---

### Task 5: Redesign Export, Settings, Taxonomy, And Preview Surfaces

**Files:**
- Modify: `src/app/dashboard/export/export-button.tsx`
- Modify: `src/app/dashboard/export/page.tsx`
- Modify: `src/app/dashboard/export/[exportId]/preview/page.tsx`
- Modify: `src/components/dashboard/blog-settings-form.tsx`
- Modify: `src/components/dashboard/taxonomy-manager.tsx`
- Modify: `src/app/dashboard/taxonomy/page.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Style export feedback**

In `src/app/dashboard/export/export-button.tsx`, change:

```tsx
<p role="status">
```

to:

```tsx
<p role="status" className="export-success editorial-panel">
```

- [ ] **Step 2: Wrap export table in table-frame**

In `src/app/dashboard/export/page.tsx`, wrap the export table:

```tsx
<div className="table-frame editorial-panel">
  <table className="data-table">
    ...
  </table>
</div>
```

- [ ] **Step 3: Style settings form**

In `src/components/dashboard/blog-settings-form.tsx`, add `editorial-panel` to the form className:

```tsx
<form action={action} className="stack-form editorial-panel">
```

- [ ] **Step 4: Style taxonomy manager**

In `src/components/dashboard/taxonomy-manager.tsx`, add `editorial-panel` classes around category/tag lists and keep form behavior unchanged:

```tsx
<section className="editorial-panel taxonomy-panel">
```

Use this class on both category and tag sections.

- [ ] **Step 5: Style preview page frame**

In `src/app/dashboard/export/[exportId]/preview/page.tsx`, add `editorial-panel` next to `site-preview-frame` container if there is a wrapper; if not, leave iframe class and style it in CSS.

- [ ] **Step 6: Add CSS for export/settings/taxonomy/preview**

Append:

```css
.export-success {
  color: var(--forest-dark);
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0;
  padding: 12px 14px;
}

.taxonomy-grid {
  display: grid;
  gap: 22px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.taxonomy-panel {
  padding: 18px;
}

.inline-form {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.inline-form input {
  background: var(--surface-strong);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
}

.plain-list {
  display: grid;
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.plain-list li {
  align-items: center;
  border-bottom: 1px solid var(--line);
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
}

.future-settings {
  border: 1px dashed var(--line-strong);
  border-radius: var(--radius);
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 16px;
}

.preview-page {
  min-height: calc(100vh - 48px);
}

.site-preview-frame {
  background: white;
  border: 1px solid var(--line-strong);
  border-radius: var(--radius);
  box-shadow: var(--shadow-soft);
  height: min(760px, calc(100vh - 190px));
  width: 100%;
}
```

- [ ] **Step 7: Run export/settings verification**

Run:

```powershell
npm run build
$env:CI='1'; npm run test:e2e -- tests/e2e/publishing-flow.spec.ts
```

Expected: build passes and publishing/export preview flow passes.

- [ ] **Step 8: Commit secondary surfaces**

```powershell
& 'C:\Program Files\Git\cmd\git.exe' add src/app/dashboard/export src/app/dashboard/taxonomy src/components/dashboard/blog-settings-form.tsx src/components/dashboard/taxonomy-manager.tsx src/app/globals.css
& 'C:\Program Files\Git\cmd\git.exe' commit -m "style: redesign export settings and taxonomy surfaces"
```

---

### Task 6: Responsive And RTL Polish

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add responsive CSS**

Append:

```css
@media (max-width: 860px) {
  .dashboard-shell {
    grid-template-columns: 1fr;
  }

  .dashboard-sidebar {
    position: static;
    padding: 16px;
  }

  .dashboard-brand {
    margin-bottom: 14px;
  }

  .dashboard-nav {
    grid-auto-flow: column;
    overflow-x: auto;
    padding-bottom: 4px;
  }

  .dashboard-nav-link {
    white-space: nowrap;
  }

  .dashboard-main {
    padding: 20px 16px 34px;
  }

  .dashboard-header,
  .page-title-row {
    align-items: stretch;
    flex-direction: column;
  }

  .taxonomy-grid {
    grid-template-columns: 1fr;
  }

  .data-table {
    min-width: 720px;
  }

  .table-frame {
    overflow-x: auto;
  }
}

[dir="rtl"] .data-table th,
[dir="rtl"] .data-table td {
  text-align: right;
}

[dir="rtl"] .dashboard-brand,
[dir="rtl"] .dashboard-header,
[dir="rtl"] .page-title-row,
[dir="rtl"] .plain-list li,
[dir="rtl"] .export-success {
  direction: rtl;
}
```

- [ ] **Step 2: Run RTL/localization E2E**

Run:

```powershell
$env:CI='1'; npm run test:e2e -- tests/e2e/localization.spec.ts
```

Expected: Arabic switch changes `html dir` to `rtl`, English changes it back to `ltr`.

- [ ] **Step 3: Run full verification**

Run:

```powershell
npm test
npm run lint
npm run build
$env:CI='1'; npm run test:e2e
```

Expected: all pass.

- [ ] **Step 4: Commit responsive polish**

```powershell
& 'C:\Program Files\Git\cmd\git.exe' add src/app/globals.css
& 'C:\Program Files\Git\cmd\git.exe' commit -m "style: polish editorial studio responsive layout"
```

---

### Task 7: Browser Visual QA And Final Adjustments

**Files:**
- Modify: `src/app/globals.css`
- Modify only if screenshots prove a markup hook is missing: `src/app/dashboard/layout.tsx`, `src/components/dashboard/sidebar.tsx`, `src/app/dashboard/posts/page.tsx`

- [ ] **Step 1: Start local app**

Run:

```powershell
npm run dev
```

If port 3000 is occupied, stop the existing listener or use:

```powershell
npm run dev -- -p 52344
```

- [ ] **Step 2: Capture implementation screenshots**

Use Playwright to capture:

```powershell
@'
const { chromium } = require("@playwright/test");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000/login");
  await page.screenshot({ path: "artifacts/editorial-login.png", fullPage: true });
  await page.getByLabel("Email").fill("admin@example.com");
  await page.getByLabel("Password").fill("admin12345");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/dashboard/posts");
  await page.screenshot({ path: "artifacts/editorial-posts.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://localhost:3000/dashboard/posts");
  await page.screenshot({ path: "artifacts/editorial-posts-mobile.png", fullPage: true });
  await browser.close();
})();
'@ | node -
```

- [ ] **Step 3: Compare against accepted concept**

Use `view_image` on:
- Accepted concept image under `C:\Users\me\.codex\generated_images\019df227-c678-72b3-a162-d30b821d7f3f`
- `artifacts/editorial-posts.png`

Check these points:
- Warm paper background and deep ink/forest sidebar.
- Editorial heading personality.
- Sidebar density and brand treatment.
- Posts table density and status chips.
- Primary action treatment.
- Language switcher visibility.
- No purple gradients or generic SaaS card grid.

- [ ] **Step 4: Apply the visual QA repair checklist**

Apply this fixed repair checklist if any item fails in Step 3:

```css
/* If the sidebar is too flat, increase contrast only here. */
.dashboard-sidebar {
  box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.08);
}

/* If table rows look too loose, tighten only row padding. */
.data-table th,
.data-table td {
  padding-block: 12px;
}

/* If primary actions lack editorial weight, adjust only shadow and color. */
.button-link,
.stack-form button,
.primary-action {
  box-shadow: 0 12px 26px rgba(10, 63, 53, 0.18);
}
```

If a screenshot shows a different mismatch, write the exact selector and fix in the work log before editing. Do not add new features or new copy.

- [ ] **Step 5: Re-run verification after visual fixes**

Run:

```powershell
npm test
npm run lint
npm run build
$env:CI='1'; npm run test:e2e
```

Expected: all pass.

- [ ] **Step 6: Commit final visual QA fixes**

```powershell
& 'C:\Program Files\Git\cmd\git.exe' add src app artifacts
& 'C:\Program Files\Git\cmd\git.exe' commit -m "style: finalize editorial studio redesign"
```

Before committing, avoid adding temporary screenshots unless the project already tracks artifacts. If screenshots are only QA evidence, leave them untracked or delete them.

---

## Self-Review Notes

- Spec coverage: auth, dashboard shell, posts, upload, editor, export, settings, taxonomy, preview, bilingual behavior, and verification are covered.
- Out of scope respected: no GitHub publishing, analytics, WYSIWYG editor, or generated-site redesign.
- The plan preserves current functionality and uses existing Next.js/plain CSS architecture.
- Tests are added before styling-sensitive work where useful, and every task includes verification and commit steps.
