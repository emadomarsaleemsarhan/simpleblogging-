"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { parseLocale } from "@/lib/i18n/locales";
import { ADMIN_LOCALE_COOKIE } from "@/lib/i18n/server";

export async function switchLocale(formData: FormData) {
  const locale = parseLocale(String(formData.get("locale")));
  const returnTo = String(formData.get("returnTo") ?? "/login");
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_LOCALE_COOKIE, locale, {
    path: "/",
    sameSite: "lax",
  });

  redirect(returnTo.startsWith("/") ? returnTo : "/login");
}
