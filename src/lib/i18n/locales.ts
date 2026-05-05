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
    "common.save": "Save",
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
    "common.save": "حفظ",
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
    DRAFT: "مسودة",
    IN_REVIEW: "قيد المراجعة",
    APPROVED: "معتمد",
    PUBLISHED: "منشور",
    ARCHIVED: "مؤرشف",
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
