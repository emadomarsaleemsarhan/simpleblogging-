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
  | "auth.signingIn"
  | "auth.email"
  | "auth.password"
  | "auth.invalidLogin"
  | "auth.subtitle"
  | "posts.title"
  | "posts.subtitle"
  | "posts.upload"
  | "posts.uncategorized"
  | "posts.empty"
  | "table.title"
  | "table.slug"
  | "table.category"
  | "table.status"
  | "table.updated"
  | "upload.title"
  | "upload.subtitle"
  | "export.title"
  | "export.preview"
  | "export.downloadZip"
  | "export.description"
  | "export.recent"
  | "export.status"
  | "export.updated"
  | "export.unavailable"
  | "export.empty"
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
    "auth.signingIn": "Signing in...",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.invalidLogin": "Invalid email or password.",
    "auth.subtitle": "Manage Word imports, review posts, and export your static blog.",
    "posts.title": "Posts",
    "posts.subtitle": "Review converted Word posts and manage publishing status.",
    "posts.upload": "Upload Word",
    "posts.uncategorized": "Uncategorized",
    "posts.empty": "No posts yet.",
    "table.title": "Title",
    "table.slug": "Slug",
    "table.category": "Category",
    "table.status": "Status",
    "table.updated": "Updated",
    "upload.title": "Upload Word",
    "upload.subtitle": "Convert a `.docx` file into a draft post for review.",
    "export.title": "Export",
    "export.preview": "Preview Website",
    "export.downloadZip": "Download ZIP",
    "export.description": "Generate a static website ZIP for the published posts in this blog.",
    "export.recent": "Recent exports",
    "export.status": "Status",
    "export.updated": "Updated",
    "export.unavailable": "Unavailable",
    "export.empty": "No exports yet.",
    "settings.title": "Settings",
    "settings.siteLanguage": "Published site language",
    "common.save": "Save",
  },
  ar: {
    "nav.posts": "\u0627\u0644\u0645\u0646\u0634\u0648\u0631\u0627\u062a",
    "nav.upload": "\u0631\u0641\u0639 Word",
    "nav.taxonomy": "\u0627\u0644\u062a\u0635\u0646\u064a\u0641\u0627\u062a \u0648\u0627\u0644\u0648\u0633\u0648\u0645",
    "nav.export": "\u0627\u0644\u062a\u0635\u062f\u064a\u0631",
    "nav.settings": "\u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a",
    "auth.signIn": "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644",
    "auth.signingIn": "\u062c\u0627\u0631\u064a \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644...",
    "auth.email": "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a",
    "auth.password": "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631",
    "auth.invalidLogin": "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0623\u0648 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u063a\u064a\u0631 \u0635\u062d\u064a\u062d\u0629.",
    "auth.subtitle": "\u0623\u062f\u0631 \u0645\u0644\u0641\u0627\u062a Word \u0648\u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0627\u062a \u0648\u062a\u0635\u062f\u064a\u0631 \u0645\u0648\u0642\u0639\u0643 \u0627\u0644\u062b\u0627\u0628\u062a.",
    "posts.title": "\u0627\u0644\u0645\u0646\u0634\u0648\u0631\u0627\u062a",
    "posts.subtitle": "\u0631\u0627\u062c\u0639 \u0627\u0644\u0645\u0646\u0634\u0648\u0631\u0627\u062a \u0627\u0644\u0645\u062d\u0648\u0644\u0629 \u0645\u0646 Word \u0648\u0623\u062f\u0631 \u062d\u0627\u0644\u0629 \u0627\u0644\u0646\u0634\u0631.",
    "posts.upload": "\u0631\u0641\u0639 Word",
    "posts.uncategorized": "\u0628\u062f\u0648\u0646 \u062a\u0635\u0646\u064a\u0641",
    "posts.empty": "\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0646\u0634\u0648\u0631\u0627\u062a \u0628\u0639\u062f.",
    "table.title": "\u0627\u0644\u0639\u0646\u0648\u0627\u0646",
    "table.slug": "\u0627\u0644\u0631\u0627\u0628\u0637",
    "table.category": "\u0627\u0644\u062a\u0635\u0646\u064a\u0641",
    "table.status": "\u0627\u0644\u062d\u0627\u0644\u0629",
    "table.updated": "\u0622\u062e\u0631 \u062a\u062d\u062f\u064a\u062b",
    "upload.title": "\u0631\u0641\u0639 Word",
    "upload.subtitle": "\u062d\u0648\u0644 \u0645\u0644\u0641 `.docx` \u0625\u0644\u0649 \u0645\u0633\u0648\u062f\u0629 \u0642\u0627\u0628\u0644\u0629 \u0644\u0644\u0645\u0631\u0627\u062c\u0639\u0629.",
    "export.title": "\u0627\u0644\u062a\u0635\u062f\u064a\u0631",
    "export.preview": "\u0645\u0639\u0627\u064a\u0646\u0629 \u0627\u0644\u0645\u0648\u0642\u0639",
    "export.downloadZip": "\u062a\u062d\u0645\u064a\u0644 ZIP",
    "export.description": "\u0623\u0646\u0634\u0626 \u0645\u0644\u0641 ZIP \u0644\u0645\u0648\u0642\u0639 \u062b\u0627\u0628\u062a \u0645\u0646 \u0627\u0644\u0645\u0646\u0634\u0648\u0631\u0627\u062a \u0627\u0644\u0645\u0646\u0634\u0648\u0631\u0629 \u0641\u064a \u0647\u0630\u0647 \u0627\u0644\u0645\u062f\u0648\u0646\u0629.",
    "export.recent": "\u0622\u062e\u0631 \u0639\u0645\u0644\u064a\u0627\u062a \u0627\u0644\u062a\u0635\u062f\u064a\u0631",
    "export.status": "\u0627\u0644\u062d\u0627\u0644\u0629",
    "export.updated": "\u0622\u062e\u0631 \u062a\u062d\u062f\u064a\u062b",
    "export.unavailable": "\u063a\u064a\u0631 \u0645\u062a\u0627\u062d",
    "export.empty": "\u0644\u0627 \u062a\u0648\u062c\u062f \u0639\u0645\u0644\u064a\u0627\u062a \u062a\u0635\u062f\u064a\u0631 \u0628\u0639\u062f.",
    "settings.title": "\u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a",
    "settings.siteLanguage": "\u0644\u063a\u0629 \u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0645\u0646\u0634\u0648\u0631",
    "common.save": "\u062d\u0641\u0638",
  },
};

const statuses: Record<Locale, Record<PostStatus, string>> = {
  en: {
    DRAFT: "Draft",
    IN_REVIEW: "In Review",
    APPROVED: "Approved",
    PUBLISHED: "Published",
    ARCHIVED: "Archived",
  },
  ar: {
    DRAFT: "\u0645\u0633\u0648\u062f\u0629",
    IN_REVIEW: "\u0642\u064a\u062f \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629",
    APPROVED: "\u0645\u0639\u062a\u0645\u062f",
    PUBLISHED: "\u0645\u0646\u0634\u0648\u0631",
    ARCHIVED: "\u0645\u0624\u0631\u0634\u0641",
  },
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
