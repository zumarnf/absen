"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store";
import { PageLoader } from "@/shared/components/loader";

interface ProtectedLayoutProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "user";
}

export function ProtectedLayout({
  children,
  requiredRole,
}: ProtectedLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (requiredRole && user?.role !== requiredRole) {
      if (user?.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/user/dashboard");
      }
    }
  }, [isAuthenticated, user, requiredRole, router, _hasHydrated]);

  // Wait for Zustand to rehydrate from localStorage
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageLoader message="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageLoader message="Redirecting..." />
      </div>
    );
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageLoader message="Redirecting to correct dashboard..." />
      </div>
    );
  }

  return <>{children}</>;
}
