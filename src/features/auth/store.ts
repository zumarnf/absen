import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axiosInstance from "@/shared/lib/axios";
import { User } from "@/shared/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setAuth: (user: User) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },

      // The JWT lives in an httpOnly cookie set by the server; we only keep
      // the (non-secret) user identity client-side for UI gating.
      setAuth: (user) => {
        set({ user, isAuthenticated: true });
      },

      logout: () => {
        // Ask the server to clear the httpOnly cookie (JS cannot remove it).
        void axiosInstance.post("/auth/logout").catch(() => {
          // Ignore network/None errors — local state is cleared regardless.
        });
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      onRehydrateStorage: () => {
        return (state) => {
          state?.setHasHydrated(true);
        };
      },
    },
  ),
);
