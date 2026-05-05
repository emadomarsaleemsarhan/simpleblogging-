import { cookies } from "next/headers";

import { directionForLocale, parseLocale, t, type Locale, type MessageKey } from "./locales";

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
    t: (key: MessageKey) => t(key, locale),
  };
}
