import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthResponse } from "@/types";

/**
 * Authentication Store
 * - Stores JWT token and user information
 * - NEVER stores passwords
 * - Only persists token, email, role, and user metadata
 */

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: {
    email: string;
    role: "STUDENT" | "MANAGER";
    userId: number;
    fullName: string;
    phoneNumber?: string;
    address?: string;
  } | null;
  userEmail: string | null;
  userRole: "STUDENT" | "MANAGER" | null;
  userId: number | null;
  fullName: string | null;
  hasHydrated: boolean;
  login: (authData: AuthResponse) => void;
  logout: () => void;
  setHasHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      user: null,
      userEmail: null,
      userRole: null,
      userId: null,
      fullName: null,
      hasHydrated: false,
      setHasHydrated: () => set({ hasHydrated: true }),

      /**
       * Login - stores JWT token and user information
       * @param authData - AuthResponse from server containing token and user details
       * NOTE: authData.password is never stored; only token is persisted for auth
       */
      login: (authData: AuthResponse) => {
        const normalizedRole = (authData.role || "").toUpperCase() as
          | "STUDENT"
          | "MANAGER";
        const normalizedId = authData.userId ?? (authData as any).id ?? null;

        // Store JWT token - this is the only credential needed
        if (authData.token) {
          localStorage.setItem("authToken", authData.token);
        }
        if (normalizedRole) {
          localStorage.setItem("userRole", normalizedRole);
        }
        if (authData.email) {
          localStorage.setItem("userEmail", authData.email);
        }

        // Update store state with user info (NO PASSWORD)
        set({
          isAuthenticated: Boolean(authData.token),
          token: authData.token ?? null,
          user: {
            email: authData.email,
            role: normalizedRole,
            userId: normalizedId,
            fullName: authData.fullName,
            phoneNumber: (authData as any).phoneNumber,
            address: (authData as any).address,
          },
          userEmail: authData.email,
          userRole: normalizedRole,
          userId: normalizedId,
          fullName: authData.fullName,
        });
      },

      /**
       * Logout - clears all authentication state
       * - Removes JWT token from localStorage
       * - Clears user information from store
       * - Sets isAuthenticated to false
       */
      logout: () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userEmail");

        set({
          isAuthenticated: false,
          token: null,
          user: null,
          userEmail: null,
          userRole: null,
          userId: null,
          fullName: null,
          hasHydrated: true,
        });
      },
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        // Mark store ready after persisted state loads to avoid auth flicker
        state?.setHasHydrated();
      },
    }
  )
);
