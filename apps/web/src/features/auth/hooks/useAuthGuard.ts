"use client";

// 인증이 필요한 페이지에서 로그인 여부를 확인하고 없으면 로그인 페이지로 이동
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "../state/auth-store";

export function useAuthGuard() {
	const user = useAuthStore((state) => state.user);
	const hasHydrated = useAuthStore((state) => state.hasHydrated);
	const router = useRouter();

	useEffect(() => {
		if (!hasHydrated) {
			return;
		}
		if (!user) {
			router.replace("/login");
		}
	}, [hasHydrated, router, user]);
}
