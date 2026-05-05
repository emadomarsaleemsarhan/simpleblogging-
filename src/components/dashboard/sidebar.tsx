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
        Blog Publisher
      </Link>
      <nav aria-label="Dashboard">
        {navigation.map((item) => (
          <Link key={item.href} href={item.href}>
            {t(item.label)}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
