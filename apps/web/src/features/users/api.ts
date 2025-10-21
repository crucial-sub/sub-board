import { apiClient } from "@/lib/api-client";
import type { AuthResponse } from "@/features/auth/api";

export type UserStats = {
	postCount: number;
	commentCount: number;
	topTags: Array<{ name: string; count: number }>;
	lastPost: { id: string; title: string; createdAt: string } | null;
};

export function fetchUserStats() {
	return apiClient.get<UserStats>("/users/me/stats");
}

export type UpdateProfilePayload = {
	nickname?: string;
};

export function updateProfile(payload: UpdateProfilePayload) {
	return apiClient.patch<AuthResponse["user"]>({
		path: "/users/me",
		body: payload,
	});
}
