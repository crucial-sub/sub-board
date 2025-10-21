import "server-only";

import type { UserStats } from "@/features/users/api";
import { serverApiFetch } from "@/lib/server-api-client";

export async function fetchUserStatsOnServer(): Promise<UserStats | null> {
	try {
		return await serverApiFetch<UserStats>("/users/me/stats");
	} catch (_error) {
		return null;
	}
}
