"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import {
  Home,
  ClipboardCheck,
  History,
  Calendar,
  BookOpen,
  HandHelping,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/user/dashboard", icon: Home },
  { name: "Check-in", href: "/user/checkin", icon: ClipboardCheck },
  { name: "History", href: "/user/history", icon: History },
  { name: "Jadwal Shift", href: "/user/schedule", icon: Calendar },
  { name: "Jadwal Kuliah", href: "/user/my-course", icon: BookOpen },
  {
    name: "Pengganti Shift",
    href: "/user/coverage-requests",
    icon: HandHelping,
  },
];

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <ProtectedLayout requiredRole="user">
      <div className="min-h-screen bg-background">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed top-0 left-0 z-50 h-full w-64 bg-solid-bg border-r border-solid-surface
            transform transition-transform duration-300 ease-in-out lg:translate-x-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between h-16 px-6 border-b border-solid-surface">
              <h1 className="text-lg font-bold text-solid-dark tracking-tight">
                Absensi Logistik
              </h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-solid-surface/50 transition-colors"
              >
                <X className="h-5 w-5 text-solid-dark" />
              </button>
            </div>

            {/* User Info */}
            <div className="px-5 py-4 border-b border-solid-surface">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-solid-primary flex items-center justify-center text-white font-semibold ring-2 ring-solid-surface">
                  {user?.nama?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-solid-dark truncate">
                    {user?.nama}
                  </p>
                  <p className="text-xs text-solid-dark/60 truncate">
                    @{user?.username}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center px-3 py-2.5 text-sm font-medium rounded-xl
                      transition-all duration-200 group relative
                      ${
                        isActive
                          ? "bg-solid-primary text-white"
                          : "text-solid-dark/80 hover:bg-solid-surface/60 hover:text-solid-dark"
                      }
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-solid-dark rounded-r-full" />
                    )}
                    <Icon
                      className={`mr-3 h-[18px] w-[18px] shrink-0 transition-colors ${isActive ? "text-white" : "text-solid-dark/60 group-hover:text-solid-dark"}`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="p-3 border-t border-solid-surface">
              <Button
                variant="ghost"
                className="w-full justify-start text-solid-primary hover:text-white hover:bg-solid-primary rounded-xl transition-all duration-200"
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-[18px] w-[18px]" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:pl-64">
          {/* Top Bar */}
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/60 bg-background/80 backdrop-blur-md px-4 lg:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground tracking-tight">
                {navigation.find((item) => item.href === pathname)?.name ||
                  "Dashboard"}
              </h2>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-4 lg:p-6 animate-fade-in-up">{children}</main>
        </div>
      </div>
    </ProtectedLayout>
  );
}
