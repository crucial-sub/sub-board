"use client";

// 인증 사용자 상태를 저장하고 앱 전역에 배포하는 커스텀 Zustand 스토어
import type { AuthResponse } from "@/features/auth/api";
import { createContext, type ReactNode, useContext, useRef } from "react";
import { useStore } from "zustand";
import { createStore, type StoreApi } from "zustand/vanilla";

export type AuthState = {
	user: AuthResponse["user"] | null;
	hasHydrated: boolean;
	setFromResponse: (payload: AuthResponse) => void;
	setUser: (user: AuthResponse["user"] | null) => void;
	clearAuth: () => void;
	markHydrated: () => void;
};

export type AuthStore = StoreApi<AuthState>;

const AuthStoreContext = createContext<AuthStore | null>(null);

let authStoreClient: AuthStore | null = null;

// 서버가 전달한 초기 세션 값으로 스토어를 생성한다
function createAuthStore(initialState?: Partial<AuthState>): AuthStore {
	return createStore<AuthState>((set) => ({
		user: initialState?.user ?? null,
		hasHydrated: initialState?.hasHydrated ?? initialState?.user !== undefined,
		setFromResponse: (payload) =>
			set({
				user: payload.user,
				hasHydrated: true,
			}),
		setUser: (user) => set({ user, hasHydrated: true }),
		clearAuth: () => set({ user: null, hasHydrated: true }),
		markHydrated: () => set({ hasHydrated: true }),
	}));
}

export function AuthStoreProvider({
	children,
	initialState,
}: {
	children: ReactNode;
	initialState?: Partial<AuthState>;
}) {
	const storeRef = useRef<AuthStore>();

	if (!storeRef.current) {
		storeRef.current = createAuthStore(initialState);
		authStoreClient = storeRef.current;
	} else if (initialState) {
		const nextState: Partial<AuthState> = {};
		if ("user" in initialState) {
			nextState.user = initialState.user ?? null;
		}
		if ("hasHydrated" in initialState) {
			nextState.hasHydrated = initialState.hasHydrated ?? true;
		}
		storeRef.current.setState(nextState);
	}

	return (
		<AuthStoreContext.Provider value={storeRef.current}>
			{children}
		</AuthStoreContext.Provider>
	);
}

export function useAuthStore<T>(selector: (state: AuthState) => T): T {
	const store = useContext(AuthStoreContext);
	if (!store) {
		throw new Error("AuthStoreProvider가 초기화되지 않았습니다.");
	}
	return useStore(store, selector);
}

export function getAuthStoreClient(): AuthStore {
	if (!authStoreClient) {
		throw new Error(
			"AuthStoreProvider가 초기화되기 전에 스토어에 접근했습니다.",
		);
	}
	return authStoreClient;
}
