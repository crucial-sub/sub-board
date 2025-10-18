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
  return apiClient.post<AuthResponse>({ path: "/auth/register", body: payload });
}

export function login(payload: LoginPayload) {
  return apiClient.post<AuthResponse>({ path: "/auth/login", body: payload });
}
