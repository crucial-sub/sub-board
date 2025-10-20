import "server-only";

import { cookies } from "next/headers";
// SSR 단계에서 현재 로그인한 사용자를 조회하고 필요 시 토큰을 갱신한다
import type { AuthResponse } from "@/features/auth/api";

const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

type ProfileResponse = {
	user: AuthResponse["user"];
};

const COOKIE_OPTIONS = {
	httpOnly: true,
	sameSite: "lax" as const,
	secure: process.env.NODE_ENV === "production",
	path: "/",
};

export async function getCurrentUserOnServer() {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get("sb_access_token");
	const refreshToken = cookieStore.get("sb_refresh_token");

	if (!accessToken && !refreshToken) {
		return null;
	}

	const cookieHeader = cookieStore.toString();

	if (accessToken) {
		try {
			const response = await fetch(`${API_BASE_URL}/auth/profile`, {
				method: "GET",
				headers: {
					cookie: cookieHeader,
				},
				credentials: "include",
				cache: "no-store",
			});

			if (response.ok) {
				const data = (await response.json()) as ProfileResponse;
				return data.user;
			}

			if (response.status !== 401) {
				return null;
			}
		} catch (_error) {
			return null;
		}
	}

	if (!refreshToken) {
		return null;
	}

	try {
		const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
			method: "POST",
			headers: {
				cookie: cookieHeader,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({}),
			credentials: "include",
			cache: "no-store",
		});

		if (!response.ok) {
			return null;
		}

		const data = (await response.json()) as AuthResponse;

cookieStore.set("sb_access_token", data.tokens.accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: data.tokens.accessTokenExpiresIn,
});
cookieStore.set("sb_refresh_token", data.tokens.refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: data.tokens.refreshTokenExpiresIn,
});

		return data.user;
	} catch (_error) {
		return null;
	}
}
