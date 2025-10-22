"use client";

import { ReactNode } from "react";
import type { AuthResponse } from "@/features/auth/api";
import { AuthStoreProvider } from "@/features/auth/state/auth-store";
import { MotionProvider } from "./motion-provider";

type Props = {
	children: ReactNode;
	initialUser: AuthResponse["user"] | null;
};

export function UiProvider({ children, initialUser }: Props) {
	return (
		<AuthStoreProvider
			initialState={{ user: initialUser, hasHydrated: true }}
		>
			<MotionProvider>{children}</MotionProvider>
		</AuthStoreProvider>
	);
}
