import type { ReactNode } from "react";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { requireSession } from "@/lib/auth";
import { getTranslator } from "@/lib/i18n/server";

export default async function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  const [session, translator] = await Promise.all([requireSession(), getTranslator()]);

  return (
    <div className="dashboard-shell">
      <DashboardSidebar t={translator.t} />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <LocaleSwitcher currentLocale={translator.locale} returnTo="/dashboard/posts" />
          <span>{session.user.email}</span>
        </header>
        {children}
      </main>
    </div>
  );
}
