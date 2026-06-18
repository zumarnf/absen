"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store";
import { PageLoader } from "@/shared/components/loader";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;

    if (isAuthenticated && user) {
      if (user.role === "admin") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/user/dashboard");
      }
    } else {
      router.replace("/login");
    }
  }, [isAuthenticated, user, router, _hasHydrated]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <PageLoader message="Memuat..." />
    </div>
  );
}
