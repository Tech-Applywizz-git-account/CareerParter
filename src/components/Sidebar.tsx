"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { LayoutDashboard, FolderTree, Building2, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const Sidebar = () => {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  const navItems = [
    { href: "/", label: "Overview", icon: LayoutDashboard },
    { href: "/role-analysis", label: "Domains", icon: FolderTree },
    { href: "/company-analysis", label: "Companies", icon: Building2 },
    ...(isAdmin
      ? [{ href: "/admin-controls", label: "Admin Controls", icon: Settings }]
      : []),
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r border-border bg-card">
      {/* Header */}
      <div className="px-5 py-6 border-b border-border flex flex-col items-start gap-4">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Career Partner Logo" width={32} height={32} className="rounded-md shadow-sm" />
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            Career Partner
          </h1>
        </div>
        <p className="text-xs text-muted-foreground leading-snug">
          Decision support for global careers
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? "bg-primary/15 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-5 py-4 bg-muted/20">
        <p className="text-xs text-muted-foreground">
          © 2026{" "}
          <span className="font-medium text-foreground">Career Partner</span>
        </p>
      </div>
    </aside>
  );
};
