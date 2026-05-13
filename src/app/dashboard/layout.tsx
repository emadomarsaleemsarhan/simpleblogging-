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
          <div>
            <p className="dashboard-kicker">Blog Publisher</p>
            <span className="dashboard-user">{session.user.email}</span>
          </div>
          <LocaleSwitcher currentLocale={translator.locale} returnTo="/dashboard/posts" />
        </header>
        <div className="dashboard-content">{children}</div>
      </main>
    </div>
  );
}
