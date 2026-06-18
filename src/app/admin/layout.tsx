"use client";

import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Calendar,
  BookOpen,
} from "lucide-react";
import {
  DashboardShell,
  type NavItem,
} from "@/shared/components/layout/dashboard-shell";

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Pengguna", href: "/admin/users", icon: Users },
  { name: "Absensi", href: "/admin/attendance", icon: ClipboardList },
  { name: "Jadwal Shift", href: "/admin/schedules", icon: Calendar },
  { name: "Jadwal Kuliah", href: "/admin/courses", icon: BookOpen },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell role="admin" navigation={navigation}>
      {children}
    </DashboardShell>
  );
}
