import { NextResponse } from "next/server";

import { parseLocale } from "@/lib/i18n/locales";
import { ADMIN_LOCALE_COOKIE } from "@/lib/i18n/server";

export async function POST(request: Request) {
  const formData = (await request.formData()) as unknown as { get(name: string): FormDataEntryValue | null };
  const locale = parseLocale(String(formData.get("locale")));
  const returnTo = String(formData.get("returnTo") ?? "/login");
  const safeReturnTo = returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/login";
  const response = NextResponse.redirect(new URL(safeReturnTo, request.url), { status: 303 });

  response.cookies.set(ADMIN_LOCALE_COOKIE, locale, {
    path: "/",
    sameSite: "lax",
  });

  return response;
}
