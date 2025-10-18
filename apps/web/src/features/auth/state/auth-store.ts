"use client";

import { create } from "zustand";
import type { AuthResponse } from "@/features/auth/api";

export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthResponse["user"] | null;
  setAuth: (payload: AuthResponse) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  setAuth: (payload) =>
    set({
      accessToken: payload.tokens.accessToken,
      refreshToken: payload.tokens.refreshToken,
      user: payload.user,
    }),
  clearAuth: () => set({ accessToken: null, refreshToken: null, user: null }),
}));
