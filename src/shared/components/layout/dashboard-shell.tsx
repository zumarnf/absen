"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { LogOut, Menu, X } from "lucide-react";
import { ProtectedLayout } from "@/shared/components/layout/protected-layout";
import { useAuthStore } from "@/features/auth/store";
import { Button } from "@/components/ui/button";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface DashboardShellProps {
  role: "admin" | "user";
  navigation: NavItem[];
  children: React.ReactNode;
}

export function DashboardShell({
  role,
  navigation,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const activeTitle =
    navigation.find((item) => item.href === pathname)?.name ?? "Dashboard";
  const subtitle =
    role === "admin" ? "Administrator" : `@${user?.username ?? ""}`;

  return (
    <ProtectedLayout requiredRole={role}>
      <div className="min-h-screen bg-background">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
        )}

        {/* Sidebar — ink canvas */}
        <aside
          className={`fixed top-0 left-0 z-50 h-full w-64 bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-out lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            {/* Brand */}
            <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
              <Link href={`/${role}/dashboard`} className="flex flex-col">
                <span className="font-display text-lg text-sidebar-primary">
                  Absensi
                </span>
                <span className="text-[0.625rem] font-medium uppercase tracking-[0.2em] text-sidebar-foreground/50">
                  Logistik
                </span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-md p-2 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:hidden"
                aria-label="Tutup menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User */}
            <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-accent text-sm font-semibold text-sidebar-accent-foreground">
                {user?.nama?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-sidebar-primary">
                  {user?.nama}
                </p>
                <p className="truncate text-xs text-sidebar-foreground/50">
                  {subtitle}
                </p>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`group relative flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-sidebar-primary" />
                    )}
                    <Icon
                      className="mr-3 h-[18px] w-[18px] shrink-0"
                      strokeWidth={1.75}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="border-t border-sidebar-border p-3">
              <Button
                variant="ghost"
                className="w-full justify-start rounded-md text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-[18px] w-[18px]" strokeWidth={1.75} />
                Keluar
              </Button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="lg:pl-64">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-md p-2 text-foreground transition-colors hover:bg-accent lg:hidden"
              aria-label="Buka menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-display text-xl text-foreground">
              {activeTitle}
            </h1>
          </header>

          <main className="animate-fade-in-up p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </ProtectedLayout>
  );
}
