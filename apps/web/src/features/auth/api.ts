// 인증 관련 API 호출 래퍼 함수들
import { apiClient } from "@/lib/api-client";

export type RegisterPayload = {
	loginId: string;
	nickname: string;
	password: string;
};

export type LoginPayload = {
	loginId: string;
	password: string;
};

export type AuthResponse = {
	user: {
		id: string;
		loginId: string;
		nickname: string;
		createdAt: string;
		updatedAt: string;
	};
	tokens: {
		accessToken: string;
		refreshToken: string;
		accessTokenExpiresIn: number;
		refreshTokenExpiresIn: number;
	};
};

export function register(payload: RegisterPayload) {
	return apiClient.post<AuthResponse>({
		path: "/auth/register",
		body: payload,
	});
}

export function login(payload: LoginPayload) {
	return apiClient.post<AuthResponse>({ path: "/auth/login", body: payload });
}

export function refreshSession() {
	return apiClient.post<AuthResponse>({ path: "/auth/refresh", body: {} });
}

export function logout() {
	return apiClient.post<{ success: boolean }>({
		path: "/auth/logout",
		body: {},
	});
}
