import { directionForLocale, parseLocale, type Locale } from "@/lib/i18n/locales";

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
    body { margin: 0; }
    a { color: inherit; }
    .site-header { border-bottom: 1px solid #d9dee5; background: white; }
    .site-header-inner { align-items: center; display: flex; justify-content: space-between; margin: 0 auto; max-width: 1040px; padding: 18px 24px; }
    .brand { font-weight: 700; text-decoration: none; }
    .site-nav { display: flex; gap: 16px; }
    .site-nav a { color: #52616b; text-decoration: none; }
    main { margin: 0 auto; max-width: 1040px; padding: 36px 24px 56px; }
    article { max-width: 760px; }
    img, table { max-width: 100%; }
    table { border-collapse: collapse; }
    th, td { border: 1px solid #d9dee5; padding: 8px; }
    .post-list { display: grid; gap: 12px; list-style: none; padding: 0; }
    .post-list a { font-weight: 700; }
    .pagination { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 32px; }
    .pagination a, .pagination span { border: 1px solid #c9d1d9; border-radius: 6px; padding: 8px 11px; text-decoration: none; }
    .pagination [aria-current="page"] { background: #1f2933; color: white; }
    .reading-progress { background: #d9dee5; height: 4px; position: sticky; top: 0; }
    .reading-progress span { background: #1f6feb; display: block; height: 100%; width: 33%; }
    ${input.extraStyle ?? ""}
  </style>
</head>
<body data-template="${input.key}">
  <div class="reading-progress" aria-hidden="true"><span></span></div>
  <header class="site-header">
    <div class="site-header-inner">
      <a class="brand" href="/">${escapeHtml(page.blogName)}</a>
      <nav class="site-nav" aria-label="Primary">
        <a href="/">${escapeHtml(pageLabels.home)}</a>
        <a href="/blog/">${escapeHtml(pageLabels.posts)}</a>
      </nav>
    </div>
  </header>
  <main>${page.body}</main>
</body>
</html>`;
  },
};
}

export const defaultStaticTemplate = createStaticTemplate({
  key: "default",
  name: "Default",
  rootStyle: "font-family: Arial, Helvetica, sans-serif; background: #f8f8f4; color: #1f2933;",
});

export const editorialStaticTemplate = createStaticTemplate({
  key: "editorial",
  name: "Editorial",
  rootStyle: "font-family: Georgia, 'Times New Roman', serif; background: #fbfbf8; color: #172026;",
  extraStyle: `
    .site-header { border-bottom: 2px solid #172026; }
    .brand { font-size: 1.25rem; letter-spacing: 0.03em; text-transform: uppercase; }
    main { max-width: 900px; }
    article { font-size: 1.08rem; line-height: 1.75; }
    h1 { font-size: 2.4rem; line-height: 1.1; }
  `,
});

const templates = [defaultStaticTemplate, editorialStaticTemplate];

export const staticTemplateOptions: StaticTemplateOption[] = templates.map((template) => ({
  key: template.key,
  name: template.name,
}));

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
