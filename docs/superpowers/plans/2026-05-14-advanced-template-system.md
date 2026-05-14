# Advanced Template System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Phase 2.1 template system with three static site templates, per-blog theme settings, settings UI controls, and export preview support.

**Architecture:** Store compact theme fields on `Blog`, validate all submitted template settings before saving, and pass a normalized `StaticTheme` object through static rendering. The template renderer remains database-free; generated HTML carries CSS variables and template markers so ZIP exports, previews, and later GitHub publishing consume the same output.

**Tech Stack:** Next.js App Router, Prisma/Postgres, TypeScript, React server actions, Vitest, Playwright.

---

## File Structure

- Modify `prisma/schema.prisma`: add theme fields to `Blog`.
- Create `prisma/migrations/20260514000000_add_blog_theme_settings/migration.sql`: add nullable-safe defaults for Render Postgres and local databases.
- Modify `src/lib/static/templates.ts`: define `StaticTheme`, validation helpers, three template definitions, and themed CSS variable rendering.
- Modify `src/lib/static/render.ts`: extend `StaticBlog` with theme fields and pass normalized theme into templates.
- Modify `src/lib/static/site-generator.ts`: continue using `StaticBlog`; no database access added.
- Modify `src/app/dashboard/settings/page.tsx`: parse and save template theme fields.
- Modify `src/components/dashboard/blog-settings-form.tsx`: replace the plain template select with template cards, color controls, heading style select, and saved preview link.
- Modify `src/lib/i18n/locales.ts`: add bilingual labels for the template system.
- Modify `src/app/globals.css`: style the settings template cards and theme controls in the existing Editorial Studio style.
- Modify `tests/unit/static-generator.test.ts`: verify selected templates and CSS variables appear in generated HTML.
- Create `tests/unit/templates.test.ts`: verify template key, heading style, and hex color parsing.
- Modify `tests/unit/settings.test.ts`: verify settings validation accepts valid theme values and rejects unsafe colors.
- Modify `tests/e2e/publishing-flow.spec.ts`: verify the settings page exposes all templates and exported preview uses the saved template.

---

### Task 1: Data Model And Prisma Migration

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260514000000_add_blog_theme_settings/migration.sql`

- [ ] **Step 1: Add theme fields to the Prisma schema**

In `prisma/schema.prisma`, update the `Blog` model so this block:

```prisma
  locale      String       @default("en")
  templateKey String       @default("editorial")
  ownerId     String       @unique
```

becomes:

```prisma
  locale               String       @default("en")
  templateKey          String       @default("editorial")
  themePrimaryColor    String       @default("#0f6f5c")
  themeSecondaryColor  String       @default("#c9842b")
  themeBackgroundColor String       @default("#f6f1e7")
  themeHeadingStyle    String       @default("classic")
  ownerId              String       @unique
```

- [ ] **Step 2: Create the SQL migration**

Create `prisma/migrations/20260514000000_add_blog_theme_settings/migration.sql` with exactly:

```sql
ALTER TABLE "Blog"
  ADD COLUMN "themePrimaryColor" TEXT NOT NULL DEFAULT '#0f6f5c',
  ADD COLUMN "themeSecondaryColor" TEXT NOT NULL DEFAULT '#c9842b',
  ADD COLUMN "themeBackgroundColor" TEXT NOT NULL DEFAULT '#f6f1e7',
  ADD COLUMN "themeHeadingStyle" TEXT NOT NULL DEFAULT 'classic';
```

- [ ] **Step 3: Generate Prisma client**

Run:

```bash
npm run prisma:generate
```

Expected: command exits with code `0` and Prisma Client generation completes.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/20260514000000_add_blog_theme_settings/migration.sql
git commit -m "feat: add blog theme settings"
```

---

### Task 2: Template Theme Parsing And Static Renderers

**Files:**
- Modify: `src/lib/static/templates.ts`
- Modify: `src/lib/static/render.ts`
- Test: `tests/unit/templates.test.ts`
- Test: `tests/unit/static-generator.test.ts`

- [ ] **Step 1: Write unit tests for template parsing**

Create `tests/unit/templates.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  defaultStaticTheme,
  getStaticTemplate,
  normalizeStaticTheme,
  parseHeadingStyle,
  parseTemplateKey,
  parseThemeColor,
  staticTemplateOptions,
} from "../../src/lib/static/templates";

describe("static templates", () => {
  it("exposes the built-in templates", () => {
    expect(staticTemplateOptions.map((template) => template.key)).toEqual(["editorial", "minimal", "magazine"]);
  });

  it("falls back to editorial for unknown template keys", () => {
    expect(parseTemplateKey("unknown")).toBe("editorial");
    expect(getStaticTemplate("unknown").key).toBe("editorial");
  });

  it("validates hex theme colors", () => {
    expect(parseThemeColor("#abc", "#000000")).toBe("#abc");
    expect(parseThemeColor("#aabbcc", "#000000")).toBe("#aabbcc");
    expect(parseThemeColor("red", "#000000")).toBe("#000000");
    expect(parseThemeColor("url(javascript:alert(1))", "#000000")).toBe("#000000");
  });

  it("validates heading styles", () => {
    expect(parseHeadingStyle("classic")).toBe("classic");
    expect(parseHeadingStyle("modern")).toBe("modern");
    expect(parseHeadingStyle("bold")).toBe("bold");
    expect(parseHeadingStyle("script")).toBe("classic");
  });

  it("normalizes missing theme fields", () => {
    expect(normalizeStaticTheme({})).toEqual(defaultStaticTheme);
  });
});
```

- [ ] **Step 2: Run the new test to verify it fails**

Run:

```bash
npm test -- tests/unit/templates.test.ts
```

Expected: fails because the new exports do not exist and only one template is exposed.

- [ ] **Step 3: Implement template theme types and validators**

In `src/lib/static/templates.ts`, add these exports near the top:

```ts
export type StaticTemplateKey = "editorial" | "minimal" | "magazine";
export type HeadingStyle = "classic" | "modern" | "bold";

export type StaticThemeInput = {
  themePrimaryColor?: string | null;
  themeSecondaryColor?: string | null;
  themeBackgroundColor?: string | null;
  themeHeadingStyle?: string | null;
};

export type StaticTheme = {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  headingStyle: HeadingStyle;
};

export const defaultStaticTheme: StaticTheme = {
  primaryColor: "#0f6f5c",
  secondaryColor: "#c9842b",
  backgroundColor: "#f6f1e7",
  headingStyle: "classic",
};

const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function parseThemeColor(value: string | undefined | null, fallback: string) {
  const color = String(value ?? "").trim();
  return HEX_COLOR_PATTERN.test(color) ? color : fallback;
}

export function parseHeadingStyle(value: string | undefined | null): HeadingStyle {
  return value === "modern" || value === "bold" || value === "classic" ? value : "classic";
}

export function normalizeStaticTheme(input: StaticThemeInput): StaticTheme {
  return {
    primaryColor: parseThemeColor(input.themePrimaryColor, defaultStaticTheme.primaryColor),
    secondaryColor: parseThemeColor(input.themeSecondaryColor, defaultStaticTheme.secondaryColor),
    backgroundColor: parseThemeColor(input.themeBackgroundColor, defaultStaticTheme.backgroundColor),
    headingStyle: parseHeadingStyle(input.themeHeadingStyle),
  };
}
```

- [ ] **Step 4: Change template rendering to accept theme**

Update `StaticTemplatePage` in `src/lib/static/templates.ts` to include:

```ts
  theme: StaticTheme;
```

Update `StaticTemplate` so `key` is typed:

```ts
export type StaticTemplate = {
  key: StaticTemplateKey;
  name: string;
  description: string;
  labels: (locale: Locale) => StaticTemplateLabels;
  renderPage: (page: StaticTemplatePage) => string;
};
```

Update `StaticTemplateOption`:

```ts
export type StaticTemplateOption = {
  key: StaticTemplateKey;
  name: string;
  description: string;
};
```

- [ ] **Step 5: Add themed CSS variables**

In `src/lib/static/templates.ts`, add:

```ts
function headingVariables(style: HeadingStyle) {
  if (style === "modern") {
    return "--heading-font: 'Segoe UI', Tahoma, Arial, sans-serif; --heading-weight: 850;";
  }
  if (style === "bold") {
    return "--heading-font: Georgia, 'Times New Roman', serif; --heading-weight: 950;";
  }
  return "--heading-font: Georgia, 'Times New Roman', serif; --heading-weight: 850;";
}

function themeVariables(theme: StaticTheme) {
  return `
    --theme-primary: ${theme.primaryColor};
    --theme-secondary: ${theme.secondaryColor};
    --theme-background: ${theme.backgroundColor};
    ${headingVariables(theme.headingStyle)}
  `;
}
```

Inside the rendered `<style>`, place `${themeVariables(page.theme)}` inside `:root`, set `--paper: var(--theme-background);`, `--forest: var(--theme-primary);`, `--amber: var(--theme-secondary);`, and set heading rules to:

```css
h1, h2, h3 { font-family: var(--heading-font); font-weight: var(--heading-weight); letter-spacing: 0; line-height: 1.08; }
```

- [ ] **Step 6: Add the three template definitions**

Replace the existing `templates` and `staticTemplateOptions` section with:

```ts
export const minimalStaticTemplate = createStaticTemplate({
  key: "minimal",
  name: "Minimal",
  description: "A quiet reading-first template with narrow content and restrained navigation.",
  rootStyle: `
    --font-display: Georgia, 'Times New Roman', serif;
    --font-ui: 'Segoe UI', Tahoma, Arial, sans-serif;
    --paper: var(--theme-background);
    --paper-deep: color-mix(in srgb, var(--theme-background) 88%, #111 12%);
    --surface: #ffffff;
    --ink: #16231f;
    --ink-soft: #33423d;
    --muted: #6a746f;
    --line: rgba(22, 35, 31, 0.16);
    --line-strong: rgba(22, 35, 31, 0.26);
    --forest: var(--theme-primary);
    --forest-dark: var(--theme-primary);
    --amber: var(--theme-secondary);
    --mist: rgba(15, 111, 92, 0.08);
    --shadow-soft: none;
    --shadow-tight: none;
    --radius: 4px;
    --radius-sm: 4px;
  `,
  extraStyle: `
    body::before { display: none; }
    .static-masthead { border-bottom: 1px solid var(--line); }
    .static-brand::before { display: none; }
    .static-main, .static-masthead-inner { max-width: 860px; }
    article { background: transparent; max-width: 720px; }
    .post-list li { background: transparent; box-shadow: none; }
  `,
});

export const magazineStaticTemplate = createStaticTemplate({
  key: "magazine",
  name: "Magazine",
  description: "A denser publication template for active blogs with stronger lists and taxonomy pages.",
  rootStyle: `
    --font-display: Georgia, 'Times New Roman', serif;
    --font-ui: 'Segoe UI', Tahoma, Arial, sans-serif;
    --paper: var(--theme-background);
    --paper-deep: color-mix(in srgb, var(--theme-background) 82%, #111 18%);
    --surface: #fffdf8;
    --ink: #17211e;
    --ink-soft: #2d3935;
    --muted: #69766f;
    --line: rgba(23, 33, 30, 0.18);
    --line-strong: rgba(23, 33, 30, 0.34);
    --forest: var(--theme-primary);
    --forest-dark: var(--theme-primary);
    --amber: var(--theme-secondary);
    --mist: rgba(201, 132, 43, 0.14);
    --shadow-soft: 0 18px 42px rgba(22, 35, 31, 0.10);
    --shadow-tight: 0 10px 22px rgba(22, 35, 31, 0.11);
    --radius: 6px;
    --radius-sm: 4px;
  `,
  extraStyle: `
    .static-masthead { border-bottom-width: 3px; }
    .static-brand { text-transform: uppercase; }
    .static-main { max-width: 1220px; }
    .post-list { grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
    .post-list li { border-top: 5px solid var(--amber); min-height: 128px; }
  `,
});

const templates = [editorialStaticTemplate, minimalStaticTemplate, magazineStaticTemplate];

export const staticTemplateOptions: StaticTemplateOption[] = templates.map((template) => ({
  key: template.key,
  name: template.name,
  description: template.description,
}));
```

Also add `description` to `editorialStaticTemplate`:

```ts
description: "The default Publisher OS editorial template with a warm masthead and strong article rhythm.",
```

- [ ] **Step 7: Update render.ts to pass theme**

In `src/lib/static/render.ts`, extend `StaticBlog`:

```ts
export type StaticBlog = {
  name: string;
  baseUrl: string;
  locale?: string;
  templateKey?: string;
  themePrimaryColor?: string | null;
  themeSecondaryColor?: string | null;
  themeBackgroundColor?: string | null;
  themeHeadingStyle?: string | null;
};
```

Import `normalizeStaticTheme`:

```ts
import { getStaticLocale, getStaticTemplate, normalizeStaticTheme } from "./templates";
```

Pass the theme into `template.renderPage`:

```ts
theme: normalizeStaticTheme(input.blog),
```

- [ ] **Step 8: Extend static generator tests**

In `tests/unit/static-generator.test.ts`, add:

```ts
  it("applies selected template and theme variables to generated HTML", async () => {
    const outputDir = path.join(process.cwd(), ".tmp/static-themed-template-test");
    await fs.rm(outputDir, { recursive: true, force: true });

    await generateStaticSite({
      blog: {
        name: "My Blog",
        baseUrl: "https://example.com",
        locale: "en",
        templateKey: "magazine",
        themePrimaryColor: "#123456",
        themeSecondaryColor: "#abcdef",
        themeBackgroundColor: "#fafafa",
        themeHeadingStyle: "bold",
      },
      posts: [],
      outputDir,
    });

    const html = await fs.readFile(path.join(outputDir, "index.html"), "utf8");
    expect(html).toContain('data-template="magazine"');
    expect(html).toContain("--theme-primary: #123456");
    expect(html).toContain("--theme-secondary: #abcdef");
    expect(html).toContain("--theme-background: #fafafa");
    expect(html).toContain("--heading-weight: 950");
  });
```

- [ ] **Step 9: Run unit tests**

Run:

```bash
npm test -- tests/unit/templates.test.ts tests/unit/static-generator.test.ts
```

Expected: both files pass.

- [ ] **Step 10: Commit**

```bash
git add src/lib/static/templates.ts src/lib/static/render.ts tests/unit/templates.test.ts tests/unit/static-generator.test.ts
git commit -m "feat: add themed static templates"
```

---

### Task 3: Settings Validation And Save Flow

**Files:**
- Modify: `src/app/dashboard/settings/page.tsx`
- Modify: `tests/unit/settings.test.ts`

- [ ] **Step 1: Inspect the existing settings tests**

Run:

```bash
Get-Content tests/unit/settings.test.ts
```

Expected: the file shows existing tests for `normalizeBaseUrl` or settings helpers.

- [ ] **Step 2: Add save-time parsers in settings page**

In `src/app/dashboard/settings/page.tsx`, update imports:

```ts
import { normalizeStaticTheme, parseTemplateKey, staticTemplateOptions } from "@/lib/static/templates";
```

Inside `updateSettings`, after reading `templateKey`, add:

```ts
    const theme = normalizeStaticTheme({
      themePrimaryColor: String(formData.get("themePrimaryColor") ?? ""),
      themeSecondaryColor: String(formData.get("themeSecondaryColor") ?? ""),
      themeBackgroundColor: String(formData.get("themeBackgroundColor") ?? ""),
      themeHeadingStyle: String(formData.get("themeHeadingStyle") ?? ""),
    });
```

Update the `db.blog.update` data:

```ts
        themePrimaryColor: theme.primaryColor,
        themeSecondaryColor: theme.secondaryColor,
        themeBackgroundColor: theme.backgroundColor,
        themeHeadingStyle: theme.headingStyle,
```

- [ ] **Step 3: Pass theme fields to the form**

In the `BlogSettingsForm` props in `src/app/dashboard/settings/page.tsx`, pass:

```ts
        blog={{
          name: blog.name,
          slug: blog.slug,
          baseUrl: blog.baseUrl,
          locale: blog.locale,
          templateKey: blog.templateKey,
          themePrimaryColor: blog.themePrimaryColor,
          themeSecondaryColor: blog.themeSecondaryColor,
          themeBackgroundColor: blog.themeBackgroundColor,
          themeHeadingStyle: blog.themeHeadingStyle,
        }}
```

- [ ] **Step 4: Run focused tests**

Run:

```bash
npm test -- tests/unit/settings.test.ts tests/unit/templates.test.ts
```

Expected: both files pass after generated Prisma types are current.

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/settings/page.tsx tests/unit/settings.test.ts
git commit -m "feat: save blog theme settings"
```

---

### Task 4: Settings UI For Template Cards And Theme Controls

**Files:**
- Modify: `src/components/dashboard/blog-settings-form.tsx`
- Modify: `src/lib/i18n/locales.ts`
- Modify: `src/app/globals.css`
- Test: `tests/e2e/publishing-flow.spec.ts`

- [ ] **Step 1: Add bilingual locale keys**

In `src/lib/i18n/locales.ts`, add these keys to `MessageKey`:

```ts
  | "settings.templatesSection"
  | "settings.themePrimaryColor"
  | "settings.themeSecondaryColor"
  | "settings.themeBackgroundColor"
  | "settings.headingStyle"
  | "settings.headingClassic"
  | "settings.headingModern"
  | "settings.headingBold"
  | "settings.previewSavedTemplate"
```

Add English messages:

```ts
    "settings.templatesSection": "Templates",
    "settings.themePrimaryColor": "Primary color",
    "settings.themeSecondaryColor": "Accent color",
    "settings.themeBackgroundColor": "Background color",
    "settings.headingStyle": "Heading style",
    "settings.headingClassic": "Classic",
    "settings.headingModern": "Modern",
    "settings.headingBold": "Bold",
    "settings.previewSavedTemplate": "Preview saved template",
```

Add Arabic messages:

```ts
    "settings.templatesSection": "\u0627\u0644\u0642\u0648\u0627\u0644\u0628",
    "settings.themePrimaryColor": "\u0627\u0644\u0644\u0648\u0646 \u0627\u0644\u0631\u0626\u064a\u0633\u064a",
    "settings.themeSecondaryColor": "\u0644\u0648\u0646 \u0627\u0644\u062a\u0645\u064a\u064a\u0632",
    "settings.themeBackgroundColor": "\u0644\u0648\u0646 \u0627\u0644\u062e\u0644\u0641\u064a\u0629",
    "settings.headingStyle": "\u0646\u0645\u0637 \u0627\u0644\u0639\u0646\u0627\u0648\u064a\u0646",
    "settings.headingClassic": "\u0643\u0644\u0627\u0633\u064a\u0643\u064a",
    "settings.headingModern": "\u062d\u062f\u064a\u062b",
    "settings.headingBold": "\u062c\u0631\u064a\u0621",
    "settings.previewSavedTemplate": "\u0645\u0639\u0627\u064a\u0646\u0629 \u0627\u0644\u0642\u0627\u0644\u0628 \u0627\u0644\u0645\u062d\u0641\u0648\u0638",
```

- [ ] **Step 2: Extend form prop types**

In `src/components/dashboard/blog-settings-form.tsx`, update the `blog` prop type:

```ts
  blog: {
    name: string;
    slug: string;
    baseUrl: string;
    locale: string;
    templateKey: string;
    themePrimaryColor: string;
    themeSecondaryColor: string;
    themeBackgroundColor: string;
    themeHeadingStyle: string;
  };
```

Update `labels` with the locale keys from Step 1. Update `templates`:

```ts
  templates: { key: string; name: string; description: string }[];
```

- [ ] **Step 3: Replace the plain template select with cards**

Replace the existing `.template-choice-field` block with:

```tsx
      <section className="template-settings-block" aria-labelledby="template-settings-title">
        <div className="settings-section-heading">
          <h2 id="template-settings-title">{labels.templatesSection}</h2>
          <p>{labels.templateHelp}</p>
        </div>
        <div className="template-card-grid">
          {templates.map((template) => (
            <label className="template-card-option" key={template.key}>
              <input
                name="templateKey"
                type="radio"
                value={template.key}
                defaultChecked={blog.templateKey === template.key}
              />
              <span className={`template-preview-swatch template-preview-${template.key}`} aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <strong>{template.name}</strong>
              <small>{template.description}</small>
            </label>
          ))}
        </div>
        <div className="theme-control-grid">
          <label>
            <span>{labels.themePrimaryColor}</span>
            <input name="themePrimaryColor" type="color" defaultValue={blog.themePrimaryColor} />
          </label>
          <label>
            <span>{labels.themeSecondaryColor}</span>
            <input name="themeSecondaryColor" type="color" defaultValue={blog.themeSecondaryColor} />
          </label>
          <label>
            <span>{labels.themeBackgroundColor}</span>
            <input name="themeBackgroundColor" type="color" defaultValue={blog.themeBackgroundColor} />
          </label>
          <label>
            <span>{labels.headingStyle}</span>
            <select name="themeHeadingStyle" defaultValue={blog.themeHeadingStyle}>
              <option value="classic">{labels.headingClassic}</option>
              <option value="modern">{labels.headingModern}</option>
              <option value="bold">{labels.headingBold}</option>
            </select>
          </label>
        </div>
        <a className="button-link secondary-link" href="/dashboard/export">
          {labels.previewSavedTemplate}
        </a>
      </section>
```

- [ ] **Step 4: Pass the new labels from settings page**

In `src/app/dashboard/settings/page.tsx`, add each Step 1 label in the `labels` prop using `translator.t("...")`.

- [ ] **Step 5: Add CSS for the new controls**

In `src/app/globals.css`, add:

```css
.template-settings-block {
  border: 1px solid rgba(25, 35, 32, 0.14);
  border-radius: 8px;
  display: grid;
  gap: 18px;
  padding: 20px;
}

.settings-section-heading h2 {
  font-size: 1.2rem;
  margin: 0;
}

.settings-section-heading p {
  margin: 6px 0 0;
}

.template-card-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
}

.template-card-option {
  border: 1px solid rgba(25, 35, 32, 0.18);
  border-radius: 8px;
  cursor: pointer;
  display: grid;
  gap: 10px;
  padding: 14px;
}

.template-card-option:has(input:checked) {
  border-color: #0f6f5c;
  box-shadow: 0 0 0 3px rgba(15, 111, 92, 0.16);
}

.template-card-option input {
  height: 1px;
  opacity: 0;
  position: absolute;
  width: 1px;
}

.template-preview-swatch {
  background: #f6f1e7;
  border: 1px solid rgba(25, 35, 32, 0.16);
  border-radius: 6px;
  display: grid;
  gap: 5px;
  min-height: 86px;
  padding: 12px;
}

.template-preview-swatch span {
  background: #0f6f5c;
  border-radius: 999px;
  display: block;
  height: 8px;
}

.template-preview-swatch span:first-child {
  background: #16231f;
  height: 16px;
  width: 72%;
}

.template-preview-swatch span:last-child {
  background: #c9842b;
  width: 46%;
}

.template-preview-minimal {
  background: #ffffff;
}

.template-preview-magazine {
  grid-template-columns: 1fr 1fr;
}

.template-preview-magazine span:first-child {
  grid-column: 1 / -1;
}

.theme-control-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.theme-control-grid input[type="color"] {
  min-height: 44px;
  padding: 4px;
}
```

- [ ] **Step 6: Add e2e coverage**

In `tests/e2e/publishing-flow.spec.ts`, add inside the existing publishing flow after login:

```ts
  await page.goto("/dashboard/settings");
  await expect(page.getByText("Editorial")).toBeVisible();
  await expect(page.getByText("Minimal")).toBeVisible();
  await expect(page.getByText("Magazine")).toBeVisible();
  await page.getByLabel("Magazine").check();
  await page.getByLabel("Primary color").fill("#123456");
  await page.getByLabel("Accent color").fill("#abcdef");
  await page.getByLabel("Background color").fill("#fafafa");
  await page.getByLabel("Heading style").selectOption("bold");
  await page.getByRole("button", { name: "Save settings" }).click();
```

- [ ] **Step 7: Run focused tests**

Run:

```bash
npm test -- tests/unit/templates.test.ts
npm run test:e2e -- tests/e2e/publishing-flow.spec.ts
```

Expected: unit test passes and Playwright verifies settings controls and export preview.

- [ ] **Step 8: Commit**

```bash
git add src/components/dashboard/blog-settings-form.tsx src/app/dashboard/settings/page.tsx src/lib/i18n/locales.ts src/app/globals.css tests/e2e/publishing-flow.spec.ts
git commit -m "feat: add template settings interface"
```

---

### Task 5: Verification, Build, And Render Readiness

**Files:**
- Modify only if verification reveals a concrete failing file.

- [ ] **Step 1: Run full unit suite**

Run:

```bash
npm test
```

Expected: all Vitest files pass.

- [ ] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected: Next.js build exits with code `0`.

- [ ] **Step 3: Run Prisma migration locally if a local database is available**

Run:

```bash
npm run prisma:migrate
```

Expected: the migration is applied to the local database. If local `DATABASE_URL` points to Render, stop and use `npm run prisma:migrate:deploy` only during deployment.

- [ ] **Step 4: Check working tree**

Run:

```bash
git status --short
```

Expected: no unstaged implementation changes remain.

- [ ] **Step 5: Commit verification fixes if any were needed**

If Step 1 or Step 2 required edits, commit them:

```bash
git add <changed-files>
git commit -m "fix: stabilize template system"
```

If no edits were needed, do not create an empty commit.

---

## Self-Review Notes

- Spec coverage: data fields, three built-in templates, CSS theme variables, settings UI, preview/export reuse, domainless output preservation, Arabic and English labels, and tests are all mapped to tasks.
- Red-flag scan: this plan avoids deferred implementation markers and gives concrete file paths, commands, and code snippets for every code-changing task.
- Type consistency: `themePrimaryColor`, `themeSecondaryColor`, `themeBackgroundColor`, and `themeHeadingStyle` are used consistently from Prisma through `StaticBlog`, form fields, and static rendering.
