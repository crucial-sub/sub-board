"use client";

// 인증 사용자 상태를 저장하는 전역 스토어
import { create } from "zustand";
import type { AuthResponse } from "@/features/auth/api";

export type AuthState = {
	user: AuthResponse["user"] | null;
	hasHydrated: boolean;
	setFromResponse: (payload: AuthResponse) => void;
	setUser: (user: AuthResponse["user"] | null) => void;
	clearAuth: () => void;
	markHydrated: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	hasHydrated: false,
	setFromResponse: (payload) =>
		set({
			user: payload.user,
			hasHydrated: true,
		}),
	setUser: (user) => set({ user, hasHydrated: true }),
	clearAuth: () => set({ user: null, hasHydrated: true }),
	markHydrated: () => set({ hasHydrated: true }),
}));
