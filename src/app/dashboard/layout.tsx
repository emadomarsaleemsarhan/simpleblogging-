import type { ReactNode } from "react";

import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { requireSession } from "@/lib/auth";

export default async function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  const session = await requireSession();

  return (
    <div className="dashboard-shell">
      <DashboardSidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <span>{session.user.email}</span>
        </header>
        {children}
      </main>
    </div>
  );
}
