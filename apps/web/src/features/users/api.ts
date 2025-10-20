import { apiClient } from "@/lib/api-client";

export type UserStats = {
	postCount: number;
	commentCount: number;
	topTags: Array<{ name: string; count: number }>;
	lastPost: { id: string; title: string; createdAt: string } | null;
};

export function fetchUserStats() {
	return apiClient.get<UserStats>("/users/me/stats");
}
