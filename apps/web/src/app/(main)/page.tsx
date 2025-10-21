import { HomePageClient } from "./home-page-client";
import { getCurrentUserOnServer } from "@/features/auth/server/get-current-user";
import { fetchUserStatsOnServer } from "@/features/users/server/queries";

export default async function HomePage() {
	const currentUser = await getCurrentUserOnServer();
	const initialStats = currentUser ? await fetchUserStatsOnServer() : null;

	return (
		<HomePageClient initialUser={currentUser} initialStats={initialStats} />
	);
}
