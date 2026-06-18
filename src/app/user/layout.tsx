"use client";

import {
  Home,
  ClipboardCheck,
  History,
  Calendar,
  BookOpen,
  HandHelping,
} from "lucide-react";
import {
  DashboardShell,
  type NavItem,
} from "@/shared/components/layout/dashboard-shell";

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/user/dashboard", icon: Home },
  { name: "Check-in", href: "/user/checkin", icon: ClipboardCheck },
  { name: "Riwayat", href: "/user/history", icon: History },
  { name: "Jadwal Shift", href: "/user/schedule", icon: Calendar },
  { name: "Jadwal Kuliah", href: "/user/my-course", icon: BookOpen },
  { name: "Pengganti Shift", href: "/user/coverage-requests", icon: HandHelping },
];

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell role="user" navigation={navigation}>
      {children}
    </DashboardShell>
  );
}
