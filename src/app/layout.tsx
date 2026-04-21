"use client";

import { useState, useEffect } from "react";
import { LogOut, User, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { FiltersProvider } from "@/contexts/FiltersContext";
import { Sidebar } from "@/components/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import Link from "next/link";
import clsx from "clsx";
import "./globals.css";
import "flag-icons/css/flag-icons.min.css";

function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut, loading } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [jobPostsTodayCount, setJobPostsTodayCount] = useState<number>(0);

  // FIX THIS LINE - Remove "/" check
  const isAuthPage = pathname === "/auth/set-password";

  // console.log("🟢 Debug:", {
  //   pathname,
  //   isAuthPage,
  //   user: !!user,
  //   shouldFetch: user && !isAuthPage
  // });

  useEffect(() => {


    // This should now work since "/" is not considered an auth page
    if (user && !isAuthPage) {


      const fetchJobPostsToday = async () => {
        try {

          const res = await fetch("/api/job-posts-today?date=today");
          const data = await res.json();


          const count = data.job_posts_today || 0;


          setJobPostsTodayCount(count);
        } catch (error) {
          console.error("❌ Error fetching:", error);
          setJobPostsTodayCount(0);
        }
      };

      fetchJobPostsToday();
    } else {
      console.log("🟡 Not fetching because:", {
        reason: !user ? "No user" : "On auth page",
        user: !!user,
        isAuthPage
      });
    }
  }, [user, isAuthPage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-muted-foreground">Checking session…</p>
        </div>
      </div>
    );
  }

  if (isAuthPage && !user) {
    return <main>{children}</main>;
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 flex-shrink-0 border-r border-border bg-card">
        <SidebarProvider defaultOpen={true}>
          <Sidebar />
        </SidebarProvider>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={clsx(
          "fixed inset-y-0 left-0 w-64 bg-card border-r border-border transform transition-transform duration-300 z-50 lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-5 border-b border-border flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">Career Partner</h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Decision support for global careers
          </p>
        </div>

        {/* Navigation Items */}
        <div className="p-3 space-y-1">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={clsx(
              "block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition-colors",
              pathname === "/"
                ? "bg-primary/15 text-primary font-semibold"
                : "text-muted-foreground",
            )}
          >
            Overview
          </Link>
          <Link
            href="/role-analysis"
            onClick={() => setMobileMenuOpen(false)}
            className={clsx(
              "block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition-colors",
              pathname === "/role-analysis"
                ? "bg-primary/15 text-primary font-semibold"
                : "text-muted-foreground",
            )}
          >
            Domains
          </Link>
          <Link
            href="/company-analysis"
            onClick={() => setMobileMenuOpen(false)}
            className={clsx(
              "block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition-colors",
              pathname === "/company-analysis"
                ? "bg-primary/15 text-primary font-semibold"
                : "text-muted-foreground",
            )}
          >
            Companies
          </Link>
          {user?.role === "admin" && (
            <Link
              href="/admin-controls"
              onClick={() => setMobileMenuOpen(false)}
              className={clsx(
                "block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition-colors",
                pathname === "/admin-controls"
                  ? "bg-primary/15 text-primary font-semibold"
                  : "text-muted-foreground",
              )}
            >
              Admin Controls
            </Link>
          )}
        </div>

        {/* User Info + Signout */}
        {user && (
          <div className="mt-auto border-t border-border p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <User className="h-4 w-4" />
              <span className="truncate">{user.email}</span>
              {user.role && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.role === "admin"
                      ? "bg-destructive/10 text-destructive"
                      : user.role === "lead"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-foreground"
                    }`}
                >
                  {user.role}
                </span>
              )}
            </div>
            <button
              onClick={signOut}
              className="w-full flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground rounded-md px-3 py-2 transition-colors hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Section */}
      <div className="flex-1 flex flex-col">
        {/* Header */}

        {/* Header */}

        <header className="border-b border-border bg-card h-16 flex items-center px-4 sm:px-6 lg:px-8">
          {/* Left: Mobile Menu Button (only on mobile) */}
          <div className="lg:hidden">
            <button
              className="p-3 rounded-md hover:bg-muted text-muted-foreground transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Left side: Status badge instead of red disclaimer */}
          <div className="flex items-center ml-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/50 rounded-full border border-border">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span className="text-sm font-medium text-foreground">
                {jobPostsTodayCount} new roles tracked today
              </span>
            </div>
          </div>

          {/* Right: User info (aligned right) */}
          {user && (
            <div className="ml-auto flex items-center gap-4">
              <div className="flex items-center gap-3 text-base text-muted-foreground">
                <User className="h-5 w-5" />
                <span className="truncate max-w-[150px] sm:max-w-none font-medium">
                  {user.email}
                </span>
                {user.role && (
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${user.role === "admin"
                        ? "bg-destructive/10 text-destructive"
                        : user.role === "lead"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-foreground"
                      }`}
                  >
                    {user.role}
                  </span>
                )}
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-2 text-base text-muted-foreground hover:text-foreground rounded-md px-3 py-2 transition-colors hover:bg-muted"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </header>
        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="bg-card rounded-lg border border-border shadow-sm p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
      </head>
      <body className="antialiased min-h-screen bg-gray-50" suppressHydrationWarning>
        <FiltersProvider>
          <AuthProvider>
            <AppLayout>{children}</AppLayout>
          </AuthProvider>
        </FiltersProvider>
      </body>
    </html>
  );
}
