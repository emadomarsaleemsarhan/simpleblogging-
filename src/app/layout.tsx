import type { Metadata } from "next";
import type { ReactNode } from "react";

import { getAdminDirection, getAdminLocale } from "@/lib/i18n/server";

import "./globals.css";

export const metadata: Metadata = {
  title: "Blog Publisher",
  description: "A lightweight publishing workflow for prepared blog content."
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const [locale, direction] = await Promise.all([getAdminLocale(), getAdminDirection()]);

  return (
    <html lang={locale} dir={direction}>
      <body>{children}</body>
    </html>
  );
}
