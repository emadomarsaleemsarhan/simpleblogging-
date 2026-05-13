import { directionForLocale, parseLocale, type Locale } from "@/lib/i18n/locales";
import { portableHref } from "./links";

export type StaticTemplateLabels = {
  posts: string;
  home: string;
  categories: string;
  tags: string;
  previous: string;
  next: string;
};

export type StaticTemplatePage = {
  blogName: string;
  locale: Locale;
  currentPath: string;
  title: string;
  description: string;
  canonicalUrl: string;
  body: string;
  previousUrl?: string;
  nextUrl?: string;
  structuredData?: string;
};

export type StaticTemplate = {
  key: string;
  name: string;
  labels: (locale: Locale) => StaticTemplateLabels;
  renderPage: (page: StaticTemplatePage) => string;
};

export type StaticTemplateOption = {
  key: string;
  name: string;
};

const labels: Record<Locale, StaticTemplateLabels> = {
  en: {
    posts: "Posts",
    home: "Home",
    categories: "Categories",
    tags: "Tags",
    previous: "Previous",
    next: "Next",
  },
  ar: {
    posts: "\u0627\u0644\u0645\u0646\u0634\u0648\u0631\u0627\u062a",
    home: "\u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629",
    categories: "\u0627\u0644\u062a\u0635\u0646\u064a\u0641\u0627\u062a",
    tags: "\u0627\u0644\u0648\u0633\u0648\u0645",
    previous: "\u0627\u0644\u0633\u0627\u0628\u0642",
    next: "\u0627\u0644\u062a\u0627\u0644\u064a",
  },
};

function createStaticTemplate(input: { key: string; name: string; rootStyle: string; extraStyle?: string }): StaticTemplate {
  return {
    key: input.key,
    name: input.name,
    labels: (locale) => labels[locale],
    renderPage: (page) => {
      const direction = directionForLocale(page.locale);
      const previous = page.previousUrl ? `<link rel="prev" href="${page.previousUrl}">` : "";
      const next = page.nextUrl ? `<link rel="next" href="${page.nextUrl}">` : "";
      const pageLabels = labels[page.locale];

      return `<!doctype html>
<html lang="${page.locale}" dir="${direction}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(page.title)}</title>
  <meta name="description" content="${escapeHtml(page.description)}">
  <link rel="canonical" href="${page.canonicalUrl}">
  ${previous}
  ${next}
  <meta property="og:title" content="${escapeHtml(page.title)}">
  <meta property="og:description" content="${escapeHtml(page.description)}">
  ${page.structuredData ?? ""}
  <style>
    :root { color-scheme: light; ${input.rootStyle} }
    * { box-sizing: border-box; }
    body { background: var(--paper); color: var(--ink); font-family: var(--font-ui); line-height: 1.72; margin: 0; min-height: 100vh; }
    body::before { background: linear-gradient(135deg, rgba(15, 111, 92, 0.07), transparent 34%), radial-gradient(circle at 86% 0%, rgba(201, 132, 43, 0.12), transparent 30%); content: ""; inset: 0; pointer-events: none; position: fixed; z-index: -1; }
    a { color: inherit; }
    .reading-progress { background: var(--paper-deep); height: 4px; position: sticky; top: 0; z-index: 3; }
    .reading-progress span { background: var(--forest); display: block; height: 100%; width: 33%; }
    .static-masthead { background: rgba(255, 253, 248, 0.94); border-bottom: 2px solid var(--ink); color: var(--ink); }
    .static-masthead-inner { align-items: center; display: flex; gap: 18px; justify-content: space-between; margin: 0 auto; max-width: 1120px; padding: 22px 24px; }
    .static-brand { align-items: center; display: inline-flex; font-family: var(--font-display); font-size: clamp(1.7rem, 4vw, 2.7rem); font-weight: 900; gap: 12px; line-height: 1; text-decoration: none; }
    .static-brand::before { align-items: center; background: var(--amber); border-radius: var(--radius-sm); color: #23180b; content: "BP"; display: inline-flex; font-family: var(--font-ui); font-size: 0.78rem; height: 36px; justify-content: center; width: 36px; }
    .static-nav { display: flex; flex-wrap: wrap; gap: 10px; }
    .static-nav a { border: 1px solid var(--line-strong); border-radius: var(--radius-sm); color: var(--ink-soft); font-weight: 900; padding: 8px 11px; text-decoration: none; }
    .static-nav a:hover { background: var(--ink); border-color: var(--ink); color: white; }
    .static-main { margin: 0 auto; max-width: 1120px; padding: 46px 24px 72px; }
    h1, h2, h3 { font-family: var(--font-display); letter-spacing: 0; line-height: 1.08; }
    h1 { font-size: clamp(2.5rem, 6vw, 4.8rem); margin: 0 0 22px; max-width: 900px; }
    h2 { font-size: 2rem; margin-top: 2.1em; }
    p { color: var(--ink-soft); }
    article { background: rgba(255, 253, 248, 0.72); border-top: 1px solid var(--line); font-size: 1.08rem; margin: 0 auto; max-width: 820px; padding: 30px 0; }
    article > :first-child { margin-top: 0; }
    article a, .post-list a { color: var(--forest-dark); font-weight: 800; text-decoration: underline; text-underline-offset: 4px; }
    img, table { max-width: 100%; }
    img { border-radius: var(--radius); height: auto; }
    table { border-collapse: collapse; margin: 24px 0; width: 100%; }
    th { background: var(--mist); color: var(--ink-soft); }
    th, td { border: 1px solid var(--line); padding: 10px 12px; text-align: start; }
    .post-list { display: grid; gap: 12px; list-style: none; margin: 26px 0 0; padding: 0; }
    .post-list li { background: rgba(255, 253, 248, 0.86); border: 1px solid var(--line); border-radius: var(--radius); box-shadow: var(--shadow-tight); padding: 18px 20px; }
    .pagination { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 32px; }
    .pagination a, .pagination span { border: 1px solid var(--line-strong); border-radius: var(--radius-sm); padding: 8px 11px; text-decoration: none; }
    .pagination [aria-current="page"] { background: var(--forest); color: white; }
    [dir="rtl"] body { text-align: start; }
    [dir="rtl"] .static-masthead-inner { direction: rtl; }
    [dir="rtl"] article { direction: rtl; }
    @media (max-width: 720px) {
      .static-masthead-inner { align-items: flex-start; flex-direction: column; padding: 18px 16px; }
      .static-main { padding: 32px 16px 50px; }
      article { padding: 22px 0; }
    }
    ${input.extraStyle ?? ""}
  </style>
</head>
<body data-template="${input.key}">
  <div class="reading-progress" aria-hidden="true"><span></span></div>
  <header class="static-masthead">
    <div class="static-masthead-inner">
      <a class="static-brand" href="${portableHref(page.currentPath, "/")}">${escapeHtml(page.blogName)}</a>
      <nav class="static-nav" aria-label="Primary">
        <a href="${portableHref(page.currentPath, "/")}">${escapeHtml(pageLabels.home)}</a>
        <a href="${portableHref(page.currentPath, "/blog/")}">${escapeHtml(pageLabels.posts)}</a>
      </nav>
    </div>
  </header>
  <main class="static-main">${page.body}</main>
</body>
</html>`;
    },
  };
}

export const editorialStaticTemplate = createStaticTemplate({
  key: "editorial",
  name: "Editorial",
  rootStyle: `
    --font-display: Georgia, 'Times New Roman', serif;
    --font-ui: 'Segoe UI', Tahoma, Arial, sans-serif;
    --paper: #f6f1e7;
    --paper-deep: #ede4d3;
    --surface: #fffdf8;
    --ink: #16231f;
    --ink-soft: #31413b;
    --muted: #68766f;
    --line: #ded5c5;
    --line-strong: #c9bda9;
    --forest: #0f6f5c;
    --forest-dark: #0a3f35;
    --amber: #c9842b;
    --mist: #edf3ef;
    --shadow-soft: 0 18px 48px rgba(22, 35, 31, 0.09);
    --shadow-tight: 0 10px 24px rgba(22, 35, 31, 0.10);
    --radius: 8px;
    --radius-sm: 6px;
  `,
  extraStyle: `
    main > h1:first-child { border-bottom: 1px solid var(--line); padding-bottom: 18px; }
  `,
});

export const defaultStaticTemplate = editorialStaticTemplate;

const legacyDefaultTemplate: StaticTemplateOption = {
  key: "default",
  name: "Default (Editorial)",
};

const templates = [editorialStaticTemplate];

export const staticTemplateOptions: StaticTemplateOption[] = [
  { key: editorialStaticTemplate.key, name: "Editorial" },
  legacyDefaultTemplate,
];

export function getStaticTemplate(key: string | undefined | null): StaticTemplate {
  return templates.find((template) => template.key === key) ?? defaultStaticTemplate;
}

export function parseTemplateKey(value: string | undefined | null) {
  return getStaticTemplate(value).key;
}

export function getStaticLocale(value: string | undefined | null): Locale {
  return parseLocale(value);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
