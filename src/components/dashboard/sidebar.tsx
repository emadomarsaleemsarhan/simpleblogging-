import Link from "next/link";

import type { MessageKey } from "@/lib/i18n/locales";

const navigation: { href: string; label: MessageKey }[] = [
  { href: "/dashboard/posts", label: "nav.posts" },
  { href: "/dashboard/posts/upload", label: "nav.upload" },
  { href: "/dashboard/taxonomy", label: "nav.taxonomy" },
  { href: "/dashboard/export", label: "nav.export" },
  { href: "/dashboard/settings", label: "nav.settings" },
];

export function DashboardSidebar({ t }: { t: (key: MessageKey) => string }) {
  return (
    <aside className="dashboard-sidebar">
      <Link href="/dashboard/posts" className="dashboard-brand">
        <span className="dashboard-brand-mark">BP</span>
        <span>
          <strong>Blog Publisher</strong>
          <small>Publisher OS</small>
        </span>
      </Link>
      <p className="dashboard-nav-label">Workspace</p>
      <nav aria-label="Dashboard" className="dashboard-nav">
        {navigation.map((item) => (
          <Link key={item.href} href={item.href} className="dashboard-nav-link">
            {t(item.label)}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
