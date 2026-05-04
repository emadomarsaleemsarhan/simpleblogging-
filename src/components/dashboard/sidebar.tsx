import Link from "next/link";

const navigation = [
  { href: "/dashboard/posts", label: "Posts" },
  { href: "/dashboard/posts/upload", label: "Upload Word" },
  { href: "/dashboard/taxonomy", label: "Categories & Tags" },
  { href: "/dashboard/export", label: "Export" },
  { href: "/dashboard/settings", label: "Settings" },
];

export function DashboardSidebar() {
  return (
    <aside className="dashboard-sidebar">
      <Link href="/dashboard/posts" className="dashboard-brand">
        Blog Publisher
      </Link>
      <nav aria-label="Dashboard">
        {navigation.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
